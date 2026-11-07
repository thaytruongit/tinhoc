export const GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY = 'cloudplay_github_public_snapshot_v1';
export const GITHUB_PUBLIC_SNAPSHOT_STATIC_PATH = './data/github-public-db-snapshot.json';

export interface GitHubPublicDataSnapshot {
  schemaVersion: '2.0.0';
  appTitle: string;
  syncedAtIso: string;
  prioritizeGitHubPublic: boolean;
  activeLiveLesson: {
    classId: string;
    grade: 6 | 7 | 8 | 9;
    period: number;
    lessonKey: string;
    isBroadcasting: boolean;
  };
  taughtPeriodsByClass?: Record<string, number[]>;
  classesCount: number;
  studentsCount: number;
  classes?: any[];
  students?: any[];
}

/**
 * Xây dựng gói dữ liệu chuẩn hóa (`GitHubPublicDataSnapshot`) để ưu tiên đồng bộ & public lên GitHub / GitHub Pages.
 */
export function buildGitHubPublicDataSnapshot(params: {
  liveSession?: any;
  classes?: any[];
  students?: any[];
  taughtPeriodsByClass?: Record<string, number[]>;
}): GitHubPublicDataSnapshot {
  const live = params.liveSession || {};
  const grade = ([6, 7, 8, 9].includes(Number(live.activeGrade))
    ? Number(live.activeGrade)
    : 6) as 6 | 7 | 8 | 9;
  const period = Math.max(1, Math.min(29, Number(live.activePeriod) || 1));
  const lessonKey = `k${grade}-tiet-${period}`;

  const classesList = Array.isArray(params.classes) ? params.classes : [];
  const studentsList = Array.isArray(params.students) ? params.students : [];

  return {
    schemaVersion: '2.0.0',
    appTitle: 'Dạy học số — Tin Học GDPT 2018 (Khối 6-9)',
    syncedAtIso: new Date().toISOString(),
    prioritizeGitHubPublic: true,
    activeLiveLesson: {
      classId: String(live.classId || '6A10'),
      grade,
      period,
      lessonKey,
      isBroadcasting: Boolean(live.isBroadcasting ?? true),
    },
    taughtPeriodsByClass: params.taughtPeriodsByClass || {},
    classesCount: classesList.length,
    studentsCount: studentsList.length,
    classes: classesList,
    students: studentsList,
  };
}

/**
 * Lấy snapshot đã lưu trong LocalStorage nếu có.
 */
export function getSavedGitHubPublicSnapshot(): GitHubPublicDataSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.schemaVersion === '2.0.0') {
      return parsed as GitHubPublicDataSnapshot;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Tải gói dữ liệu `public/data/github-public-db-snapshot.json` khi chạy trên GitHub Pages (Static Hosting)
 * hoặc trình duyệt mới chưa có dữ liệu localStorage.
 */
export async function loadGitHubPublicSnapshotFromStaticUrl(): Promise<GitHubPublicDataSnapshot | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
  const candidateUrls = [
    './data/github-public-db-snapshot.json',
    '/data/github-public-db-snapshot.json',
    '/api/github/sync-snapshot',
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const snapshot = data?.snapshot || data;
      if (snapshot && snapshot.schemaVersion === '2.0.0') {
        return snapshot as GitHubPublicDataSnapshot;
      }
    } catch {
      // try next candidate
    }
  }
  return getSavedGitHubPublicSnapshot();
}

/**
 * Hợp nhất dữ liệu từ `GitHubPublicDataSnapshot` vào `liveSession`.
 */
export function mergeGitHubPublicSnapshotIntoLiveSession(
  currentLiveSession: any,
  snapshot: GitHubPublicDataSnapshot | null | undefined
): any {
  if (!snapshot || !currentLiveSession) return currentLiveSession;
  return {
    ...currentLiveSession,
    taughtPeriodsByClass: snapshot.taughtPeriodsByClass || currentLiveSession.taughtPeriodsByClass,
  };
}

/**
 * Đồng bộ toàn bộ dữ liệu hiện tại lên GitHub Public paths.
 */
export async function syncAllDataForGitHubPublic(params: {
  liveSession?: any;
  classes?: any[];
  students?: any[];
  taughtPeriodsByClass?: Record<string, number[]>;
}): Promise<{
  ok: boolean;
  persistedToRepoFiles: boolean;
  snapshot: GitHubPublicDataSnapshot;
  statusMessage: string;
}> {
  const snapshot = buildGitHubPublicDataSnapshot(params);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
    } catch {
      // ignore storage quota warning
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('cloudplay_realtime_sync');
        bc.postMessage({
          type: 'GITHUB_PUBLIC_SNAPSHOT_SYNCED',
          snapshot,
          timestamp: Date.now(),
        });
        bc.close();
      }
    } catch {
      // ignore BroadcastChannel error
    }
  }

  let persistedToRepoFiles = false;
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch('/api/github/sync-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      });
      if (response.ok) {
        const resJson = await response.json();
        persistedToRepoFiles = Boolean(resJson?.ok);
      }
    } catch {
      // Đang chạy trên GitHub Pages tĩnh
    }
  }

  const statusMessage = persistedToRepoFiles
    ? `🚀 Đã đồng bộ dữ liệu vào gói chuẩn GitHub Public — Sẵn sàng Commit/Push lên GitHub!`
    : `✅ Đã đồng bộ dữ liệu chuẩn GitHub Pages!`;

  return {
    ok: true,
    persistedToRepoFiles,
    snapshot,
    statusMessage,
  };
}

/**
 * Cho phép giáo viên tải trực tiếp tệp `github-public-db-snapshot.json` về máy.
 */
export function downloadGitHubPublicSnapshotJson(snapshot: GitHubPublicDataSnapshot): void {
  if (typeof document === 'undefined') return;
  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'github-public-db-snapshot.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
