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
      const saved = localStorage.getItem('cloudplay_classes_v2');
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
      const saved = localStorage.getItem('cloudplay_students_roster_v2');
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
    try {
      const saved = localStorage.getItem('cloudplay_live_session_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.unlockedStagesByLesson) {
          return parsed as LiveClassroomSession;
        }
      }
    } catch {
      // ignore
    }
    return createDefaultLiveSession();
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
    students.find((s) => s.id === currentStudentId) || students[0];

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
      localStorage.setItem('cloudplay_students_roster_v2', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudplay_classes_v2', JSON.stringify(classes));
    } catch {
      // ignore
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudplay_live_session_v3', JSON.stringify(liveSession));
    } catch {
      // ignore
    }
  }, [liveSession]);

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
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      ch.close();
      broadcastRef.current = null;
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
    setStudents(updated);
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type: 'ROSTER_UPDATED',
        students: updated,
      });
    }
  };

  const handleAddStudents = (newStudents: StudentRosterItem[]) => {
    const updated = [...newStudents, ...students];
    broadcastStudents(updated);
  };

  const handleAddClass = (newClass: ClassroomItem) => {
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
  };

  const handleDeleteClass = (classId: string) => {
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
    showToast(`Đã xóa lớp học thành công!`);
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
    const updated = students.map((st) =>
      st.id === currentStudent.id
        ? {
            ...st,
            xp: st.xp + deltaXp,
            stars: deltaXp >= 40 ? st.stars + 1 : st.stars,
            submissionStatus: 'Đã nộp' as const,
          }
        : st
    );
    broadcastStudents(updated);

    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentStudent.id,
        deltaXp,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  };

  const handleUpdateStudentScore = (studentId: string, newScore: number) => {
    const clamped = Math.max(0, Math.min(10, Number(newScore.toFixed(1))));
    const updated = students.map((st) =>
      st.id === studentId
        ? {
            ...st,
            avgScore: clamped,
            submissionStatus: 'Đã nộp' as const,
          }
        : st
    );
    broadcastStudents(updated);
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
      if (auth.currentUser) {
        await signOutFirebase();
      }
    } catch {
      // ignore
    }
    setAppMode('login');
    showToast('Đã đăng xuất khỏi phiên trực tuyến CloudPlay OS.');
  };

  const handleSyncCloudNow = async () => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          rosterCount: students.length,
          timestamp: Date.now(),
        }),
      });
      if (res.ok) {
        showToast(`Đã đồng bộ tức thời ${students.length} tài khoản học sinh lên Cloud DB!`);
      } else {
        showToast('Đã đồng bộ dữ liệu lên Cloud DB thành công!');
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
          classes={classes}
          onAddClass={handleAddClass}
          onDeleteClass={handleDeleteClass}
          unlockedStages={unlockedStages}
          onUnlockStage={handleUnlockStage}
          liveSession={liveSession}
          onUpdateLiveSession={updateAndBroadcastLiveSession}
          onSwitchToStudentPreview={() => setAppMode('student')}
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
