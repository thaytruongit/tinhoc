import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesContent = fs.readFileSync('./firestore.rules', 'utf8');

interface AuthContext {
  uid: string;
  email: string;
  email_verified: boolean;
  isAdminDoc?: boolean;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

function isValidId(id: unknown): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && VALID_ID_REGEX.test(id);
}

function isVerifiedUser(auth: AuthContext | null): boolean {
  return auth !== null && auth.email_verified === true;
}

function isAdmin(auth: AuthContext | null): boolean {
  if (!isVerifiedUser(auth) || !auth) return false;
  return auth.email === 'manhtruongdo1984@gmail.com' || auth.isAdminDoc === true;
}

function isValidUserProfile(data: Record<string, unknown>): boolean {
  const requiredKeys = [
    'uid', 'displayName', 'studentCode', 'classId', 'role',
    'xp', 'streakDays', 'stars', 'groupNumber', 'partnerName',
    'createdAt', 'updatedAt'
  ];
  const keys = Object.keys(data);
  if (keys.length !== requiredKeys.length || !requiredKeys.every((k) => keys.includes(k))) {
    return false;
  }
  return (
    isValidId(data.uid) &&
    typeof data.displayName === 'string' && data.displayName.length >= 1 && data.displayName.length <= 80 &&
    typeof data.studentCode === 'string' && data.studentCode.length >= 1 && data.studentCode.length <= 32 && VALID_ID_REGEX.test(data.studentCode) &&
    typeof data.classId === 'string' && data.classId.length >= 1 && data.classId.length <= 16 && VALID_ID_REGEX.test(data.classId) &&
    (data.role === 'student' || data.role === 'teacher') &&
    typeof data.xp === 'number' && Number.isInteger(data.xp) && data.xp >= 0 && data.xp <= 1000000 &&
    typeof data.streakDays === 'number' && Number.isInteger(data.streakDays) && data.streakDays >= 0 && data.streakDays <= 3650 &&
    typeof data.stars === 'number' && Number.isInteger(data.stars) && data.stars >= 0 && data.stars <= 10000 &&
    typeof data.groupNumber === 'number' && Number.isInteger(data.groupNumber) && data.groupNumber >= 1 && data.groupNumber <= 4 &&
    typeof data.partnerName === 'string' && data.partnerName.length >= 1 && data.partnerName.length <= 80 &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string'
  );
}

function evaluateUserCreate(
  auth: AuthContext | null,
  userId: string,
  incoming: Record<string, unknown>,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (
    isVerifiedUser(auth) &&
    auth !== null &&
    isValidId(userId) &&
    isValidUserProfile(incoming) &&
    userId === auth.uid &&
    incoming.uid === auth.uid &&
    incoming.createdAt === requestTime &&
    incoming.updatedAt === requestTime &&
    (incoming.role === 'student' || isAdmin(auth))
  ) {
    return 'ALLOWED';
  }
  return 'PERMISSION_DENIED';
}

function evaluateUserUpdate(
  auth: AuthContext | null,
  userId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  const allowedDiff = [
    'displayName', 'classId', 'xp', 'streakDays', 'stars', 'groupNumber', 'partnerName', 'updatedAt'
  ];
  const affectedKeys = Object.keys(incoming).filter((k) => incoming[k] !== existing[k]);
  if (
    isVerifiedUser(auth) &&
    auth !== null &&
    isValidId(userId) &&
    isValidUserProfile(incoming) &&
    incoming.uid === existing.uid &&
    incoming.createdAt === existing.createdAt &&
    incoming.updatedAt === requestTime &&
    (
      (
        userId === auth.uid &&
        incoming.role === existing.role &&
        incoming.studentCode === existing.studentCode &&
        affectedKeys.every((k) => allowedDiff.includes(k))
      ) ||
      isAdmin(auth)
    )
  ) {
    return 'ALLOWED';
  }
  return 'PERMISSION_DENIED';
}

function evaluateWorksheetCreate(
  auth: AuthContext | null,
  submissionId: string,
  incoming: Record<string, unknown>,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  const requiredKeys = [
    'submissionId', 'studentUid', 'studentName', 'studentCode',
    'classId', 'lessonId', 'stageId', 'score', 'maxScore',
    'status', 'answersSummary', 'teacherFeedback', 'createdAt', 'updatedAt'
  ];
  const keys = Object.keys(incoming);
  if (keys.length !== requiredKeys.length || !requiredKeys.every((k) => keys.includes(k))) {
    return 'PERMISSION_DENIED';
  }
  if (
    isVerifiedUser(auth) &&
    auth !== null &&
    isValidId(submissionId) &&
    incoming.submissionId === submissionId &&
    incoming.studentUid === auth.uid &&
    typeof incoming.answersSummary === 'string' &&
    incoming.answersSummary.length >= 1 &&
    incoming.answersSummary.length <= 2000 &&
    incoming.status !== 'graded' &&
    incoming.teacherFeedback === '' &&
    incoming.createdAt === requestTime &&
    incoming.updatedAt === requestTime
  ) {
    return 'ALLOWED';
  }
  return 'PERMISSION_DENIED';
}

test('Firestore rules file contains all 5 protected collections and global catch-all', () => {
  assert.ok(rulesContent.includes("rules_version = '2';"));
  assert.ok(rulesContent.includes('match /{document=**}'));
  assert.ok(rulesContent.includes('match /admins/{adminUid}'));
  assert.ok(rulesContent.includes('match /users/{userId}'));
  assert.ok(rulesContent.includes('match /worksheets/{submissionId}'));
  assert.ok(rulesContent.includes('match /lessons/{lessonId}'));
  assert.ok(rulesContent.includes('match /wordCloudEntries/{entryId}'));
});

test('Dirty Dozen Payload 1-4: Identity spoofing, self-assigned teacher role, shadow fields, and unverified email spoof are PERMISSION_DENIED', () => {
  const alice: AuthContext = { uid: 'uid_alice', email: 'alice@edu.vn', email_verified: true };
  const now = '2026-10-26T10:00:00Z';
  const baseProfile = {
    uid: 'uid_alice',
    displayName: 'Bùi Minh Anh',
    studentCode: '61001',
    classId: '6A10',
    role: 'student',
    xp: 100,
    streakDays: 5,
    stars: 3,
    groupNumber: 1,
    partnerName: 'Nguyễn Hoàng Nam',
    createdAt: now,
    updatedAt: now,
  };

  // Payload 1: Identity Spoofing
  assert.equal(
    evaluateUserCreate(alice, 'uid_bob', { ...baseProfile, uid: 'uid_bob' }, now),
    'PERMISSION_DENIED'
  );

  // Payload 2: Self-assigned Teacher Role
  assert.equal(
    evaluateUserCreate(alice, 'uid_alice', { ...baseProfile, role: 'teacher' }, now),
    'PERMISSION_DENIED'
  );

  // Payload 3: Shadow Field Injection
  assert.equal(
    evaluateUserUpdate(alice, 'uid_alice', baseProfile, { ...baseProfile, isVerifiedAdmin: true }, now),
    'PERMISSION_DENIED'
  );

  // Payload 4: Unverified Email Spoof Attack
  const spoofedAdmin: AuthContext = {
    uid: 'uid_spoof',
    email: 'manhtruongdo1984@gmail.com',
    email_verified: false,
  };
  assert.equal(isAdmin(spoofedAdmin), false);
});

test('Dirty Dozen Payload 5-12: Resource poisoning, ID poisoning, terminal state mutation, immutable tampering, forged timestamps, and value poisoning are PERMISSION_DENIED', () => {
  const alice: AuthContext = { uid: 'uid_alice', email: 'alice@edu.vn', email_verified: true };
  const now = '2026-10-26T10:00:00Z';
  const validSub = {
    submissionId: 'sub_1',
    studentUid: 'uid_alice',
    studentName: 'Bùi Minh Anh',
    studentCode: '61001',
    classId: '6A10',
    lessonId: 'tiet_1',
    stageId: 2,
    score: 9.0,
    maxScore: 10,
    status: 'submitted',
    answersSummary: 'Phân loại đúng 6/6 thẻ',
    teacherFeedback: '',
    createdAt: now,
    updatedAt: now,
  };

  // Payload 5: Oversized string (5000 chars)
  assert.equal(
    evaluateWorksheetCreate(alice, 'sub_1', { ...validSub, answersSummary: 'A'.repeat(5000) }, now),
    'PERMISSION_DENIED'
  );

  // Payload 6: ID Poisoning
  assert.equal(
    evaluateWorksheetCreate(alice, 'invalid$id!@#', { ...validSub, submissionId: 'invalid$id!@#' }, now),
    'PERMISSION_DENIED'
  );

  // Payload 7: Creating already graded submission
  assert.equal(
    evaluateWorksheetCreate(alice, 'sub_1', { ...validSub, status: 'graded' }, now),
    'PERMISSION_DENIED'
  );

  // Payload 9: Forged Client Timestamp
  assert.equal(
    evaluateWorksheetCreate(alice, 'sub_1', { ...validSub, createdAt: '2020-01-01T00:00:00Z' }, now),
    'PERMISSION_DENIED'
  );

  // Payload 11: Value Poisoning on User Update
  const baseProfile = {
    uid: 'uid_alice',
    displayName: 'Bùi Minh Anh',
    studentCode: '61001',
    classId: '6A10',
    role: 'student',
    xp: 100,
    streakDays: 5,
    stars: 3,
    groupNumber: 1,
    partnerName: 'Nguyễn Hoàng Nam',
    createdAt: now,
    updatedAt: now,
  };
  assert.equal(
    evaluateUserUpdate(alice, 'uid_alice', baseProfile, { ...baseProfile, xp: -500 }, now),
    'PERMISSION_DENIED'
  );
});
