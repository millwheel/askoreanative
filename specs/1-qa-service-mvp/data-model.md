# Data Model Specification

**Feature**: Korean Travel Q&A Service MVP
**Created**: 2025-11-30
**Status**: Design Phase

---

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Korean Travel Q&A Service MVP.

---

## 1. Entity Definitions

### 1.1 UserProfile

**Purpose**: Represents a registered user in the system with role information.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | ✅ | PK, FK to auth.users | Supabase Auth user ID |
| email | TEXT | ✅ | UNIQUE, NOT NULL | Email from Google OAuth |
| displayName | TEXT | ✅ | Max 100 chars | User's display name in profiles |
| avatarUrl | TEXT | ❌ | URL format | Profile picture URL (from Google or uploaded) |
| languagePreference | TEXT | ✅ | Default: 'en' | UI language preference ('en', 'ko') |
| userType | TEXT | ✅ | Enum: CUSTOMER, ANSWERER, ADMIN | User's role in system |
| answererType | TEXT | ❌ | Enum: KOREAN_NATIVE, LONG_TERM_RESIDENT | Additional info for ANSWERER users |
| createdAt | TIMESTAMP | ✅ | Default: NOW() | Account creation time |
| updatedAt | TIMESTAMP | ✅ | Default: NOW() | Last profile update time |

**Relationships**:
- 1:N with Question (user creates many questions)
- 1:N with Answer (user creates many answers)
- 1:N with Comment (user creates many comments)

**Access Control**:
- Anyone can read user profiles (display name, avatar)
- Users can update their own profile
- Only ADMIN can change userType of other users

**Validation Rules**:
- displayName must be 1-100 characters
- avatarUrl must be valid URL if provided
- userType must be one of: CUSTOMER, ANSWERER, ADMIN
- answererType only valid if userType = ANSWERER

**Initial State** (post-signup):
- userType = 'CUSTOMER' (default)
- answererType = NULL
- languagePreference = 'en' (default)
- avatarUrl = Google profile picture (if available)

---

### 1.2 Question

**Purpose**: Represents a question asked by a traveler or answerer about Korea travel.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | ✅ | PK | Question unique identifier |
| userId | UUID | ✅ | FK to UserProfile.id | Creator of the question |
| title | TEXT | ✅ | Min: 5, Max: 200 chars | Question title/headline |
| body | JSONB | ✅ | Tiptap JSON format | Rich text question content |
| category | TEXT | ✅ | Predefined enum | Question topic category |
| createdAt | TIMESTAMP | ✅ | Default: NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | ✅ | Default: NOW() | Last modification timestamp |

**Relationships**:
- N:1 with UserProfile (many questions per user)
- 1:N with Answer (one question has many answers)
- 1:N with Comment (on the question)
- 1:N with Attachment (question can have multiple images)

**Access Control**:
- Anyone can read all questions (no authentication required)
- CUSTOMER and ANSWERER users can create questions
- Only creator or ADMIN can update/delete

**Validation Rules**:
- title: 5-200 characters, required
- body: Valid Tiptap JSON, required, min 10 characters of text
- category: Must be in predefined list:
  - "Korea Travel Basics"
  - "Food & Dining"
  - "Cultural Insights"
  - "Transportation"
  - "Accommodation"
  - "Shopping & Money"
  - "Safety & Health"

**Body Format** (Tiptap JSON):
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Question text here..."
        }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Bullet point" }]
            }
          ]
        }
      ]
    }
  ]
}
```

**State Transitions**:
- CREATED → published (visible to all immediately)
- PUBLISHED → EDITED (on update)
- PUBLISHED → DELETED (soft delete: set deletedAt timestamp)

---

### 1.3 Answer

**Purpose**: Represents an answer to a question, posted by an ANSWERER or ADMIN.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | ✅ | PK | Answer unique identifier |
| questionId | UUID | ✅ | FK to Question.id | Parent question |
| userId | UUID | ✅ | FK to UserProfile.id | Creator of the answer |
| body | JSONB | ✅ | Tiptap JSON format | Rich text answer content |
| createdAt | TIMESTAMP | ✅ | Default: NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | ✅ | Default: NOW() | Last modification timestamp |

**Relationships**:
- N:1 with Question (many answers per question)
- N:1 with UserProfile (many answers per user)
- 1:N with Comment (on this answer)
- 1:N with Attachment (answer can have multiple images)

**Access Control**:
- Anyone can read all answers
- Only ANSWERER and ADMIN users can create answers
- Only creator or ADMIN can update/delete

**Validation Rules**:
- body: Valid Tiptap JSON, required, min 10 characters of text
- questionId: Must reference an existing, non-deleted Question

**Body Format**: Same as Question body (Tiptap JSON)

**State Transitions**:
- CREATED → published (visible immediately)
- PUBLISHED → EDITED
- PUBLISHED → DELETED (soft delete)

---

### 1.4 Comment

**Purpose**: Represents a comment on a question or answer for discussion and clarification.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | ✅ | PK | Comment unique identifier |
| postType | TEXT | ✅ | Enum: 'Question', 'Answer' | Type of parent post |
| postId | UUID | ✅ | FK to Question or Answer | ID of parent post |
| userId | UUID | ✅ | FK to UserProfile.id | Comment author |
| body | TEXT | ✅ | Min: 1, Max: 500 chars | Plain text comment |
| createdAt | TIMESTAMP | ✅ | Default: NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | ✅ | Default: NOW() | Last modification timestamp |

**Relationships**:
- N:1 with Question (if postType='Question')
- N:1 with Answer (if postType='Answer')
- N:1 with UserProfile (many comments per user)

**Access Control**:
- Anyone can read all comments
- Only authenticated users can create comments
- Only creator can delete (no edit)

**Validation Rules**:
- body: 1-500 characters, plain text only (no formatting)
- postType: Must be 'Question' or 'Answer'
- postId: Must reference valid existing post
- userId: Must be authenticated user

**Important Constraints**:
- No nested comments (all comments are top-level on their post)
- No editing (only delete)
- No rich formatting (plain text only)

---

### 1.5 Attachment

**Purpose**: Represents an image file attached to a question or answer.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | ✅ | PK | Attachment unique identifier |
| postType | TEXT | ✅ | Enum: 'Question', 'Answer' | Type of parent post |
| postId | UUID | ✅ | FK to Question or Answer | ID of parent post |
| fileUrl | TEXT | ✅ | HTTPS URL | Supabase Storage public URL |
| fileType | TEXT | ✅ | MIME type | Image type (image/jpeg, image/png, etc.) |
| createdAt | TIMESTAMP | ✅ | Default: NOW() | Upload timestamp |
| updatedAt | TIMESTAMP | ✅ | Default: NOW() | Last modification timestamp |

**Relationships**:
- N:1 with Question (if postType='Question')
- N:1 with Answer (if postType='Answer')

**Access Control**:
- Anyone can view attachments
- Anyone can upload (authenticated users)
- Creator or ADMIN can delete

**Validation Rules**:
- fileUrl: Valid HTTPS URL
- fileType: Must be image MIME type (image/jpeg, image/png, image/gif, image/webp)
- File size: Max 5MB (enforced on upload)
- postType: 'Question' or 'Answer'
- postId: Must reference valid existing post

**Storage Details**:
- Supabase Storage bucket: `question-images`
- File naming: `{postId}/{uuid}.{ext}` (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479/a1b2c3d4.jpg`)
- URLs: Public, no expiration (format: `https://<project>.supabase.co/storage/v1/object/public/question-images/...`)

---

## 2. Relationships & Cardinality

```
UserProfile (1) ─────────────────────── (N) Question
  |                                           |
  |─────── (N) Answer                         |─────── (N) Comment
  |                                           |
  |─────── (N) Comment                        └─────── (N) Attachment
  |
  └─────── (N) Answer

Answer (1) ──────────────── (N) Comment
           ──────────────── (N) Attachment
```

---

## 3. Enums

### UserType
```typescript
enum UserType {
  CUSTOMER = 'CUSTOMER',           // Can create questions, comment
  ANSWERER = 'ANSWERER',           // Can create questions AND answers, comment
  ADMIN = 'ADMIN'                  // Can delete any content, manage roles
}
```

### AnswererType
```typescript
enum AnswererType {
  KOREAN_NATIVE = 'KOREAN_NATIVE',                   // Born/raised in Korea
  LONG_TERM_RESIDENT = 'LONG_TERM_RESIDENT'        // Living in Korea 1+ years
}
```

### PostType
```typescript
enum PostType {
  Question = 'Question',
  Answer = 'Answer'
}
```

### Category
```typescript
enum Category {
  TRAVEL_BASICS = 'Korea Travel Basics',
  FOOD = 'Food & Dining',
  CULTURE = 'Cultural Insights',
  TRANSPORT = 'Transportation',
  ACCOMMODATION = 'Accommodation',
  SHOPPING = 'Shopping & Money',
  SAFETY = 'Safety & Health'
}
```

---

## 4. Indexes & Query Optimization

### Critical Indexes (for MVP)

```sql
-- Question searches
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_search ON questions USING GiST(search_vector);  -- FTS

-- Answer lookups
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);

-- Comment filtering
CREATE INDEX idx_comments_post ON comments(post_type, post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Attachment lookups
CREATE INDEX idx_attachments_post ON attachments(post_type, post_id);
```

---

## 5. Concurrency & Consistency

### Optimistic Locking
- Use `updatedAt` timestamp for client-side optimistic updates
- Compare `updatedAt` on PUT requests to detect conflicts
- Return 409 Conflict if content was modified by another user

### Soft Deletes
- Add optional `deletedAt` timestamp column to Question/Answer
- Filter out soft-deleted rows in queries (`WHERE deletedAt IS NULL`)
- Preserve data for audit logs and referential integrity

---

## 6. Constraints & Validations

### Database-Level Constraints
```sql
-- UserProfile
ALTER TABLE user_profiles ADD CONSTRAINT email_valid CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$');
ALTER TABLE user_profiles ADD CONSTRAINT user_type_valid CHECK (user_type IN ('CUSTOMER', 'ANSWERER', 'ADMIN'));

-- Question
ALTER TABLE questions ADD CONSTRAINT title_length CHECK (length(title) >= 5 AND length(title) <= 200);
ALTER TABLE questions ADD CONSTRAINT category_valid CHECK (category IN ('Korea Travel Basics', 'Food & Dining', ...));

-- Comment
ALTER TABLE comments ADD CONSTRAINT post_type_valid CHECK (post_type IN ('Question', 'Answer'));
ALTER TABLE comments ADD CONSTRAINT body_length CHECK (length(body) >= 1 AND length(body) <= 500);

-- Attachment
ALTER TABLE attachments ADD CONSTRAINT post_type_valid CHECK (post_type IN ('Question', 'Answer'));
ALTER TABLE attachments ADD CONSTRAINT file_type_valid CHECK (file_type LIKE 'image/%');
```

---

## 7. Row-Level Security (RLS) Policies

### UserProfile
- **SELECT**: Public (anyone can view)
- **INSERT**: Only by Supabase Auth trigger (auto-create on signup)
- **UPDATE**: Owner only
- **DELETE**: Owner only (or ADMIN)

### Question
- **SELECT**: Public (anyone can view)
- **INSERT**: Authenticated users (CUSTOMER or ANSWERER)
- **UPDATE**: Owner or ADMIN
- **DELETE**: Owner or ADMIN

### Answer
- **SELECT**: Public
- **INSERT**: Authenticated users with userType in (ANSWERER, ADMIN)
- **UPDATE**: Owner or ADMIN
- **DELETE**: Owner or ADMIN

### Comment
- **SELECT**: Public
- **INSERT**: Authenticated users
- **DELETE**: Owner only

### Attachment
- **SELECT**: Public
- **INSERT**: Authenticated users
- **DELETE**: Post owner or ADMIN

---

## 8. TypeScript Type Definitions

```typescript
// src/types/index.ts

export type UserProfile = {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  languagePreference: 'en' | 'ko'
  userType: 'CUSTOMER' | 'ANSWERER' | 'ADMIN'
  answererType?: 'KOREAN_NATIVE' | 'LONG_TERM_RESIDENT'
  createdAt: string // ISO 8601
  updatedAt: string
}

export type Question = {
  id: string
  userId: string
  title: string
  body: TiptapJSON
  category: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Answer = {
  id: string
  questionId: string
  userId: string
  body: TiptapJSON
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Comment = {
  id: string
  postType: 'Question' | 'Answer'
  postId: string
  userId: string
  body: string
  createdAt: string
  updatedAt: string
}

export type Attachment = {
  id: string
  postType: 'Question' | 'Answer'
  postId: string
  fileUrl: string
  fileType: string
  createdAt: string
  updatedAt: string
}

export type TiptapJSON = {
  type: 'doc'
  content: any[] // Tiptap node structure
}
```

---

## 9. API Response Models

### Paginated List Response
```typescript
type PaginatedResponse<T> = {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
```

### Question Detail Response
```typescript
type QuestionDetail = Question & {
  user: UserProfile
  answers: (Answer & { user: UserProfile })[]
  comments: (Comment & { user: UserProfile })[]
  attachments: Attachment[]
}
```

### Answer Detail Response
```typescript
type AnswerDetail = Answer & {
  user: UserProfile
  comments: (Comment & { user: UserProfile })[]
  attachments: Attachment[]
}
```

---

## 10. Data Integrity Rules

### Cascade Behavior
- **ON DELETE CASCADE**: Question → Answers, Comments, Attachments
- **ON DELETE SET NULL**: UserProfile → Questions/Answers/Comments (preserve content)

### Orphan Prevention
- Comment postId must reference valid Question or Answer
- Attachment postId must reference valid Question or Answer
- Answer questionId must reference valid Question

### Audit Trail
- All entities have `createdAt`, `updatedAt`
- Optionally add `createdBy`, `updatedBy` for admin features

---

## 11. Scalability Considerations

### Denormalization Opportunities (Phase 2+)
- Cache answer count on Question for faster list loading
- Cache comment count on Question/Answer
- Maintain materialized views for search results

### Partitioning (Phase 2+)
- Partition Comments by month (`created_at` range)
- Partition Attachments by post type

### Archival (Phase 2+)
- Move old questions/answers to archive table after 1 year
- Keep recent data in hot storage for faster queries

---

## Document Status

- **Version**: 1.0
- **Last Updated**: 2025-11-30
- **Status**: Design Phase
- **Next Review**: Before Phase 1 database setup
