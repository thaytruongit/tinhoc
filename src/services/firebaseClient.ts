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
import { sanitizeId, sanitizeString } from '../utils/pedagogyEngine';

const optionalFirebaseConfigModules =
  typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function'
    ? (import.meta as any).glob('../../firebase-applet-config.json', { eager: true })
    : {};

const loadedAppletConfig: Record<string, any> =
  (Object.values(optionalFirebaseConfigModules)[0] as any)?.default ||
  (Object.values(optionalFirebaseConfigModules)[0] as any) ||
  {};

const getViteEnv = (key: string): string => {
  try {
    return (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) || '';
  } catch {
    return '';
  }
};

const firebaseConfig: Record<string, any> = {
  projectId: getViteEnv('VITE_FIREBASE_PROJECT_ID') || loadedAppletConfig.projectId || '',
  appId: getViteEnv('VITE_FIREBASE_APP_ID') || loadedAppletConfig.appId || '',
  apiKey: getViteEnv('VITE_FIREBASE_API_KEY') || loadedAppletConfig.apiKey || '',
  authDomain: getViteEnv('VITE_FIREBASE_AUTH_DOMAIN') || loadedAppletConfig.authDomain || '',
  firestoreDatabaseId:
    getViteEnv('VITE_FIREBASE_DATABASE_ID') || loadedAppletConfig.firestoreDatabaseId || '',
  storageBucket: getViteEnv('VITE_FIREBASE_STORAGE_BUCKET') || loadedAppletConfig.storageBucket || '',
  messagingSenderId:
    getViteEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || loadedAppletConfig.messagingSenderId || '',
};

let app: any = null;
let authInstance: any = null;
let firestoreDbInstance: any = null;
let googleAuthProviderInstance: any = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    try {
      firestoreDbInstance = firebaseConfig.firestoreDatabaseId
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    } catch {
      try {
        firestoreDbInstance = getFirestore(app);
      } catch {
        firestoreDbInstance = null;
      }
    }
    googleAuthProviderInstance = new GoogleAuthProvider();
    googleAuthProviderInstance.addScope('https://www.googleapis.com/auth/spreadsheets');
  }
} catch (fbInitErr) {
  console.warn('[CloudPlay Notice] Firebase initialization safely bypassed or using fallback:', fbInitErr);
}

export const firebaseApp = app;
export const auth = authInstance;
export const firestoreDb = firestoreDbInstance;
export const googleAuthProvider = googleAuthProviderInstance;

// Keep Firebase Auth ID token and Google OAuth Access Token strictly in memory (never in localStorage/sessionStorage)
let inMemoryIdToken: string | null = null;
let cachedGoogleAccessToken: string | null = null;
const authListeners = new Set<(user: User | null, hasSheetsToken: boolean) => void>();

function notifyAuthListeners(user: User | null) {
  const hasToken = Boolean(cachedGoogleAccessToken);
  authListeners.forEach((cb) => {
    try {
      cb(user, hasToken);
    } catch {
      // ignore listener error
    }
  });
}

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
        cachedGoogleAccessToken = null;
      }
      notifyAuthListeners(user);
    });
  } catch (err) {
    console.warn('onAuthStateChanged notice:', err);
  }
}

export function getGoogleSheetsAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

export function setGoogleSheetsAccessTokenInMemory(token: string | null): void {
  cachedGoogleAccessToken = token ? token.trim() : null;
  notifyAuthListeners(auth?.currentUser || null);
}

export function subscribeGoogleSheetsAuth(
  callback: (user: User | null, hasSheetsToken: boolean) => void
): () => void {
  authListeners.add(callback);
  callback(auth?.currentUser || null, Boolean(cachedGoogleAccessToken));
  return () => {
    authListeners.delete(callback);
  };
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
  if (!auth) {
    console.warn('Firebase Auth/Provider is not configured on this environment.');
    return null;
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
    }
    if (result.user) {
      inMemoryIdToken = await result.user.getIdToken();
    }
    notifyAuthListeners(result.user);
    return result.user;
  } catch (err) {
    console.warn('Google Popup sign-in notice:', err);
    return null;
  }
}

export async function signInWithGoogleForSheets(): Promise<{
  user: User | null;
  accessToken: string | null;
  errorMessage?: string;
}> {
  if (!auth) {
    return {
      user: null,
      accessToken: null,
      errorMessage: 'Firebase Auth chưa sẵn sàng trên môi trường này.',
    };
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    provider.setCustomParameters({ prompt: 'consent' });
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedGoogleAccessToken = credential?.accessToken ?? null;
    if (result.user) {
      inMemoryIdToken = await result.user.getIdToken();
    }
    notifyAuthListeners(result.user);
    return {
      user: result.user,
      accessToken: cachedGoogleAccessToken,
    };
  } catch (err: any) {
    console.warn('Google Sheets sign-in error:', err);
    return {
      user: auth?.currentUser || null,
      accessToken: null,
      errorMessage: err?.message || 'Đăng nhập Google bị hủy hoặc không thành công.',
    };
  }
}

export async function signOutFirebase(): Promise<void> {
  inMemoryIdToken = null;
  cachedGoogleAccessToken = null;
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  }
  notifyAuthListeners(null);
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
  if (!auth?.currentUser) return;
  const safeUid = sanitizeId(params.uid, auth?.currentUser?.uid || params.uid);
  if (safeUid !== auth?.currentUser?.uid) return;

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
