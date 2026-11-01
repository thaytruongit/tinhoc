/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { LoginPortal } from './components/LoginPortal';
import { TeacherPortal, type TeacherTab } from './components/TeacherPortal';
import { StudentPortal, type StudentView } from './components/StudentPortal';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  createDefaultLiveSession,
  type ClassroomItem,
  type LiveClassroomSession,
  type StudentRosterItem,
  type LectureSlideDeck,
} from './data/mockCurriculumData';
import {
  auth,
  ensureCloudUserProfile,
  onAuthStateChanged,
  signInWithGooglePopup,
  signOutFirebase,
} from './services/firebaseClient';
import { supabase, isSupabaseRealtimeConfigured } from './lib/supabase';
import {
  ACHIEVEMENT_BADGES,
  triggerSynchronizedCelebration,
} from './utils/soundEffects';
import {
  normalizeLiveSession,
  normalizeStudentRosterList,
  normalizeClassroomList,
  buildEndSlidePresentationState,
} from './utils/slideAndArenaController';
import {
  getAllSlideDecksFromIndexedDb,
  saveSlideDeckToIndexedDb,
  getSlideDeckForLessonFromIndexedDb,
} from './utils/indexedDbSlideStorage';
import {
  stripLargeBlobsForLocalStorage,
  ensureDeckSlideImages,
  filterActiveSlideDecksForMemory,
} from './utils/slideDeckManager';
import {
  buildStageCompletionEvent,
  formatTeacherStageCompletionToast,
  type ActivityStageCode,
} from './utils/realtimeProgressAnalytics';

type AppMode = 'login' | 'student' | 'teacher';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cloudplay_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [classes, setClasses] = useState<ClassroomItem[]>(() => {
    try {
      const saved = localStorage.getItem('cloudplay_classes_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeClassroomList(parsed, INITIAL_CLASSES);
      }
    } catch {
      // ignore
    }
    return INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<StudentRosterItem[]>(() => {
    try {
      const saved = localStorage.getItem('cloudplay_students_roster_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeStudentRosterList(parsed, INITIAL_STUDENTS);
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [liveSession, setLiveSession] = useState<LiveClassroomSession>(() => {
    const defaultSession = createDefaultLiveSession();
    try {
      localStorage.removeItem('cloudplay_live_session_v3');
      localStorage.removeItem('cloudplay_live_session_v4');
      const saved = localStorage.getItem('cloudplay_live_session_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeLiveSession(parsed, defaultSession);
      }
    } catch {
      // ignore
    }
    return defaultSession;
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role');
      const autostart = params.get('autostart');
      if (role === 'teacher') return 'teacher';
      if (role === 'student' || autostart === '1') return 'student';
    }
    return 'login';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>('61008');
  const [teacherActiveTab, setTeacherActiveTab] = useState<TeacherTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as TeacherTab | null;
      if (tab) return tab;
    }
    return 'trang-chu';
  });
  const [studentActiveView, setStudentActiveView] = useState<StudentView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as StudentView | null;
      if (view === 'tro-ly-ai-cu-vang') return 'tro-ly-ai-cu-vang';
    }
    return 'trang-chu';
  });

  const [selectedClass, setSelectedClass] = useState<string>('6A10');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const lastLocalMutationAtRef = useRef<number>(0);

  const currentStudent =
    students.find((s) => s.id === currentStudentId) ||
    students[0] ||
    INITIAL_STUDENTS[0];

  const activeLessonKey = `k${liveSession?.activeGrade || 6}-tiet-${liveSession?.activePeriod || 1}`;
  const unlockedStages: Record<number, boolean> =
    liveSession?.unlockedStagesByLesson?.[activeLessonKey] || {
      1: false,
      2: false,
      3: false,
      4: false,
    };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 5500);
  };

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('cloudplay_dark_mode', String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudplay_students_roster_v4', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudplay_classes_v4', JSON.stringify(classes));
    } catch {
      // ignore
    }
  }, [classes]);

  // Persist slide decks to IndexedDB asynchronously (eliminating 5MB localStorage limit)
  useEffect(() => {
    const decks = liveSession?.lectureSlidesByLesson;
    if (decks && typeof decks === 'object') {
      for (const [k, d] of Object.entries(decks)) {
        if (d && typeof d === 'object') {
          // Do not write lazy placeholder stubs to IndexedDB to preserve full persisted images
          if ((d as any).isLazyLoaded !== false) {
            saveSlideDeckToIndexedDb(k, d as any).catch(() => {});
          }
        }
      }
    }
  }, [liveSession?.lectureSlidesByLesson]);

  // On-demand Lazy Loading hydration for active lesson: loads full high-res images from IndexedDB
  useEffect(() => {
    let isCancelled = false;
    async function hydrateActiveLesson() {
      const currentDeck = liveSession?.lectureSlidesByLesson?.[activeLessonKey];
      const needsHydration =
        !currentDeck ||
        (currentDeck as any).isLazyLoaded === false ||
        (Array.isArray(currentDeck.slides) &&
          currentDeck.slides.some((s: any) => s.isLazyPlaceholder));

      if (needsHydration) {
        try {
          const hydrated = await getSlideDeckForLessonFromIndexedDb(activeLessonKey);
          if (hydrated && !isCancelled) {
            setLiveSession((prev) => {
              const prevDecks = prev.lectureSlidesByLesson || {};
              const nextDecks = {
                ...prevDecks,
                [activeLessonKey]: {
                  ...hydrated,
                  isLazyLoaded: true,
                },
              };
              const governedDecks = filterActiveSlideDecksForMemory(
                nextDecks,
                activeLessonKey
              ) as Record<string, LectureSlideDeck>;
              return {
                ...prev,
                lectureSlidesByLesson: governedDecks,
              };
            });
          }
        } catch {
          // ignore
        }
      }
    }
    hydrateActiveLesson();
    return () => {
      isCancelled = true;
    };
  }, [activeLessonKey]);

  // Persist live session to localStorage with large blob stripping to avoid QuotaExceededError
  useEffect(() => {
    try {
      const sanitizedSession = stripLargeBlobsForLocalStorage(liveSession);
      localStorage.setItem('cloudplay_live_session_v5', JSON.stringify(sanitizedSession));
    } catch {
      // ignore
    }
  }, [liveSession]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial classes, students, liveSession, and dedicated DB slides from backend database
  useEffect(() => {
    async function fetchBackendData() {
      setIsLoading(true);
      try {
        // 1. Immediately hydrate any saved slide decks from IndexedDB (ultra-resilient across page reloads)
        const idbDecks = await getAllSlideDecksFromIndexedDb().catch(() => ({}));
        if (idbDecks && Object.keys(idbDecks).length > 0) {
          const governed = filterActiveSlideDecksForMemory(
            idbDecks,
            activeLessonKey
          ) as Record<string, LectureSlideDeck>;
          setLiveSession((prev) => ({
            ...prev,
            lectureSlidesByLesson: {
              ...(prev.lectureSlidesByLesson || {}),
              ...governed,
            },
          }));
        }

        const [clsRes, stRes, liveRes, slidesRes] = await Promise.all([
          fetch('/api/db/classes')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch('/api/db/students')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch('/api/live-session')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch('/api/db/slides')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);
        if (clsRes?.ok && Array.isArray(clsRes.classes) && clsRes.classes.length > 0) {
          setClasses((prev) => normalizeClassroomList(clsRes.classes, prev));
        } else if (supabase && isSupabaseRealtimeConfigured) {
          const { data: sbClasses } = await supabase.from('classes').select('*');
          if (Array.isArray(sbClasses) && sbClasses.length > 0) {
            setClasses((prev) => normalizeClassroomList(sbClasses, prev));
          }
        }

        if (stRes?.ok && Array.isArray(stRes.students) && stRes.students.length > 0) {
          setStudents((prev) => normalizeStudentRosterList(stRes.students, prev));
        } else if (supabase && isSupabaseRealtimeConfigured) {
          const { data: sbStudents } = await supabase.from('students').select('*');
          if (Array.isArray(sbStudents) && sbStudents.length > 0) {
            setStudents((prev) => normalizeStudentRosterList(sbStudents, prev));
          }
        }

        if (liveRes && typeof liveRes === 'object') {
          setLiveSession((prev) => {
            const normalized = normalizeLiveSession(liveRes, prev);
            const serverDecks =
              slidesRes?.ok && slidesRes.decks && typeof slidesRes.decks === 'object'
                ? slidesRes.decks
                : {};
            const mergedDecks = {
              ...(idbDecks || {}),
              ...(prev.lectureSlidesByLesson || {}),
              ...((normalized.lectureSlidesByLesson as Record<string, any>) || {}),
              ...serverDecks,
            };
            const governedDecks = filterActiveSlideDecksForMemory(
              mergedDecks,
              activeLessonKey
            ) as Record<string, LectureSlideDeck>;
            return {
              ...normalized,
              lectureSlidesByLesson: governedDecks,
            };
          });
        } else if (supabase && isSupabaseRealtimeConfigured) {
          const { data: sbLiveRow } = await supabase
            .from('live_classroom_states')
            .select('state_json')
            .eq('session_key', 'global_live_session')
            .maybeSingle();
          if (sbLiveRow?.state_json) {
            const parsed =
              typeof sbLiveRow.state_json === 'string'
                ? JSON.parse(sbLiveRow.state_json)
                : sbLiveRow.state_json;
            setLiveSession((prev) => normalizeLiveSession(parsed, prev));
          }
        }
      } catch (err) {
        console.warn('Backend db fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBackendData();
  }, []);

  // Listen to BroadcastChannel & storage events for instant cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cloudplay_live_session_v5' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLiveSession((prev) => normalizeLiveSession(parsed, prev));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    if (typeof BroadcastChannel === 'undefined') {
      return () => window.removeEventListener('storage', handleStorage);
    }
    const ch = new BroadcastChannel('cloudplay_realtime_sync');
    broadcastRef.current = ch;

    ch.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'ROSTER_UPDATED' && Array.isArray(data.students)) {
        setStudents((prev) => normalizeStudentRosterList(data.students, prev));
      } else if (data.type === 'CLASSES_UPDATED' && Array.isArray(data.classes)) {
        setClasses((prev) => normalizeClassroomList(data.classes, prev));
      } else if (data.type === 'CLASS_CHANGED' && typeof data.classId === 'string') {
        setSelectedClass(data.classId);
      } else if (data.type === 'LIVE_SESSION_UPDATED' && data.session) {
        setLiveSession((prev) => normalizeLiveSession(data.session, prev));
      } else if (data.type === 'STUDENT_STAGE_COMPLETED' && data.completionEvent) {
        const evt = data.completionEvent;
        setLiveSession((prev) => {
          const prevMap = prev.completedStagesByStudent || {};
          const prevStages = prevMap[evt.studentId] || [];
          const nextStages = prevStages.includes(evt.stage)
            ? prevStages
            : [...prevStages, evt.stage];
          const prevRecent = prev.recentStageCompletions || [];
          const alreadyInRecent = prevRecent.some((item) => item.id === evt.id);
          return {
            ...prev,
            lastStudentStageCompletion: evt,
            recentStageCompletions: alreadyInRecent
              ? prevRecent
              : [evt, ...prevRecent].slice(0, 15),
            completedStagesByStudent: {
              ...prevMap,
              [evt.studentId]: nextStages,
            },
            updatedAt: evt.timestampIso || new Date().toISOString(),
          };
        });
      } else if (data.type === 'SLIDE_ENDED' && typeof data.lessonKey === 'string') {
        lastLocalMutationAtRef.current = Date.now();
        setLiveSession((prev) => buildEndSlidePresentationState(prev, data.lessonKey));
      } else if (
        data.type === 'SLIDE_CHANGED' &&
        typeof data.lessonKey === 'string' &&
        typeof data.slideIndex === 'number'
      ) {
        lastLocalMutationAtRef.current = Date.now();
        setLiveSession((prev) => {
          const incomingVer =
            typeof data.slideSyncVersion === 'number' ? data.slideSyncVersion : Date.now();
          const currentVer = prev.slideSyncVersionByLesson?.[data.lessonKey] ?? 0;
          if (incomingVer < currentVer) {
            return prev;
          }
          return {
            ...prev,
            isBroadcasting: true,
            activeGrade: data.grade || prev.activeGrade,
            activePeriod: data.period || prev.activePeriod,
            activeClassId: data.classId || prev.activeClassId,
            activeLiveView: data.activeLiveView || 'slide',
            unlockedSlideDeckByLesson: {
              ...(prev.unlockedSlideDeckByLesson || {}),
              [data.lessonKey]: true,
            },
            unlockedStagesByLesson: {
              ...(prev.unlockedStagesByLesson || {}),
              [data.lessonKey]: {
                1: false,
                2: false,
                3: false,
                4: false,
              },
            },
            unlockedPracticeStage3ByLesson: {
              ...(prev.unlockedPracticeStage3ByLesson || {}),
              [data.lessonKey]: false,
            },
            activeSlideIndexByLesson: {
              ...(prev.activeSlideIndexByLesson || {}),
              [data.lessonKey]: data.slideIndex,
            },
            slideSyncVersionByLesson: {
              ...(prev.slideSyncVersionByLesson || {}),
              [data.lessonKey]: incomingVer,
            },
            updatedAt: data.timestampIso || new Date().toISOString(),
          };
        });
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      ch.close();
      broadcastRef.current = null;
    };
  }, []);

  // Real-time Toast notification alert for Teacher when any Student completes an activity stage
  const lastNotifiedStageCompletionIdRef = useRef<string | null>(
    liveSession?.lastStudentStageCompletion?.id || null
  );

  useEffect(() => {
    const completionEvt = liveSession?.lastStudentStageCompletion;
    if (!completionEvt || !completionEvt.id) return;
    if (lastNotifiedStageCompletionIdRef.current === completionEvt.id) return;
    lastNotifiedStageCompletionIdRef.current = completionEvt.id;

    if (appMode === 'teacher') {
      triggerSynchronizedCelebration('xp');
      showToast(formatTeacherStageCompletionToast(completionEvt));
    }
  }, [liveSession?.lastStudentStageCompletion, appMode]);

  // Supabase Realtime listener for Postgres changes on classes, students, and live_classroom_states
  useEffect(() => {
    if (!supabase || !isSupabaseRealtimeConfigured) return;
    const realtimeChannel = supabase
      .channel('public:supabase_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_classroom_states' },
        (payload) => {
          if (Date.now() - lastLocalMutationAtRef.current < 2800) return;
          const row = payload.new as any;
          if (!row || !row.state_json) return;
          // Ignore diagnostic or keep-alive heartbeat rows so they never corrupt liveSession!
          if (row.session_key && row.session_key !== 'global_live_session') return;
          try {
            const parsed =
              typeof row.state_json === 'string' ? JSON.parse(row.state_json) : row.state_json;
            if (parsed && parsed.updatedAt) {
              setLiveSession((prev) => {
                if (new Date(parsed.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
                  return normalizeLiveSession(parsed, prev);
                }
                return prev;
              });
            }
          } catch {
            // ignore
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        async () => {
          if (supabase && isSupabaseRealtimeConfigured) {
            const { data } = await supabase.from('classes').select('*');
            if (Array.isArray(data) && data.length > 0) {
              setClasses((prev) => normalizeClassroomList(data, prev));
              return;
            }
          }
          fetch('/api/db/classes')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.ok && Array.isArray(data.classes) && data.classes.length > 0) {
                setClasses((prev) => normalizeClassroomList(data.classes, prev));
              }
            })
            .catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        async () => {
          if (supabase && isSupabaseRealtimeConfigured) {
            const { data } = await supabase.from('students').select('*');
            if (Array.isArray(data) && data.length > 0) {
              setStudents((prev) => normalizeStudentRosterList(data, prev));
              return;
            }
          }
          fetch('/api/db/students')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.ok && Array.isArray(data.students) && data.students.length > 0) {
                setStudents((prev) => normalizeStudentRosterList(data.students, prev));
              }
            })
            .catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Poll /api/live-session every 2.5s with backoff for static hosts like GitHub Pages
  useEffect(() => {
    let active = true;
    let consecutiveErrors = 0;
    const poll = async () => {
      if (consecutiveErrors >= 3) return;
      if (Date.now() - lastLocalMutationAtRef.current < 2800) return;
      const pollStartAt = Date.now();
      try {
        const res = await fetch('/api/live-session');
        if (!res.ok) {
          consecutiveErrors++;
          return;
        }
        consecutiveErrors = 0;
        if (!active) return;
        // If a local mutation occurred while this poll request was in-flight, discard stale response!
        if (pollStartAt < lastLocalMutationAtRef.current || Date.now() - lastLocalMutationAtRef.current < 2800) {
          return;
        }
        const serverState = await res.json();
        if (serverState && serverState.updatedAt) {
          setLiveSession((prev) => {
            if (new Date(serverState.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
              return normalizeLiveSession(serverState, prev);
            }
            return prev;
          });
        }
      } catch {
        consecutiveErrors++;
      }
    };
    const timer = window.setInterval(poll, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const updateAndBroadcastLiveSession = (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => {
    lastLocalMutationAtRef.current = Date.now();
    setLiveSession((prev) => {
      const next: LiveClassroomSession = normalizeLiveSession(
        {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        },
        prev
      );
      try {
        localStorage.setItem('cloudplay_live_session_v5', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'LIVE_SESSION_UPDATED',
          session: next,
        });
      }
      fetch('/api/live-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {});
      if (supabase && isSupabaseRealtimeConfigured) {
        supabase
          .from('live_classroom_states')
          .upsert(
            {
              session_key: 'global_live_session',
              state_json: JSON.stringify(next),
              updated_at: next.updatedAt,
            },
            { onConflict: 'session_key' }
          )
          .then(() => {});
      }
      return next;
    });
  };

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const isTeacherEmail = user.email === 'manhtruongdo1984@gmail.com';
        try {
          await ensureCloudUserProfile({
            uid: user.uid,
            displayName:
              user.displayName ||
              (isTeacherEmail ? 'Thầy Đỗ Mạnh Trường' : currentStudent.name),
            studentCode: isTeacherEmail ? 'GV001' : currentStudent.id,
            classId: selectedClass,
            role: isTeacherEmail ? 'teacher' : 'student',
            xp: currentStudent.xp,
            streakDays: currentStudent.streakDays,
            stars: currentStudent.stars,
            groupNumber: currentStudent.groupNumber,
            partnerName: currentStudent.partnerName,
          });
        } catch {
          // handled by firebaseClient
        }
      }
    });
    return () => unsub();
  }, [currentStudent, selectedClass]);

  const broadcastStudents = (updated: StudentRosterItem[]) => {
    try {
      localStorage.setItem('cloudplay_students_roster_v4', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type: 'ROSTER_UPDATED',
        students: updated,
      });
    }
  };

  const handleAddStudents = async (newStudents: StudentRosterItem[]) => {
    setStudents((prev) => {
      const existingIds = new Set(newStudents.map((s) => s.id));
      const updated = [...newStudents, ...prev.filter((s) => !existingIds.has(s.id))];
      broadcastStudents(updated);
      return updated;
    });
    for (const st of newStudents) {
      try {
        await fetch('/api/db/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(st),
        });
      } catch (err) {
        console.warn('Failed to save student to DB:', err);
      }
    }
  };

  const handleAddClass = async (newClass: ClassroomItem) => {
    setClasses((prev) => {
      const exists = prev.some((c) => c.id === newClass.id);
      const updated = exists ? prev : [...prev, newClass];
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'CLASSES_UPDATED',
          classes: updated,
        });
      }
      return updated;
    });
    try {
      await fetch('/api/db/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
    } catch (err) {
      console.warn('Failed to save class to DB:', err);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== classId);
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'CLASSES_UPDATED',
          classes: updated,
        });
      }
      return updated;
    });
    if (selectedClass === classId) {
      const remaining = classes.filter((c) => c.id !== classId);
      if (remaining.length > 0) {
        setSelectedClass(remaining[0].id);
      }
    }
    showToast(`Đã xóa lớp học ${classId} thành công!`);
    try {
      await fetch(`/api/db/classes/${classId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete class from DB:', err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      broadcastStudents(updated);
      return updated;
    });
    showToast(`Đã xóa tài khoản học sinh (${studentId}) thành công!`);
    try {
      await fetch(`/api/db/students/${studentId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete student from DB:', err);
    }
  };

  const handleDeleteClassStudents = async (classId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.classId !== classId);
      broadcastStudents(updated);
      return updated;
    });
    showToast(`Đã xóa toàn bộ tài khoản học sinh thuộc lớp ${classId}!`);
    try {
      await fetch(`/api/db/students/class/${classId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete class students from DB:', err);
    }
  };

  const handleUnlockStage = (
    stage: 1 | 2 | 3 | 4,
    grade: 6 | 7 | 8 | 9 = liveSession.activeGrade,
    period: number = liveSession.activePeriod
  ) => {
    const lessonKey = `k${grade}-tiet-${period}`;
    updateAndBroadcastLiveSession((prev) => {
      const currentLessonStages = prev.unlockedStagesByLesson[lessonKey] || {
        1: true,
        2: false,
        3: false,
        4: false,
      };
      return {
        ...prev,
        isBroadcasting: true,
        activeGrade: grade,
        activePeriod: period,
        activeStage: stage,
        unlockedStagesByLesson: {
          ...prev.unlockedStagesByLesson,
          [lessonKey]: {
            ...currentLessonStages,
            1: true,
            [stage]: true,
          },
        },
      };
    });
  };

  const handleAwardXp = (deltaXp: number) => {
    const oldXp = currentStudent.xp;
    const newXp = oldXp + deltaXp;
    const newStars = deltaXp >= 40 ? currentStudent.stars + 1 : currentStudent.stars;

    // Check if the student just unlocked a new Achievement Badge or reached a 100-XP milestone
    const newlyUnlockedBadge = ACHIEVEMENT_BADGES.find(
      (b) => oldXp < b.xpRequired && newXp >= b.xpRequired
    );
    const crossedHundredMilestone = Math.floor(newXp / 100) > Math.floor(oldXp / 100);

    if (newlyUnlockedBadge) {
      triggerSynchronizedCelebration('badge');
      showToast(
        `🏅 Chúc mừng ${currentStudent.name}! Em vừa mở khóa Huy hiệu "${newlyUnlockedBadge.name}" (${newXp} XP)!`
      );
    } else if (crossedHundredMilestone || deltaXp >= 15) {
      triggerSynchronizedCelebration('xp');
    }

    const updatedStudent: StudentRosterItem = {
      ...currentStudent,
      xp: newXp,
      stars: newStars,
      submissionStatus: 'Đã nộp' as const,
    };

    const updated = students.map((st) =>
      st.id === currentStudent.id ? updatedStudent : st
    );
    setStudents(updated);
    broadcastStudents(updated);

    // Sync updated student XP & stars to Cloud Database
    fetch('/api/db/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStudent),
    }).catch(() => {});

    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentStudent.id,
        deltaXp,
        newXp,
        newStars,
        timestamp: Date.now(),
      }),
    }).catch(() => {});

    // Emit real-time stage completion alert to Teacher Portal
    const inferredStage: ActivityStageCode =
      deltaXp <= 20
        ? 1
        : deltaXp === 40
        ? 2
        : deltaXp >= 50
        ? 3
        : (liveSession?.activeStage as ActivityStageCode) || 4;

    const completionEvent = buildStageCompletionEvent({
      student: currentStudent,
      period: liveSession?.activePeriod || 1,
      lessonTitle: `Tiết ${liveSession?.activePeriod || 1}`,
      stage: inferredStage,
      score: currentStudent.avgScore,
      xpEarned: deltaXp,
    });

    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type: 'STUDENT_STAGE_COMPLETED',
        completionEvent,
      });
    }

    updateAndBroadcastLiveSession((prev) => {
      const prevMap = prev.completedStagesByStudent || {};
      const existingStages = prevMap[currentStudent.id] || [];
      const nextStages = existingStages.includes(inferredStage)
        ? existingStages
        : [...existingStages, inferredStage];
      const prevRecent = prev.recentStageCompletions || [];
      return {
        ...prev,
        lastStudentStageCompletion: completionEvent,
        recentStageCompletions: [completionEvent, ...prevRecent].slice(0, 15),
        completedStagesByStudent: {
          ...prevMap,
          [currentStudent.id]: nextStages,
        },
      };
    });
  };

  const handleUpdateStudentScore = (studentId: string, newScore: number) => {
    const clamped = Math.max(0, Math.min(10, Number(newScore.toFixed(1))));
    let updatedTarget: StudentRosterItem | null = null;
    const updated = students.map((st) => {
      if (st.id === studentId) {
        updatedTarget = {
          ...st,
          avgScore: clamped,
          submissionStatus: 'Đã nộp' as const,
        };
        return updatedTarget;
      }
      return st;
    });
    setStudents(updated);
    broadcastStudents(updated);

    if (updatedTarget) {
      fetch('/api/db/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTarget),
      }).catch(() => {});
    }
  };

  const handleLoginStudent = (student: StudentRosterItem) => {
    setCurrentStudentId(student.id);
    setSelectedClass(student.classId);
    setAppMode('student');
    setStudentActiveView('trang-chu');
  };

  const handleLoginTeacher = (_username: string) => {
    setAppMode('teacher');
    setTeacherActiveTab('trang-chu');
  };

  const handleGoogleLogin = async (role: 'student' | 'teacher') => {
    try {
      const user = await signInWithGooglePopup();
      if (user) {
        showToast(`Đã xác thực Google Cloud: ${user.displayName || user.email}`);
        setAppMode(role);
      }
    } catch {
      showToast('Đang mở phiên đăng nhập trực tuyến CloudPlay OS...');
      setAppMode(role);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth?.currentUser) {
        await signOutFirebase();
      }
    } catch {
      // ignore
    }
    setAppMode('login');
    showToast('Đã đăng xuất khỏi phiên trực tuyến CloudPlay OS.');
  };

  const handleResetAcademicYear = async () => {
    try {
      const res = await fetch('/api/db/reset-academic-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (data?.ok && Array.isArray(data.students) && data.students.length > 0) {
        setStudents(data.students);
        broadcastStudents(data.students);
      } else {
        setStudents((prev) => {
          const cleaned = prev.map((st) => ({
            ...st,
            xp: 0,
            stars: 0,
            streakDays: 0,
            avgScore: 0,
            submissionStatus: 'Chưa nộp' as const,
          }));
          broadcastStudents(cleaned);
          return cleaned;
        });
      }

      updateAndBroadcastLiveSession((prev) => ({
        ...prev,
        isBroadcasting: false,
        taughtPeriodsByClass: {},
        learnedPeriodsByStudent: {},
      }));

      showToast(
        '🎉 Đã làm sạch toàn bộ XP, Điểm số, Sao và Bài nộp về 0 cho toàn trường — Sẵn sàng Khai giảng năm học mới!'
      );
    } catch {
      setStudents((prev) => {
        const cleaned = prev.map((st) => ({
          ...st,
          xp: 0,
          stars: 0,
          streakDays: 0,
          avgScore: 0,
          submissionStatus: 'Chưa nộp' as const,
        }));
        broadcastStudents(cleaned);
        return cleaned;
      });
      showToast('🎉 Đã làm sạch toàn bộ XP & Điểm số về 0 — Sẵn sàng Khai giảng năm học mới!');
    }
  };

  const handleSyncCloudNow = async () => {
    try {
      const [syncRes] = await Promise.all([
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: selectedClass,
            rosterCount: students.length,
            timestamp: Date.now(),
          }),
        }),
        fetch('/api/live-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(liveSession),
        }),
      ]);
      if (syncRes.ok) {
        showToast(
          `☁️ Đã đồng bộ toàn bộ CSDL (${classes.length} lớp, ${students.length} học sinh & phiên Live) lên Cloud DB!`
        );
      } else {
        showToast('Đã đồng bộ toàn bộ dữ liệu lên Cloud DB thành công!');
      }
    } catch {
      showToast('Đã đồng bộ dữ liệu lên Cloud DB!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      {appMode === 'login' && (
        <LoginPortal
          onLoginStudent={handleLoginStudent}
          onLoginTeacher={handleLoginTeacher}
          onGoogleLogin={handleGoogleLogin}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onShowToast={showToast}
          students={students}
          classes={classes}
          isLoading={isLoading}
        />
      )}

      {appMode === 'teacher' && (
        <TeacherPortal
          activeTab={teacherActiveTab}
          onChangeTab={setTeacherActiveTab}
          selectedClass={selectedClass}
          onChangeClass={(cls) => {
            setSelectedClass(cls);
            updateAndBroadcastLiveSession((prev) => ({
              ...prev,
              activeClassId: cls,
            }));
            if (broadcastRef.current) {
              broadcastRef.current.postMessage({
                type: 'CLASS_CHANGED',
                classId: cls,
              });
            }
          }}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onSyncCloudNow={handleSyncCloudNow}
          onShowToast={showToast}
          students={students}
          onAddStudents={handleAddStudents}
          onUpdateStudentScore={handleUpdateStudentScore}
          onDeleteStudent={handleDeleteStudent}
          onDeleteClassStudents={handleDeleteClassStudents}
          classes={classes}
          onAddClass={handleAddClass}
          onDeleteClass={handleDeleteClass}
          unlockedStages={unlockedStages}
          onUnlockStage={handleUnlockStage}
          liveSession={liveSession}
          onUpdateLiveSession={updateAndBroadcastLiveSession}
          onSwitchToStudentPreview={() => setAppMode('student')}
          onResetAcademicYear={handleResetAcademicYear}
          isLoading={isLoading}
        />
      )}

      {appMode === 'student' && (
        <StudentPortal
          currentStudent={currentStudent}
          students={students}
          onSelectStudentAccount={(st) => {
            setCurrentStudentId(st.id);
            setSelectedClass(st.classId);
          }}
          activeView={studentActiveView}
          onChangeView={setStudentActiveView}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onAwardXp={handleAwardXp}
          onShowToast={showToast}
          liveSession={liveSession}
          onUpdateLiveSession={updateAndBroadcastLiveSession}
          onSwitchToTeacherPortal={() => setAppMode('teacher')}
        />
      )}

      {/* Global Tactile Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-indigo-950 text-white border border-indigo-400/50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 max-w-lg transition-all"
        >
          <span className="material-symbols-outlined text-emerald-400 text-[22px] shrink-0">
            notifications_active
          </span>
          <span className="leading-snug flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Đóng thông báo"
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
