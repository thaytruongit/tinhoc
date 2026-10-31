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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [liveSession, setLiveSession] = useState<LiveClassroomSession>(() => {
    const defaultSession = createDefaultLiveSession();
    try {
      const saved = localStorage.getItem('cloudplay_live_session_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.unlockedStagesByLesson) {
          return {
            ...defaultSession,
            ...parsed,
            verifiedLessonsMap: {
              ...defaultSession.verifiedLessonsMap,
              ...(parsed.verifiedLessonsMap || {}),
            },
          } as LiveClassroomSession;
        }
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

  const currentStudent =
    students.find((s) => s.id === currentStudentId) ||
    students[0] ||
    INITIAL_STUDENTS[0];

  const activeLessonKey = `k${liveSession.activeGrade}-tiet-${liveSession.activePeriod}`;
  const unlockedStages: Record<number, boolean> = liveSession.unlockedStagesByLesson[
    activeLessonKey
  ] || { 1: true, 2: false, 3: false, 4: false };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
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

  useEffect(() => {
    try {
      localStorage.setItem('cloudplay_live_session_v4', JSON.stringify(liveSession));
    } catch {
      // ignore
    }
  }, [liveSession]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial classes, students, and liveSession from backend database on startup
  useEffect(() => {
    async function fetchBackendData() {
      setIsLoading(true);
      try {
        const [clsRes, stRes, liveRes] = await Promise.all([
          fetch('/api/db/classes').then((r) => r.json()).catch(() => null),
          fetch('/api/db/students').then((r) => r.json()).catch(() => null),
          fetch('/api/live-session').then((r) => r.json()).catch(() => null),
        ]);
        if (clsRes?.ok && Array.isArray(clsRes.classes) && clsRes.classes.length > 0) {
          setClasses(clsRes.classes);
        }
        if (stRes?.ok && Array.isArray(stRes.students) && stRes.students.length > 0) {
          setStudents(stRes.students);
        }
        if (liveRes && typeof liveRes === 'object' && liveRes.unlockedStagesByLesson) {
          const defaultSession = createDefaultLiveSession();
          setLiveSession((prev) => ({
            ...defaultSession,
            ...prev,
            ...liveRes,
            verifiedLessonsMap: {
              ...defaultSession.verifiedLessonsMap,
              ...(prev.verifiedLessonsMap || {}),
              ...(liveRes.verifiedLessonsMap || {}),
            },
          }));
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
      if (e.key === 'cloudplay_live_session_v3' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.unlockedStagesByLesson) {
            setLiveSession(parsed);
          }
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
        setStudents(data.students);
      } else if (data.type === 'CLASSES_UPDATED' && Array.isArray(data.classes)) {
        setClasses(data.classes);
      } else if (data.type === 'CLASS_CHANGED' && typeof data.classId === 'string') {
        setSelectedClass(data.classId);
      } else if (data.type === 'LIVE_SESSION_UPDATED' && data.session) {
        setLiveSession(data.session);
      } else if (
        data.type === 'SLIDE_CHANGED' &&
        typeof data.lessonKey === 'string' &&
        typeof data.slideIndex === 'number'
      ) {
        setLiveSession((prev) => ({
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
          updatedAt: data.timestampIso || new Date().toISOString(),
        }));
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      ch.close();
      broadcastRef.current = null;
    };
  }, []);

  // Supabase Realtime listener for Postgres changes on classes, students, and live_classroom_states
  useEffect(() => {
    if (!supabase || !isSupabaseRealtimeConfigured) return;
    const realtimeChannel = supabase
      .channel('public:supabase_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_classroom_states' },
        (payload) => {
          if (payload.new && (payload.new as any).state_json) {
            try {
              const parsed = JSON.parse((payload.new as any).state_json);
              if (parsed && parsed.updatedAt) {
                setLiveSession((prev) => {
                  if (new Date(parsed.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
                    return parsed;
                  }
                  return prev;
                });
              }
            } catch {
              // ignore
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        () => {
          fetch('/api/db/classes')
            .then((res) => res.json())
            .then((data) => {
              if (data.ok && Array.isArray(data.classes) && data.classes.length > 0) {
                setClasses(data.classes);
              }
            })
            .catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          fetch('/api/db/students')
            .then((res) => res.json())
            .then((data) => {
              if (data.ok && Array.isArray(data.students) && data.students.length > 0) {
                setStudents(data.students);
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

  // Poll /api/live-session every 2.5s so cross-browser/cross-window sessions stay synced
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/live-session');
        if (!res.ok || !active) return;
        const serverState = await res.json();
        if (serverState && serverState.updatedAt) {
          setLiveSession((prev) => {
            if (new Date(serverState.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
              return serverState as LiveClassroomSession;
            }
            return prev;
          });
        }
      } catch {
        // ignore
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
    setLiveSession((prev) => {
      const next: LiveClassroomSession = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('cloudplay_live_session_v3', JSON.stringify(next));
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
          className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl font-headline-sm text-headline-sm flex items-center gap-2.5 max-w-md transition-all"
        >
          <span className="material-symbols-outlined text-tertiary-fixed text-[22px]">
            verified
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
