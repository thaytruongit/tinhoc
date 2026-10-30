import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { sanitizeId, sanitizeString } from '../utils/pedagogyEngine';

let app: any = null;
let authInstance: any = null;
let firestoreDbInstance: any = null;
let googleAuthProviderInstance: any = null;

try {
  if (firebaseConfig && (firebaseConfig as any).apiKey) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    try {
      firestoreDbInstance = (firebaseConfig as any).firestoreDatabaseId
        ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
        : getFirestore(app);
    } catch {
      try {
        firestoreDbInstance = getFirestore(app);
      } catch {
        firestoreDbInstance = null;
      }
    }
    googleAuthProviderInstance = new GoogleAuthProvider();
  }
} catch (fbInitErr) {
  console.warn('[CloudPlay Notice] Firebase initialization safely bypassed or using fallback:', fbInitErr);
}

export const auth = authInstance;
export const firestoreDb = firestoreDbInstance;
export const googleAuthProvider = googleAuthProviderInstance;

// Keep Firebase Auth ID token strictly in memory (never in localStorage)
let inMemoryIdToken: string | null = null;

if (auth) {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          inMemoryIdToken = await user.getIdToken();
        } catch {
          inMemoryIdToken = null;
        }
      } else {
        inMemoryIdToken = null;
      }
    });
  } catch (err) {
    console.warn('onAuthStateChanged notice:', err);
  }
}

export async function getAuthBearerHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth?.currentUser) {
    try {
      inMemoryIdToken = await auth.currentUser.getIdToken();
    } catch {
      // use cached token if refresh fails
    }
  }
  if (inMemoryIdToken) {
    headers.Authorization = `Bearer ${inMemoryIdToken}`;
  }
  return headers;
}

export async function signInWithGooglePopup(): Promise<User | null> {
  if (!auth || !googleAuthProvider) {
    console.warn('Firebase Auth/Provider is not configured on this environment.');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    if (result.user) {
      inMemoryIdToken = await result.user.getIdToken();
    }
    return result.user;
  } catch (err) {
    console.warn('Google Popup sign-in notice:', err);
    return null;
  }
}

export async function signOutFirebase(): Promise<void> {
  inMemoryIdToken = null;
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  }
}

export { onAuthStateChanged, type User };

export async function ensureCloudUserProfile(params: {
  uid: string;
  displayName: string;
  studentCode: string;
  classId: string;
  role: 'student' | 'teacher';
  xp: number;
  streakDays: number;
  stars: number;
  groupNumber: number;
  partnerName: string;
}): Promise<void> {
  if (!auth.currentUser) return;
  const safeUid = sanitizeId(params.uid, auth.currentUser.uid);
  if (safeUid !== auth.currentUser.uid) return;

  try {
    const headers = await getAuthBearerHeaders();
    await fetch('/api/db/users/profile', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        displayName: sanitizeString(params.displayName, 80, 'Học sinh CloudPlay'),
        studentCode: sanitizeId(params.studentCode, '61008').slice(0, 32),
        classId: sanitizeId(params.classId, '6A10').slice(0, 16),
        role: params.role,
        xp: Math.max(0, Math.min(1000000, Math.round(params.xp))),
        streakDays: Math.max(0, Math.min(3650, Math.round(params.streakDays))),
        stars: Math.max(0, Math.min(10000, Math.round(params.stars))),
        groupNumber: Math.max(1, Math.min(4, Math.round(params.groupNumber))),
        partnerName: sanitizeString(params.partnerName, 80, 'Nguyễn Bảo An'),
      }),
    });
  } catch (error) {
    console.warn('Could not sync user profile to SQL database:', error);
  }
}

export async function submitWorksheetToCloud(params: {
  submissionId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  lessonId: string;
  stageId: number;
  score: number;
  status: 'in_progress' | 'submitted';
  answersSummary: string;
}): Promise<boolean> {
  try {
    const headers = await getAuthBearerHeaders();
    const res = await fetch('/api/db/worksheets/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        submissionId: sanitizeId(params.submissionId, `sub_${Date.now()}`),
        studentName: sanitizeString(params.studentName, 80, 'Trần Minh'),
        studentCode: sanitizeId(params.studentCode, '61008').slice(0, 32),
        classId: sanitizeId(params.classId, '6A10').slice(0, 16),
        lessonId: sanitizeId(params.lessonId, 'tiet_1').slice(0, 64),
        stageId: Math.max(1, Math.min(4, Math.round(params.stageId))),
        score: Math.max(0, Math.min(10, Number(params.score.toFixed(1)))),
        status: params.status,
        answersSummary: sanitizeString(params.answersSummary, 2000, 'Đã hoàn thành phiếu học tập'),
      }),
    });
    return res.ok;
  } catch (error) {
    console.warn('Could not submit worksheet to SQL database:', error);
    return false;
  }
}

export async function submitWordCloudToCloud(params: {
  word: string;
  authorName: string;
  classId: string;
  lessonId: string;
}): Promise<boolean> {
  try {
    const headers = await getAuthBearerHeaders();
    const res = await fetch('/api/db/wordcloud', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        entryId: sanitizeId(`wc_${Date.now()}`),
        authorName: sanitizeString(params.authorName, 80, 'Em Minh'),
        classId: sanitizeId(params.classId, '6A10').slice(0, 16),
        lessonId: sanitizeId(params.lessonId, 'tiet_1').slice(0, 64),
        word: sanitizeString(params.word, 60, 'Mây đen'),
      }),
    });
    return res.ok;
  } catch (error) {
    console.warn('Could not submit word cloud entry to SQL database:', error);
    return false;
  }
}

export function subscribeClassWordCloud(
  classId: string,
  onEntries: (words: { word: string; authorName: string }[]) => void
): () => void {
  let active = true;
  const safeClass = sanitizeId(classId, '6A10').slice(0, 16);

  const fetchWords = async () => {
    try {
      const res = await fetch(`/api/db/wordcloud?classId=${encodeURIComponent(safeClass)}`);
      if (!res.ok || !active) return;
      const data = await res.json();
      if (Array.isArray(data.entries)) {
        onEntries(data.entries);
      }
    } catch {
      // ignore polling network errors
    }
  };

  fetchWords();
  const intervalId = window.setInterval(fetchWords, 4000);

  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
}
