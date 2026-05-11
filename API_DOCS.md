# SabiNote API Documentation

**Base URL:** `http://localhost:3000/api/v1` (dev) · `https://api.sabinote.ng/api/v1` (prod)

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
```

Errors return:
```json
{ "statusCode": 400, "message": "...", "error": "Bad Request" }
```

---

## 1. Authentication — `/auth`

### POST `/auth/register`
Register a new teacher account. Creates user, wallet (0 balance), and default settings atomically.

**Auth:** Public

**Body:**
```json
{
  "firstName": "Amaka",
  "lastName": "Obi",
  "email": "amaka@school.edu.ng",
  "password": "SecurePass123",
  "phoneNumber": "08012345678",   // optional
  "state": "Lagos"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid",
      "firstName": "Amaka",
      "lastName": "Obi",
      "email": "amaka@school.edu.ng",
      "state": "Lagos",
      "role": "teacher",
      "isVerified": false,
      "createdAt": "2026-05-10T10:00:00.000Z"
    },
    "wallet": { "walletId": "uuid", "balance": "0.00" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errors:** `409` email already exists · `400` validation failed

---

### POST `/auth/login`
Email and password login.

**Auth:** Public

**Body:**
```json
{ "email": "amaka@school.edu.ng", "password": "SecurePass123" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "userId": "uuid", "firstName": "Amaka", "email": "...", "state": "Lagos", "role": "teacher", "isVerified": false },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errors:** `401` invalid credentials

---

### POST `/auth/refresh`
Issue a new token pair using a valid refresh token. Send the refresh token in the request body.

**Auth:** Public (uses refresh token as Bearer + body)

**Headers:**
```
Authorization: Bearer <refreshToken>
```

**Body:**
```json
{ "refreshToken": "eyJ..." }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." }
}
```

**Errors:** `401` invalid/expired refresh token

---

### POST `/auth/logout`
Stateless logout — client must discard both tokens after calling this.

**Auth:** Protected

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET `/auth/me`
Get the currently authenticated user's full profile, wallet, and settings.

**Auth:** Protected

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "firstName": "Amaka",
    "lastName": "Obi",
    "email": "amaka@school.edu.ng",
    "phoneNumber": "08012345678",
    "state": "Lagos",
    "role": "teacher",
    "isVerified": false,
    "createdAt": "2026-05-10T10:00:00.000Z",
    "wallet": { "walletId": "uuid", "balance": "85.00" },
    "settings": {
      "defaultState": "Lagos",
      "noteDifficultyLevel": "standard",
      "defaultSubject": null,
      "defaultClassLevel": null,
      "emailNotifications": true,
      "alwaysConfirmState": true
    }
  }
}
```

---

## 2. Users — `/users`

All endpoints require authentication.

### GET `/users/profile`
Full profile with wallet and settings. Identical shape to `GET /auth/me`.

---

### PATCH `/users/profile`
Update name, phone, or state. Send only the fields you want to change.

> **UX note:** When `state` changes, warn the user that curriculum context will change.

**Body (all optional):**
```json
{
  "firstName": "Amaka",
  "lastName": "Obi-Updated",
  "phoneNumber": "08099999999",
  "state": "Ogun"
}
```

**Response `200`:** Full updated profile (same shape as GET).

---

### GET `/users/settings`
Get user preference settings.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "settingId": "uuid",
    "userId": "uuid",
    "defaultState": "Lagos",
    "alwaysConfirmState": true,
    "noteDifficultyLevel": "standard",
    "defaultSubject": null,
    "defaultClassLevel": null,
    "emailNotifications": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/users/settings`
Update preferences. All fields optional.

**Body:**
```json
{
  "defaultState": "Lagos",
  "alwaysConfirmState": false,
  "noteDifficultyLevel": "advanced",   // "basic" | "standard" | "advanced"
  "defaultSubject": "Mathematics",
  "defaultClassLevel": "JSS1",
  "emailNotifications": true
}
```

---

### DELETE `/users/account`
Permanently delete the user's account. Cascades to wallet and settings.

**Response `200`:**
```json
{ "success": true, "message": "Account deleted" }
```

---

## 3. Wallet & Payments — `/wallet`

### GET `/wallet`
Get current wallet balance.

**Auth:** Protected

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "walletId": "uuid",
    "userId": "uuid",
    "balance": "85.00",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/wallet/transactions`
Paginated transaction history for the current user.

**Query params:** `page` (default: 1) · `limit` (default: 20)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "uuid",
        "type": "debit",
        "amountDeducted": "8.00",
        "amountAdded": "0.00",
        "balanceBefore": "93.00",
        "balanceAfter": "85.00",
        "purpose": "lesson_plan_generation",
        "status": "success",
        "description": "Lesson plan: Whole Numbers — Multiplication",
        "createdAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

---

### POST `/wallet/topup/initiate`
Create a Paystack payment intent. Returns the checkout URL to redirect the user to.

**Auth:** Protected

**Body:**
```json
{
  "packageId": "pkg_100",
  "parats": 100,
  "amountNGN": 500
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/abc123",
    "reference": "sabi_1234567890_abc12345",
    "transactionId": "uuid"
  }
}
```

**Flow:** Redirect user to `authorizationUrl`. Paystack fires the webhook on payment completion — no manual action needed. Optionally call `verify` as a fallback.

---

### POST `/wallet/topup/verify`
Manual fallback to verify payment if webhook hasn't fired yet.

**Auth:** Protected

**Body:**
```json
{ "reference": "sabi_1234567890_abc12345" }
```

**Response `200`:** Wallet is credited if payment succeeded.

---

### POST `/wallet/webhook`
Paystack server-to-server webhook. **Do not call from the frontend.** Validates HMAC-SHA512 signature and credits wallet on `charge.success`.

**Auth:** Public (signature-validated)

---

## 4. Curriculum — `/curriculum`

All endpoints require authentication. Use these to power your dropdowns before generation.

### GET `/curriculum/states`
List all states with curriculum data.

**Response `200`:**
```json
{
  "success": true,
  "data": { "states": ["Anambra", "Kano", "Lagos", "Ogun"] }
}
```

---

### GET `/curriculum/subjects`
List subjects available for a state and class level.

**Query params:** `state` · `classLevel`

**Example:** `GET /curriculum/subjects?state=Lagos&classLevel=JSS1`

**Response `200`:**
```json
{
  "success": true,
  "data": { "subjects": ["Basic Science", "Civic Education", "English Language", "Mathematics"] }
}
```

---

### GET `/curriculum/weeks`
List all weeks (with topics) for a given context. Use to populate the week picker.

**Query params:** `state` · `subject` · `classLevel` · `term`

**Example:** `GET /curriculum/weeks?state=Lagos&subject=Mathematics&classLevel=JSS1&term=1`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "weeks": [
      { "curriculumWeekId": "uuid", "week": 1, "topic": "Whole Numbers — Place Value" },
      { "curriculumWeekId": "uuid", "week": 2, "topic": "Whole Numbers — Addition and Subtraction" },
      { "curriculumWeekId": "uuid", "week": 3, "topic": "Whole Numbers — Multiplication and Division" }
    ]
  }
}
```

---

### GET `/curriculum/week`
Get the full content of a single curriculum week. Used internally before generation.

**Query params:** `state` · `subject` · `classLevel` · `term` · `week`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "curriculumWeekId": "uuid",
    "state": "Lagos",
    "subject": "Mathematics",
    "classLevel": "JSS1",
    "term": 1,
    "week": 3,
    "topic": "Whole Numbers — Multiplication and Division",
    "subTopics": ["Multiplication of 4-digit numbers", "Long division", "Word problems"],
    "objectives": ["Multiply 4-digit numbers by 2-digit numbers", "Solve long division"],
    "teachingActivities": "...",
    "teachingAids": "Charts, counters",
    "evaluation": "...",
    "referenceText": "New General Mathematics JSS1 p.44"
  }
}
```

**Errors:** `404` week not found

---

### POST `/curriculum/seed`
Bulk upsert curriculum weeks. Also available at `POST /admin/curriculum/seed` (admin only).

**Body:**
```json
{
  "weeks": [
    {
      "state": "Lagos",
      "subject": "Mathematics",
      "classLevel": "JSS1",
      "term": 1,
      "week": 1,
      "topic": "Whole Numbers — Place Value",
      "subTopics": ["Units, tens, hundreds", "Expanded notation"],
      "objectives": ["Identify place values up to millions"],
      "teachingActivities": "Use place value charts...",
      "teachingAids": "Place value chart",
      "evaluation": "Write 3,045,267 in words",
      "referenceText": "New General Mathematics JSS1 p.1"
    }
  ]
}
```

**Response `200`:**
```json
{ "success": true, "data": { "upserted": 1, "total": 1 } }
```

---

## 5. Generation — `/generate`

This is the core feature. Two-phase flow: **Plan → Note**.

> **Cost:** Each generation deducts Parats from the wallet atomically. If generation fails, no Parats are deducted.

Current costs (configurable via env):
| Operation | Cost |
|---|---|
| Lesson Plan (Phase 1) | 8 Parats |
| Lesson Note (Phase 2) | 12 Parats |
| Regenerate | 5 Parats |

---

### POST `/generate/lesson-plan`
Phase 1. Fetches the curriculum week, calls Claude AI, saves the plan, debits the wallet.

**Auth:** Protected

**Body:**
```json
{
  "curriculumWeekId": "uuid",
  "durationMinutes": 40,
  "resourceId": "uuid"   // optional — textbook to use as context
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "lessonPlanContent": "## Lesson Plan\n**Subject:** Mathematics...",
    "walletBalance": 85.0,
    "parratsCost": 8
  }
}
```

**Errors:** `402` insufficient balance · `404` curriculum week not found · `503` AI unavailable

---

### POST `/generate/lesson-note`
Phase 2. Takes the (optionally edited) lesson plan and generates the full note.

**Auth:** Protected

**Body:**
```json
{
  "noteId": "uuid",
  "editedLessonPlan": "## Lesson Plan\n**Subject:** Mathematics (teacher-edited...)"
}
```

> `editedLessonPlan` is optional. If omitted, the saved plan from Phase 1 is used as-is. This is the human-in-the-loop (HITL) step — teachers can refine the plan before generating the note.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "lessonNoteContent": "## Lesson Note\n### Introduction...",
    "walletBalance": 73.0,
    "parratsCost": 12
  }
}
```

**Errors:** `402` insufficient balance · `400` note is already complete · `403` note belongs to another user

---

### POST `/generate/regenerate`
Regenerate either phase of an existing note. Overwrites previous content.

**Auth:** Protected

**Body:**
```json
{
  "noteId": "uuid",
  "phase": "plan",   // "plan" | "note"
  "additionalInstructions": "Make it more interactive and include group activities"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "content": "## Lesson Plan\n...",
    "walletBalance": 68.0,
    "parratsCost": 5
  }
}
```

---

## 6. Notes Library — `/notes`

CRUD for lesson notes. Notes are generated by `/generate` endpoints and stored here.

### GET `/notes`
Paginated list of the current user's notes.

**Auth:** Protected

**Query params:** `page` · `limit` · `subject` · `classLevel`

**Example:** `GET /notes?page=1&limit=20&subject=Mathematics&classLevel=JSS1`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "noteId": "uuid",
        "name": "JSS1 Mathematics Wk3 T1",
        "subjectName": "Mathematics",
        "topic": "Whole Numbers — Multiplication and Division",
        "classLevel": "JSS1",
        "term": 1,
        "week": 3,
        "phase": "complete",
        "status": "draft",
        "isExported": false,
        "createdAt": "2026-05-10T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 12 }
  }
}
```

---

### GET `/notes/search`
Full-text search across topic, subject name, and note name.

**Query params:** `q` (required) · `subject` · `classLevel`

**Example:** `GET /notes/search?q=multiplication&classLevel=JSS1`

**Response `200`:** Same shape as list but without pagination (max 50 results).

---

### GET `/notes/:noteId`
Get a single note's full content including lesson plan and lesson note text.

**Auth:** Protected

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "name": "JSS1 Mathematics Wk3 T1",
    "subjectName": "Mathematics",
    "topic": "Whole Numbers — Multiplication and Division",
    "classLevel": "JSS1",
    "term": 1,
    "week": 3,
    "state": "Lagos",
    "lessonPlanContent": "## Lesson Plan\n...",
    "lessonNoteContent": "## Lesson Note\n...",
    "phase": "complete",
    "status": "draft",
    "isExported": false,
    "exportCount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:** `404` not found · `403` note belongs to another user

---

### PATCH `/notes/:noteId`
Auto-save canvas edits. Call with debounce (e.g., 2 seconds after user stops typing).

**Auth:** Protected

**Body (all optional):**
```json
{
  "lessonPlanContent": "## Lesson Plan\n(edited content)",
  "lessonNoteContent": "## Lesson Note\n(edited content)"
}
```

**Response `200`:**
```json
{ "success": true, "data": { "savedAt": "2026-05-10T10:31:22.000Z" } }
```

---

### DELETE `/notes/:noteId`
Permanently delete a note.

**Response `200`:**
```json
{ "success": true, "message": "Note deleted" }
```

---

## 7. Notifications — `/notifications`

### GET `/notifications`
Paginated list of the user's notifications, newest first.

**Query params:** `page` · `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "uuid",
        "type": "wallet_topup",
        "title": "Wallet Topped Up",
        "body": "Your wallet has been credited with 100 Parats.",
        "isRead": false,
        "metadata": { "reference": "sabi_...", "parats": 100 },
        "createdAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 3 }
  }
}
```

**Notification types:** `wallet_topup` · `generation_complete` · `generation_failed` · `system`

---

### PATCH `/notifications/read-all`
Mark all unread notifications as read.

**Response `200`:**
```json
{ "success": true, "message": "All notifications marked as read" }
```

---

### PATCH `/notifications/:id/read`
Mark a single notification as read.

**Response `200`:** Returns the updated notification object.

---

## 8. Resources — `/resources`

Textbooks and reference materials used during generation.

### GET `/resources`
List all resources the user can access: their own private uploads plus all public (admin-uploaded) resources.

**Query params (all optional):** `state` · `subject` · `classLevel`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "resourceId": "uuid",
      "resourceName": "New General Mathematics JSS1",
      "resourceType": "textbook",
      "subject": "Mathematics",
      "classLevel": "JSS1",
      "state": "Lagos",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "isPublic": true
    }
  ]
}
```

**Resource types:** `textbook` · `scheme_supplement` · `past_question` · `other`

---

### POST `/resources/upload`
Upload a personal resource (PDF, etc.). Use `multipart/form-data`.

**Auth:** Protected

**Form fields:**
| Field | Type | Required |
|---|---|---|
| `file` | File (max 10 MB) | Yes |
| `resourceName` | string | Yes |
| `resourceType` | `textbook` \| `scheme_supplement` \| `past_question` \| `other` | Yes |
| `subject` | string | No |
| `classLevel` | string | No |
| `state` | string | No |

**Response `201`:** Returns the created resource object.

---

### DELETE `/resources/:resourceId`
Delete a resource you own. Also deletes the file from Cloudinary.

**Response `200`:**
```json
{ "success": true, "message": "Resource deleted" }
```

---

### GET `/resources/match`
Auto-match a public resource for a given curriculum context. Used internally before generation to suggest a textbook.

**Query params:** `state` · `subject` · `classLevel`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "matched": {
      "resourceId": "uuid",
      "resourceName": "New General Mathematics JSS1",
      "resourceType": "textbook",
      "isPublic": true,
      "fileUrl": "https://res.cloudinary.com/..."
    }
  }
}
```

`matched` is `null` if no resource is found.

---

## 9. Export — `/export`

### POST `/export/:noteId/pdf`
Download the note as a PDF file.

**Auth:** Protected

**Response `200`:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Multiplication_20260510.pdf"

[Binary PDF stream]
```

Handle this as a file download (e.g., `window.open(url)` or `<a>` with `download`). Include the `Authorization` header.

**Errors:** `404` not found · `403` wrong user

---

### POST `/export/:noteId/docx`
Download the note as a Word document.

**Response `200`:**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="Multiplication_20260510.docx"
```

---

## 10. Admin — `/admin`

All admin endpoints require a user with `role: "admin"`. Returns `403` for non-admin users.

### GET `/admin/users`
Paginated list of all users with wallet balances.

**Query params:** `page` · `limit`

---

### GET `/admin/stats`
Platform-level statistics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1204,
    "totalNotes": 8932,
    "notesThisMonth": 423,
    "totalTopups": 890,
    "totalRevenueNGN": "445000.00"
  }
}
```

---

### POST `/admin/curriculum/seed`
Bulk upsert curriculum weeks. Same body as `POST /curriculum/seed`. Idempotent — safe to run multiple times.

---

### POST `/admin/resources/upload`
Upload a public resource (NERDC textbook) accessible to all users. Uses `multipart/form-data`. Same fields as `POST /resources/upload`. Uploaded resources are automatically set to `isPublic: true`.

---

### POST `/admin/credit`
Manually credit a user's wallet.

**Body:**
```json
{
  "userId": "uuid",
  "amount": 50,
  "reason": "Compensation for failed generation"
}
```

**Response `200`:**
```json
{ "success": true, "data": { "newBalance": 135 } }
```

---

### GET `/admin/transactions`
All platform transactions with user details.

**Query params:** `page` · `limit`

---

## Error Reference

| Status | Meaning |
|---|---|
| `400` | Validation failed — check the `message` field |
| `401` | Missing or invalid/expired access token |
| `402` | Insufficient Parats balance |
| `403` | Authenticated but not authorised (wrong user or not admin) |
| `404` | Resource not found |
| `409` | Conflict (e.g., email already registered) |
| `503` | AI service unavailable — retry |

---

## Token Lifecycle

```
Register/Login → { accessToken (15m), refreshToken (7d) }
    ↓
Use accessToken for all protected requests
    ↓
accessToken expires → POST /auth/refresh with refreshToken in Authorization header + body
    ↓
New { accessToken, refreshToken } pair issued
    ↓
Logout → discard both tokens client-side
```

Store tokens securely (HttpOnly cookies recommended for web, SecureStore for React Native).

---

## Two-Phase Generation Flow

```
1. Call GET /curriculum/weeks to populate week picker
2. User selects week → store curriculumWeekId
3. POST /generate/lesson-plan  { curriculumWeekId, durationMinutes }
   → returns noteId + lessonPlanContent
4. Display plan in editable canvas
5. User edits (optional) → POST /generate/lesson-note { noteId, editedLessonPlan }
   → returns lessonNoteContent
6. Display full note
7. Auto-save edits via PATCH /notes/:noteId (debounced)
8. Export via POST /export/:noteId/pdf or /docx
```
