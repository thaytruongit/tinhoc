# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly matched is denied (`allow read, write: if false;`).
2. **Verified Authentication**: Every mutating operation requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Path Variable Hardening**: Every document ID (`userId`, `submissionId`, `lessonId`, `entryId`, `adminUid`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **No Self-Assigned Admin / Privilege Escalation**: Regular users creating `/users/{userId}` can only set `role == 'student'` unless `isAdmin()` is true. Users cannot modify `role`, `uid`, `studentCode`, or `createdAt` on update.
5. **PII Isolation**: No PII (`email`, `phone`, `address`) is stored in `/users/{userId}` or any other collection.
6. **Strict Schema & Shadow Field Rejection**: Every `create` and `update` must pass `isValid[Entity](incoming())` which enforces `data.keys().hasAll(...)` and `data.keys().hasOnly(...)` along with exact string length and numeric bounds.
7. **Temporal Integrity**: `createdAt == request.time` on `create`; `createdAt == existing().createdAt && updatedAt == request.time` on `update`.
8. **Terminal State Locking**: Once a `WorksheetSubmission` reaches `status == 'graded'` or a `LessonConfig` reaches `status == 'archived'`, non-admin users cannot update it.
9. **Secure List Queries**: No blanket `allow list: if isSignedIn();`. Every `allow list` enforces relational or state constraints on `resource.data` without `get()`/`exists()`.

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on User Create)**: Authenticated user `uid_alice` attempts to create `/users/uid_bob` with `uid: "uid_bob"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Privilege Escalation / Self-Assigned Teacher Role)**: Non-admin user `uid_alice` attempts to create `/users/uid_alice` with `role: "teacher"`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on User Update)**: User `uid_alice` attempts to update `/users/uid_alice` with an undeclared field `isVerifiedAdmin: true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Unverified Email Spoof Attack)**: User with `email: "manhtruongdo1984@gmail.com"` but `email_verified: false` attempts admin write on `/lessons/tiet_1`. -> `PERMISSION_DENIED`
5. **Payload 5 (Resource Poisoning / Oversized String)**: User submits `WorksheetSubmission` with `answersSummary` of length 5,000 chars (exceeding `maxLength: 2000`). -> `PERMISSION_DENIED`
6. **Payload 6 (ID Poisoning Attack)**: User attempts to create `/worksheets/invalid$id!@#` containing illegal characters. -> `PERMISSION_DENIED`
7. **Payload 7 (Terminal State Mutation)**: Student `uid_alice` attempts to update `/worksheets/sub_1` when `existing().status == 'graded'`. -> `PERMISSION_DENIED`
8. **Payload 8 (Immutable Field Tampering)**: Student `uid_alice` attempts to change `createdAt` or `studentUid` during an update on `/worksheets/sub_1`. -> `PERMISSION_DENIED`
9. **Payload 9 (Forged Client Timestamp)**: User attempts to create `/wordCloudEntries/entry_1` with a past/future `createdAt` not equal to `request.time`. -> `PERMISSION_DENIED`
10. **Payload 10 (Cross-Tenant Worksheet Snooping)**: Student `uid_alice` attempts `get` or `list` on `/worksheets/sub_bob` where `studentUid == 'uid_bob'`. -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Whitelisted Update Key)**: Student `uid_alice` updates allowed key `xp` on `/users/uid_alice` with a string `"999999"` or negative number `-50`. -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized Lesson Modification)**: Student `uid_alice` attempts to create or update a lesson in `/lessons/tiet_1`. -> `PERMISSION_DENIED`
