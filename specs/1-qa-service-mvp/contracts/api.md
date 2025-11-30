# API Contract Reference

**Feature**: Korean Travel Q&A Service MVP
**Created**: 2025-11-30
**Status**: Design Phase
**Version**: 1.0

---

## Overview

This document specifies the REST API endpoints, request/response formats, and error handling for the Korean Travel Q&A Service MVP.

**Base URL**:
- Development: `http://localhost:3000/api`
- Production: `https://askoreanative.vercel.app/api`

**Authentication**:
- Cookie-based (Supabase Auth)
- No explicit Authorization header needed (handled by Supabase middleware)

---

## 1. Authentication Endpoints

### GET /api/auth/me
**Purpose**: Get current authenticated user profile

**Authentication**: Required (cookies)

**Request**:
```http
GET /api/auth/me
Cookie: sb-access-token=...
```

**Response 200**:
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "user@example.com",
  "displayName": "Sarah Chen",
  "avatarUrl": "https://...",
  "languagePreference": "en",
  "userType": "CUSTOMER",
  "answererType": null,
  "createdAt": "2025-11-20T10:30:00Z",
  "updatedAt": "2025-11-20T10:30:00Z"
}
```

**Response 401**:
```json
{
  "error": "Unauthorized",
  "message": "No authenticated user"
}
```

---

## 2. Questions Endpoints

### GET /api/questions
**Purpose**: List all questions with optional search, filtering, and sorting

**Authentication**: Not required

**Query Parameters**:
- `search` (string, optional): Search in title and body
- `category` (string, optional): Filter by category
- `sortBy` (string, optional): 'newest' | 'mostViewed' (default: 'newest')
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Request**:
```http
GET /api/questions?search=seoul&category=Food%20%26%20Dining&sortBy=newest&limit=20&offset=0
```

**Response 200**:
```json
{
  "questions": [
    {
      "id": "q123",
      "userId": "u456",
      "title": "Best Korean BBQ in Seoul?",
      "body": { "type": "doc", "content": [...] },
      "category": "Food & Dining",
      "createdAt": "2025-11-25T14:00:00Z",
      "updatedAt": "2025-11-25T14:00:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Response 400**: Bad Request (invalid category, etc.)

---

### POST /api/questions
**Purpose**: Create a new question

**Authentication**: Required (CUSTOMER or ANSWERER)

**Request**:
```http
POST /api/questions
Content-Type: application/json
Cookie: sb-access-token=...

{
  "title": "Best Korean BBQ in Seoul?",
  "body": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "I'm visiting Seoul for 3 days..." }
        ]
      }
    ]
  },
  "category": "Food & Dining"
}
```

**Validation**:
- title: 5-200 characters, required
- body: Valid Tiptap JSON, min 10 chars of text
- category: Must be valid (see data-model.md)

**Response 201**:
```json
{
  "id": "q789",
  "userId": "u456",
  "title": "Best Korean BBQ in Seoul?",
  "body": { "type": "doc", "content": [...] },
  "category": "Food & Dining",
  "createdAt": "2025-11-25T14:30:00Z",
  "updatedAt": "2025-11-25T14:30:00Z"
}
```

**Response 400**: Validation error
```json
{
  "error": "Bad Request",
  "message": "Title must be 5-200 characters",
  "code": "VALIDATION_ERROR"
}
```

**Response 401**: Unauthorized
**Response 403**: Forbidden (user type doesn't allow question creation)

---

### GET /api/questions/:id
**Purpose**: Get question details with answers and comments

**Authentication**: Not required

**Request**:
```http
GET /api/questions/q789
```

**Response 200**:
```json
{
  "id": "q789",
  "userId": "u456",
  "title": "Best Korean BBQ in Seoul?",
  "body": { "type": "doc", "content": [...] },
  "category": "Food & Dining",
  "createdAt": "2025-11-25T14:30:00Z",
  "updatedAt": "2025-11-25T14:30:00Z",
  "user": {
    "id": "u456",
    "email": "sarah@example.com",
    "displayName": "Sarah Chen",
    "avatarUrl": "https://...",
    "userType": "CUSTOMER"
  },
  "answers": [
    {
      "id": "a123",
      "questionId": "q789",
      "userId": "u789",
      "body": { "type": "doc", "content": [...] },
      "createdAt": "2025-11-25T15:00:00Z",
      "updatedAt": "2025-11-25T15:00:00Z",
      "user": {
        "id": "u789",
        "displayName": "Local Expert",
        "avatarUrl": "https://..."
      },
      "comments": [
        {
          "id": "c456",
          "body": "Great answer!",
          "userId": "u111",
          "createdAt": "2025-11-25T16:00:00Z",
          "user": {
            "id": "u111",
            "displayName": "John Doe"
          }
        }
      ],
      "attachments": [
        {
          "id": "att1",
          "fileUrl": "https://example.com/image.jpg",
          "fileType": "image/jpeg"
        }
      ]
    }
  ],
  "comments": [
    {
      "id": "c123",
      "body": "When is the best season to visit?",
      "userId": "u222",
      "createdAt": "2025-11-25T17:00:00Z",
      "user": {
        "id": "u222",
        "displayName": "Jane Smith"
      }
    }
  ],
  "attachments": [
    {
      "id": "att2",
      "fileUrl": "https://example.com/map.jpg",
      "fileType": "image/jpeg"
    }
  ]
}
```

**Response 404**: Question not found

---

### PUT /api/questions/:id
**Purpose**: Update question (creator or ADMIN only)

**Authentication**: Required

**Request**:
```http
PUT /api/questions/q789
Content-Type: application/json
Cookie: sb-access-token=...

{
  "title": "Best Korean BBQ in Seoul? (Updated)",
  "body": { "type": "doc", "content": [...] },
  "category": "Food & Dining"
}
```

**Response 200**: Updated question object

**Response 403**: Forbidden (not creator)
**Response 404**: Not found

---

### DELETE /api/questions/:id
**Purpose**: Delete question (creator or ADMIN only)

**Authentication**: Required

**Request**:
```http
DELETE /api/questions/q789
Cookie: sb-access-token=...
```

**Response 204**: No content (success)

**Response 403**: Forbidden (not creator)
**Response 404**: Not found

---

## 3. Answers Endpoints

### POST /api/answers
**Purpose**: Create answer to a question

**Authentication**: Required (ANSWERER or ADMIN only)

**Request**:
```http
POST /api/answers
Content-Type: application/json
Cookie: sb-access-token=...

{
  "questionId": "q789",
  "body": {
    "type": "doc",
    "content": [...]
  }
}
```

**Validation**:
- questionId: Must reference existing question
- body: Valid Tiptap JSON, min 10 chars of text
- User must be ANSWERER or ADMIN

**Response 201**:
```json
{
  "id": "a123",
  "questionId": "q789",
  "userId": "u789",
  "body": { "type": "doc", "content": [...] },
  "createdAt": "2025-11-25T15:00:00Z",
  "updatedAt": "2025-11-25T15:00:00Z"
}
```

**Response 400**: Bad request (invalid question, validation error)
**Response 403**: Forbidden (user type doesn't allow answering)

---

### PUT /api/answers/:id
**Purpose**: Update answer (creator or ADMIN)

**Authentication**: Required

**Request**:
```http
PUT /api/answers/a123
Content-Type: application/json
Cookie: sb-access-token=...

{
  "body": { "type": "doc", "content": [...] }
}
```

**Response 200**: Updated answer object
**Response 403**: Forbidden
**Response 404**: Not found

---

### DELETE /api/answers/:id
**Purpose**: Delete answer (creator or ADMIN)

**Authentication**: Required

**Request**:
```http
DELETE /api/answers/a123
Cookie: sb-access-token=...
```

**Response 204**: No content
**Response 403**: Forbidden
**Response 404**: Not found

---

## 4. Comments Endpoints

### POST /api/comments
**Purpose**: Create comment on question or answer

**Authentication**: Required

**Request**:
```http
POST /api/comments
Content-Type: application/json
Cookie: sb-access-token=...

{
  "postType": "Question",
  "postId": "q789",
  "body": "When is the best season to visit?"
}
```

**Validation**:
- postType: 'Question' | 'Answer'
- postId: Must reference valid post
- body: 1-500 characters, required

**Response 201**:
```json
{
  "id": "c123",
  "postType": "Question",
  "postId": "q789",
  "userId": "u222",
  "body": "When is the best season to visit?",
  "createdAt": "2025-11-25T17:00:00Z",
  "updatedAt": "2025-11-25T17:00:00Z"
}
```

**Response 400**: Bad request
**Response 401**: Unauthorized (not logged in)

---

### DELETE /api/comments/:id
**Purpose**: Delete comment (creator only)

**Authentication**: Required

**Request**:
```http
DELETE /api/comments/c123
Cookie: sb-access-token=...
```

**Response 204**: No content
**Response 403**: Forbidden (not creator)
**Response 404**: Not found

---

## 5. File Upload Endpoint

### POST /api/upload
**Purpose**: Upload image file to Supabase Storage

**Authentication**: Required

**Request**:
```http
POST /api/upload
Content-Type: multipart/form-data
Cookie: sb-access-token=...

file=<binary image data>
postType=Question|Answer (optional, for context)
```

**Validation**:
- File must be image (MIME type: image/*)
- Max 5MB
- Allowed types: jpeg, png, gif, webp

**Response 201**:
```json
{
  "url": "https://example.supabase.co/storage/v1/object/public/question-images/q789/a1b2c3d4.jpg",
  "fileType": "image/jpeg"
}
```

**Response 400**: Bad request (invalid file, too large)
**Response 401**: Unauthorized
**Response 413**: Payload too large

---

## 6. Error Responses

### Standard Error Format
```json
{
  "error": "Error Type",
  "message": "Human readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| HTTP Code | Error | Code | Meaning |
|-----------|-------|------|---------|
| 400 | Bad Request | VALIDATION_ERROR | Input validation failed |
| 400 | Bad Request | INVALID_CATEGORY | Invalid category value |
| 400 | Bad Request | INVALID_FILE | File format/size issue |
| 401 | Unauthorized | AUTH_REQUIRED | Authentication needed |
| 403 | Forbidden | INSUFFICIENT_PERMISSION | User doesn't have permission |
| 403 | Forbidden | USER_TYPE_FORBIDDEN | User type can't perform action |
| 404 | Not Found | RESOURCE_NOT_FOUND | Resource doesn't exist |
| 409 | Conflict | CONFLICT | Concurrent modification detected |
| 413 | Payload Too Large | FILE_TOO_LARGE | Upload file exceeds max size |
| 500 | Internal Server Error | INTERNAL_ERROR | Server error |

---

## 7. Rate Limiting (Future)

For MVP, no rate limiting. Consider for Phase 2:
- 100 requests/minute per IP
- 1000 requests/hour per authenticated user

---

## 8. Pagination

All list endpoints support pagination:
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Starting position (default: 0)

Response includes:
- `total`: Total count of items
- `hasMore`: Boolean indicating if more results exist

---

## 9. Timestamps

All timestamps are ISO 8601 format with timezone:
- Format: `2025-11-25T14:30:00Z`
- Timezone: UTC (Z suffix)

---

## 10. Example Workflows

### Creating a Question with Images

```
1. POST /api/upload → Get image URL
2. Insert image URL into Tiptap editor
3. POST /api/questions {title, body with image, category} → Get question ID
```

### Answering a Question

```
1. GET /api/questions/:id → Get question details
2. POST /api/upload → Upload answer image (optional)
3. POST /api/answers {questionId, body with image} → Create answer
```

### Commenting on Answer

```
1. POST /api/comments {postType: 'Answer', postId: answerId, body}
```

---

## 11. Client Usage Example

```typescript
// Fetch questions
const response = await fetch('/api/questions?category=Food%20%26%20Dining')
const { questions, total } = await response.json()

// Create question
const question = await fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Best BBQ?',
    body: { type: 'doc', content: [...] },
    category: 'Food & Dining'
  })
})

// Get question detail
const detail = await fetch('/api/questions/q789')
const { question, answers, comments } = await detail.json()
```

---

## Document Status

- **Version**: 1.0
- **Last Updated**: 2025-11-30
- **Status**: Design Phase
- **Next Review**: Before Phase 1 route handler implementation
