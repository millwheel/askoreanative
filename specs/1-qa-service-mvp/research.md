# Research & Technical Decisions: Korean Travel Q&A Service MVP

**Created**: 2025-11-30
**Status**: Pre-Implementation Phase
**Related**: `plan.md`, `spec.md`

---

## Overview

This document captures key technical decisions, research findings, and unknowns that must be resolved before Phase 1 implementation begins.

---

## 1. Supabase Configuration

### Status: NEEDS VERIFICATION

**Questions to Resolve**:
- Is a Supabase project already created for this repository?
- Are environment variables configured in `.env.local`?
- Has the database schema been initialized?
- Is an image storage bucket created?

**Action Items**:
1. Check `.env.local` for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Optional: `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

2. Verify Supabase project:
   - Navigate to Supabase dashboard
   - Confirm project is active
   - Check if database has any existing tables

3. Create storage bucket if not exists:
   - Bucket name: `question-images` (or `attachments`)
   - Make public for image serving
   - Configure CORS for Next.js domain

4. Initialize database schema (see Section 4 - Database Schema)

---

## 2. Technology Decision: Tiptap Integration

### Decision: Use `@tiptap/starter-kit`

**Rationale**:
- Provides pre-configured extensions (Bold, Italic, Heading, BulletList, OrderedList, CodeBlock, BlockQuote, Link, HorizontalRule, Image, Strike, Code, History)
- Reduces boilerplate configuration
- Well-documented and actively maintained
- Tight React integration with hooks

**Planned Extensions**:
- ✅ Bold - Required by spec
- ✅ BulletList - Required by spec
- ✅ BlockQuote - Required by spec (rendered as Quote)
- ✅ Link - Required by spec (Hyperlink)
- ✅ Image - Required by spec (with Supabase Storage upload)
- ❌ Heading - Not in spec (keep default removal)
- ❌ OrderedList - Not explicitly required (can add if needed)
- ❌ Code - Not in spec
- ❌ CodeBlock - Not in spec

**Custom Implementation Needed**:
- Image upload handler (POST to `/api/upload`)
- Menu/toolbar styling (mint theme colors)
- JSON serialization (already included in Tiptap)

**Key Imports**:
```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
```

**Estimated Effort**: 2 days for full integration

---

## 3. Authentication Decision: Supabase Auth + Google OAuth

### Decision: Supabase Auth with Google OAuth Provider

**Rationale**:
- Supabase Auth integrates seamlessly with Supabase PostgreSQL
- Google OAuth is industry-standard, familiar to most users
- No additional third-party auth service needed
- RLS (Row-Level Security) in Postgres integrates with Supabase Auth

**Flow**:
1. User clicks "Login with Google"
2. Redirects to Supabase Auth UI
3. Google OAuth confirmation
4. Supabase creates user in `auth.users` table
5. Application creates corresponding `UserProfile` record
6. Redirect to `/questions` or `redirectTo` parameter

**UserType Assignment**:
- **Option A** (Recommended for MVP): Default all new users to CUSTOMER
  - Rationale: Simple, reversible, matches most travelers
  - ANSWERER role assigned manually by admins later
- **Option B**: Show role selection form post-signup
  - Complexity: Adds extra step, but more accurate
  - Recommended for production

**Chosen**: Option A (default to CUSTOMER)

**Google OAuth Setup**:
1. Create Google Cloud project (if not exists)
2. Set up OAuth 2.0 credentials (Web application type)
3. Configure callback URL: `https://<project>.supabase.co/auth/v1/callback`
4. Add production domain to callback URLs
5. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` with Google provider enabled in Supabase

**Middleware for Protected Routes**:
```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if accessing protected routes
  if (!user && request.nextUrl.pathname.startsWith('/questions/new')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

export const config = {
  matcher: ['/questions/new', '/questions/[id]/edit', '/api/:path*']
}
```

**Estimated Effort**: 2 days for full implementation

---

## 4. Database Schema Design

### TypeScript Entity Definitions

```typescript
// UserProfile
type UserProfile = {
  id: string                    // UUID from auth.users
  email: string
  displayName: string
  avatarUrl?: string
  languagePreference: 'en' | 'ko'
  userType: 'CUSTOMER' | 'ANSWERER' | 'ADMIN'
  answererType?: 'KOREAN_NATIVE' | 'LONG_TERM_RESIDENT'
  createdAt: Date
  updatedAt: Date
}

// Question
type Question = {
  id: string                    // UUID
  userId: string                // FK to UserProfile.id
  title: string
  body: any                     // Tiptap JSON
  category: string
  createdAt: Date
  updatedAt: Date
}

// Answer
type Answer = {
  id: string                    // UUID
  questionId: string            // FK to Question.id
  userId: string                // FK to UserProfile.id
  body: any                     // Tiptap JSON
  createdAt: Date
  updatedAt: Date
}

// Comment
type Comment = {
  id: string                    // UUID
  postType: 'Question' | 'Answer'
  postId: string                // Either Question.id or Answer.id
  userId: string                // FK to UserProfile.id
  body: string                  // Plain text only
  createdAt: Date
  updatedAt: Date
}

// Attachment
type Attachment = {
  id: string                    // UUID
  postType: 'Question' | 'Answer'
  postId: string                // Either Question.id or Answer.id
  fileUrl: string               // Supabase Storage URL
  fileType: string              // 'image/jpeg', 'image/png', etc.
  createdAt: Date
  updatedAt: Date
}
```

### SQL Schema (Postgres)

```sql
-- UserProfile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  language_preference TEXT DEFAULT 'en',
  user_type TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (user_type IN ('CUSTOMER', 'ANSWERER', 'ADMIN')),
  answerer_type TEXT CHECK (answerer_type IS NULL OR answerer_type IN ('KOREAN_NATIVE', 'LONG_TERM_RESIDENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body JSONB NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  body JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type TEXT NOT NULL CHECK (post_type IN ('Question', 'Answer')),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comments_post ON comments(post_type, post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type TEXT NOT NULL CHECK (post_type IN ('Question', 'Answer')),
  post_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_attachments_post ON attachments(post_type, post_id);

-- RLS Policies (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read user_profiles, questions, answers, comments, attachments
CREATE POLICY "read_policy" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "read_policy" ON questions FOR SELECT USING (true);
CREATE POLICY "read_policy" ON answers FOR SELECT USING (true);
CREATE POLICY "read_policy" ON comments FOR SELECT USING (true);
CREATE POLICY "read_policy" ON attachments FOR SELECT USING (true);

-- Allow authenticated users to manage their own content
CREATE POLICY "insert_questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_questions" ON questions FOR UPDATE USING (auth.uid() = user_id OR (SELECT user_type FROM user_profiles WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "delete_questions" ON questions FOR DELETE USING (auth.uid() = user_id OR (SELECT user_type FROM user_profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "insert_answers" ON answers FOR INSERT WITH CHECK (auth.uid() = user_id AND (SELECT user_type FROM user_profiles WHERE id = auth.uid()) IN ('ANSWERER', 'ADMIN'));
CREATE POLICY "update_answers" ON answers FOR UPDATE USING (auth.uid() = user_id OR (SELECT user_type FROM user_profiles WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "delete_answers" ON answers FOR DELETE USING (auth.uid() = user_id OR (SELECT user_type FROM user_profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "insert_comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "insert_attachments" ON attachments FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM questions WHERE id = post_id UNION SELECT user_id FROM answers WHERE id = post_id));
```

**Notes**:
- RLS enables fine-grained access control at the database level
- ADMIN can bypass certain restrictions (delete any question/answer)
- Foreign keys cascade on delete for cleanup

**Estimated Effort**: 1 day to set up and test

---

## 5. API Contract Outline

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://askoreanative.vercel.app/api`

### Authentication
- Cookie-based (Supabase Auth cookies automatically managed)
- Supabase client validates `auth.uid()` in middleware

### Error Handling
- 400: Bad Request (validation error)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

### Sample Endpoints

#### GET /api/questions
```
Query Params:
  search?: string        (search in title + body)
  category?: string      (filter by category)
  sortBy?: 'newest' | 'mostViewed' (default: newest)
  limit?: number         (default: 20, max: 100)
  offset?: number        (default: 0)

Response 200:
{
  questions: Question[],
  total: number,
  hasMore: boolean
}
```

#### POST /api/questions
```
Body:
{
  title: string (required, min: 5, max: 200)
  body: object (Tiptap JSON, required)
  category: string (required, must be valid category)
}

Response 201:
{
  id: string,
  title: string,
  body: object,
  category: string,
  userId: string,
  createdAt: string
}

Auth: Required (CUSTOMER or ANSWERER)
```

#### POST /api/upload
```
Body: FormData with 'file' field

Response 201:
{
  url: string,  // Supabase public URL
  fileType: string
}

Auth: Required
```

**Full contract**: To be documented in `contracts/api.md` (Phase 1)

---

## 6. Image Upload Strategy

### Decision: Supabase Storage + Signed URLs

**Flow**:
1. User selects image in editor
2. Frontend uploads to `/api/upload`
3. Route handler uploads to Supabase Storage `question-images` bucket
4. Returns public URL
5. Tiptap inserts `<img src="{url}">`
6. On form submit, entire Tiptap JSON (with image URLs) saved to question.body

**URL Strategy**:
- Use Supabase public URLs (no signatures needed)
- Format: `https://<project>.supabase.co/storage/v1/object/public/question-images/{filename}`

**Validation**:
- Max file size: 5MB (enforced in route handler)
- Allowed types: jpg, png, gif, webp
- Filename: UUID + extension (prevent collisions)

**Bucket Setup** (in Supabase):
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true);

-- Allow public read
CREATE POLICY "public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'question-images');

-- Allow authenticated upload to own user's folder
CREATE POLICY "authenticated upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'question-images'
    AND auth.role() = 'authenticated'
  );

-- Allow delete own files
CREATE POLICY "delete own uploads" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'question-images'
    AND owner_id = auth.uid()
  );
```

---

## 7. Search Implementation Strategy

### Decision: Full-Text Search in PostgreSQL

**Approach**:
- Create GiST index on title + body for fast searching
- Use PostgreSQL `tsvector` for text search

**SQL (Phase 1)**:
```sql
-- Add search vector column
ALTER TABLE questions ADD COLUMN search_vector tsvector;

-- Generate from title + body (for now, body is Tiptap JSON)
-- Note: Need to extract text from Tiptap JSON for indexing
UPDATE questions SET search_vector = to_tsvector('english', title || ' ' || COALESCE(body::text, ''));

-- Create trigger to maintain search_vector
CREATE TRIGGER questions_search_vector_trigger
BEFORE INSERT OR UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title);

-- Create GiST index
CREATE INDEX idx_questions_search ON questions USING GiST(search_vector);
```

**Query Example**:
```typescript
const query = supabase
  .from('questions')
  .select('*')
  .or(`search_vector.@@ to_tsquery('${searchTerm}')`)
```

---

## 8. State Management Approach

### Decision: React Hooks + Server State (Supabase)

**Rationale**:
- No complex UI state (just forms + filters)
- Supabase is single source of truth
- Avoid Redux/Zustand boilerplate for MVP

**Pattern**:
```typescript
// Component state for form/UI
const [title, setTitle] = useState('')
const [isLoading, setIsLoading] = useState(false)

// Auth state via custom hook
const { user, isAuthenticated } = useAuth()

// Data fetching via useEffect
useEffect(() => {
  fetchQuestions(searchTerm, category)
}, [searchTerm, category])
```

**Auth Context** (Single provider):
```typescript
// src/components/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user)
    })
    return () => data?.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 9. Performance Considerations

### Image Optimization
- Use `next/image` for automatic optimization
- Lazy load images on detail pages
- Set max-width for embedded images in Tiptap

### Database Queries
- Index on `questions.created_at`, `questions.category`
- Limit results with pagination (20 per page)
- Use Supabase query optimization

### Frontend Bundle
- Keep dependencies minimal (no Redux, Zustand, etc.)
- Code split pages with dynamic imports if needed
- Use Next.js built-in optimizations

---

## 10. Testing Strategy

### Manual Testing (MVP)
- Test question CRUD for CUSTOMER users
- Test answer CRUD for ANSWERER users
- Test comment creation
- Test login/logout flow
- Test mobile responsiveness (375px+)
- Test image upload

### Automated Testing (Phase 2+)
- Unit tests for API routes
- Integration tests for auth flows
- E2E tests with Playwright

---

## 11. Deployment Strategy

### MVP Deployment
- Frontend: Vercel (automatic from Git)
- Backend: Same (Vercel Functions)
- Database: Supabase (hosted)
- Storage: Supabase Storage
- Domain: TBD

### Environment Setup
```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# .env.production (Vercel)
# (same as above, set in Vercel dashboard)
```

---

## 12. Summary of Decisions

| Item | Decision | Rationale |
|------|----------|-----------|
| Rich Text Editor | Tiptap + Starter Kit | Minimal config, required features |
| Auth | Supabase Auth + Google OAuth | Seamless integration, no 3rd party |
| Database | Supabase PostgreSQL | Single vendor, RLS support |
| Image Storage | Supabase Storage | Unified platform |
| State Management | React Hooks | Minimal complexity for MVP |
| Search | PostgreSQL FTS | Built-in, no additional service |
| Default UserType | CUSTOMER | Simple, reversible |
| Deployment | Vercel + Supabase | Fast setup, scalable |

---

## 13. Next Steps

1. ✅ **Verify Supabase Setup**
   - Create/confirm Supabase project
   - Set up environment variables
   - Create storage bucket

2. ✅ **Initialize Database**
   - Run schema migration SQL
   - Set up RLS policies
   - Create indexes

3. ⏳ **Generate TypeScript Types**
   - Use Supabase CLI: `supabase gen types typescript`
   - Add to `src/types/database.ts`

4. ⏳ **Begin Phase 1**
   - Implement route handlers
   - Create components
   - Integrate pages

---

## Document Status

- **Created**: 2025-11-30
- **Last Updated**: 2025-11-30
- **Status**: Research Phase Complete
- **Next Review**: Before Phase 1 implementation starts
