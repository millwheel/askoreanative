# Implementation Plan: Korean Travel Q&A Service MVP

**Feature Branch**: `1-qa-service-mvp`
**Created**: 2025-11-30
**Status**: Planning Phase

---

## 1. Technical Context

### Current State
- **Frontend**: Next.js 14 (App Router) with Tailwind CSS
- **Existing UI**: 4 pages mocked in `src/app/` (homepage, questions list, new question form)
- **Status**: UI skeleton complete, no backend integration yet
- **Mock Data**: Hardcoded questions with filtering/search logic
- **Editor**: No rich text editor (Tiptap) integrated yet
- **Auth**: No authentication implemented
- **DB**: No database connection

### Technology Stack (MVP)
- **Frontend Framework**: Next.js 14 (App Router)
- **Auth Service**: Supabase Auth (Google OAuth)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Rich Text Editor**: Tiptap (basic features only)
- **Styling**: TailwindCSS 4
- **State Management**: React hooks + Client Components for now
- **Deployment**: Vercel + Supabase

### Key Dependencies
- `@supabase/supabase-js`: Database & Auth client
- `@tiptap/react`: Rich text editor
- `@tiptap/starter-kit`: Tiptap basic extensions (Bold, BulletList, etc.)

### Unknowns / NEEDS CLARIFICATION
- [ ] Supabase project already created and configured?
- [ ] Environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) available?
- [ ] Image storage bucket already created in Supabase?
- [ ] Database schema already initialized?
- [ ] User role/AnswererType assignment logic - admin panel vs auto-assign?

### Integration Points
1. **Supabase Auth**: Replace mock login with real Google OAuth
2. **Database**: Connect to real Supabase PostgreSQL for questions/answers/comments
3. **File Storage**: Supabase Storage for image uploads
4. **API**: Next.js Route Handlers as BFF (Backend for Frontend)
5. **Type Safety**: TypeScript types from Supabase schema

---

## 2. Constitution Check

**Project Constitution**: `.specify/memory/constitution.md`

### Alignment Review
- ✅ **Scope**: MVP limited to core Q&A functionality
- ✅ **User Roles**: CUSTOMER, ANSWERER, ADMIN roles clearly defined
- ✅ **Data Model**: Comments/Attachments use postType/postId pattern
- ✅ **UI/UX**: Mint theme (#2EC4B6) applied in existing mockups
- ✅ **Mobile First**: All pages responsive (tested at 375px+)
- ✅ **No Over-Engineering**: Minimal dependencies, straightforward architecture
- ✅ **Future-Ready**: Repository pattern in BFF, easy backend migration

### Architecture Decisions Aligned
- No complex state management (hooks only)
- No ORM initially (direct Supabase queries)
- Client Components for interactivity, Server Components for content pages
- Route Handlers as unified API interface

---

## 3. Phase 0: Research & Decisions

### Research Tasks
1. **Supabase Configuration**
   - Task: Verify/create Supabase project and environment variables
   - Task: Confirm database schema matches data model in spec
   - Output: `.env.local` with Supabase credentials

2. **Tiptap Integration**
   - Task: Evaluate Tiptap extensions needed (bold, list, quote, link, image)
   - Task: Design image upload flow with Supabase Storage
   - Output: Understanding of extension configuration

3. **Authentication Flow**
   - Task: Determine Google OAuth callback URL for local/production
   - Task: Plan UserType assignment post-signup
   - Output: Auth flow documentation

4. **API Contract Design**
   - Task: Map existing mock pages to API endpoints
   - Task: Define request/response shapes matching spec
   - Output: API contract in contracts/ directory

### Deliverable
**research.md** - Document all decisions and rationale

---

## 4. Phase 1: Design & Core Setup (Week 1)

### 4.1 Data Model & Database Schema
**Input**: Specification entities
**Output**: `data-model.md` + Database migrations

**Tasks**:
1. Create TypeScript type definitions (types/index.ts)
   - UserProfile (id, email, displayName, avatarUrl, languagePreference, userType, answererType)
   - Question (id, userId, title, body, category, createdAt, updatedAt)
   - Answer (id, questionId, userId, body, createdAt, updatedAt)
   - Comment (id, postType, postId, userId, body, createdAt, updatedAt)
   - Attachment (id, postType, postId, fileUrl, fileType, createdAt, updatedAt)
   - Enums: UserType, AnswererType, PostType, CategoryEnum

2. Set up Supabase database schema
   - Create tables with RLS policies (read-only for unregistered, authenticated users respect ownership)
   - Create indexes for search/filter queries
   - Create foreign key relationships

3. Generate TypeScript types from Supabase (using Supabase CLI)

**Owner**: Backend setup
**Estimated**: 2 days

### 4.2 API Contracts
**Input**: Functional requirements, mock pages
**Output**: `contracts/api.md` (OpenAPI-style reference)

**Endpoints to Document**:
- `GET /api/auth/me` - Current user profile
- `GET /api/questions` - List with filters/search
- `POST /api/questions` - Create question (CUSTOMER/ANSWERER only)
- `GET /api/questions/:id` - Question detail with answers/comments
- `PUT /api/questions/:id` - Edit question (creator only)
- `DELETE /api/questions/:id` - Delete question (creator/ADMIN)
- `POST /api/answers` - Create answer (ANSWERER only)
- `PUT /api/answers/:id` - Edit answer (creator/ADMIN)
- `DELETE /api/answers/:id` - Delete answer (creator/ADMIN)
- `POST /api/comments` - Create comment (logged-in only)
- `DELETE /api/comments/:id` - Delete comment (creator only)
- `POST /api/upload` - Upload image to Supabase Storage

**Owner**: API design
**Estimated**: 1 day

### 4.3 Setup Route Handlers (BFF Layer)
**Input**: API contracts
**Output**: Route handler stubs in `src/app/api/`

**Structure**:
```
src/app/api/
├── auth/
│   └── me/route.ts
├── questions/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       ├── route.ts (GET, PUT, DELETE)
│       └── comments/route.ts
├── answers/
│   └── [id]/
│       └── route.ts (PUT, DELETE)
├── comments/
│   └── [id]/
│       └── route.ts (DELETE)
└── upload/
    └── route.ts (POST)
```

**Implementation**:
- Route handler stubs with proper error handling
- Request validation
- Database queries via Supabase client
- Authorization checks (userType, ownership)

**Owner**: BFF implementation
**Estimated**: 3 days

### 4.4 Update Existing Pages to Use Real Data
**Input**: Mock pages, API contracts
**Output**: Enhanced pages connected to Supabase

**Pages to Update**:
1. **Homepage** (`src/app/page.tsx`)
   - Replace mock data with `GET /api/questions` (limit 5)
   - Add "Ask Question" button with redirect logic
   - Add navigation to `/login` for unregistered

2. **Questions List** (`src/app/questions/page.tsx`)
   - Connect search/filter to API
   - Add pagination (optional for MVP)
   - Add "View Details" navigation to detail page

3. **Create Question** (`src/app/questions/new/page.tsx`)
   - Add auth guard (redirect to login if not authenticated)
   - Integrate Tiptap editor for body
   - Handle form submission to `POST /api/questions`

4. **Question Detail** (NEW: `src/app/questions/[id]/page.tsx`)
   - Fetch question, answers, comments from `GET /api/questions/:id`
   - Render rich text bodies (from Tiptap JSON)
   - Show answer form (conditional on ANSWERER role)
   - Show comment sections (question + per-answer)
   - Edit/delete buttons for creators and ADMIN

**Owner**: Frontend integration
**Estimated**: 4 days

### 4.5 Tiptap Editor Integration
**Input**: Specification requirements
**Output**: Reusable editor component

**Requirements**:
- Bold formatting
- Bullet lists
- Quote/blockquote
- Hyperlinks
- Image upload (to Supabase Storage)
- No Undo/Redo (removed from spec)

**Component**: `src/components/RichTextEditor.tsx`
- Custom toolbar with mint theme
- Image upload handler with Supabase integration
- JSON serialization for storage

**Owner**: Editor component
**Estimated**: 2 days

### 4.6 Authentication Integration
**Input**: Supabase Auth setup
**Output**: Auth context/hooks + login page

**Tasks**:
1. Create `src/lib/auth.ts` - Supabase auth utilities
2. Create `src/components/AuthContext.tsx` - User state provider
3. Create `src/app/login/page.tsx` - Login page with Google OAuth
4. Create `src/hooks/useAuth.ts` - Custom hook for accessing auth state
5. Add middleware for protected pages

**Owner**: Auth implementation
**Estimated**: 2 days

### 4.7 Agent Context Update
**Task**: Run Supabase configuration script
```bash
.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

**Purpose**: Document tech stack in agent context
**Owner**: DevOps/Documentation
**Estimated**: 0.5 days

---

## 5. Phase 2: Feature Implementation (Week 2)

### 5.1 Answer Creation & Management
**Input**: API routes for answers
**Output**: Answer form component, answer display

**Components**:
- `AnswerForm.tsx` - Inline form on question detail page
- `AnswerList.tsx` - Display answers with edit/delete controls

**Features**:
- Create answer (ANSWERER only)
- Edit own answer
- Delete own answer (+ ADMIN can delete any)
- Rich text display from Tiptap JSON

**Owner**: Feature implementation
**Estimated**: 2 days

### 5.2 Comment System
**Input**: Comment API routes
**Output**: Comment form + comment list components

**Components**:
- `CommentForm.tsx` - Inline comment input
- `CommentList.tsx` - Display comments with delete button

**Features**:
- Post comment on questions/answers (logged-in only)
- Delete own comment
- Display comment author info

**Owner**: Feature implementation
**Estimated**: 1 day

### 5.3 Image Upload & Gallery
**Input**: Supabase Storage setup, Tiptap image integration
**Output**: Image upload/gallery functionality

**Features**:
- Upload images during question/answer creation
- Gallery display on detail pages
- Supabase URL generation

**Owner**: File handling
**Estimated**: 1 day

### 5.4 Search & Filtering
**Input**: Questions list page mock
**Output**: Real search/filter with API

**Features**:
- Full-text search on title/body
- Category filtering
- Sort by recency/views

**Owner**: Search implementation
**Estimated**: 1 day

### 5.5 Mobile Optimization & Polish
**Input**: Existing responsive design
**Output**: Tested mobile experience

**Testing**:
- Test all flows at 375px, 768px, 1024px widths
- Fix any responsive issues
- Optimize touch interactions

**Owner**: QA/Polish
**Estimated**: 1 day

---

## 6. Implementation Strategy: Fastest MVP Path

### Priority Order (Core to Nice-to-Have)
1. **Phase 0**: Research & Supabase setup (enable all other work)
2. **Auth**: Login/session management (gates all features)
3. **Question CRUD**: Create/read questions (core value)
4. **Answer CRUD**: Create/read answers (core value)
5. **Comments**: Optional for MVP v1, easy to add after
6. **Search/Filter**: Nice-to-have (mock works for demo)
7. **Polish**: Responsive refinement

### Parallel Work Streams
- Stream A: Database & API routes (backend)
- Stream B: Components & pages (frontend)
- These can run in parallel with contract definitions as sync point

### MVP Milestones
- **Milestone 1** (End of Day 2): Supabase setup + API routes stubs ready
- **Milestone 2** (End of Week 1): All pages connected to real data, auth working
- **Milestone 3** (End of Week 2): Full feature set, testing & polish

---

## 7. Success Metrics (From Specification)

### Measurable Outcomes to Verify
- SC-001: Users can view 10+ questions on homepage without login
- SC-002: CUSTOMER users can create a question in < 3 minutes
- SC-003: ANSWERER users can post an answer in < 2 minutes
- SC-004: Search/filter returns results in < 1 second
- SC-005: Image upload completes in < 10 seconds
- SC-006: Mobile interface works on 375px+ screens
- SC-007: 95% auth success rate

### Testing Approach
- Manual end-to-end flow testing
- Mobile device/browser testing
- Load testing for concurrent users (basic)

---

## 8. Out of Scope (Phase 2+)
- User profiles/history
- Notifications
- Real-time updates
- Reputation/karma
- Answer upvoting
- Admin dashboard
- Advanced analytics
- Multi-language support
- Mobile native apps
- Backend separation to Spring/NestJS

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase not configured | Blocks all work | Set up before phase 1 start |
| Tiptap complexity | Delays editor | Use starter-kit, simple config |
| Image upload/storage errors | Feature breaks | Test with local files first |
| Auth flow not complete | Blocks feature testing | Configure OAuth early |
| Database schema mismatch | API errors | Generate types from schema |
| Performance issues | Poor UX | Monitor with real data volumes |

---

## 10. Files to Create/Modify

### New Files
- `specs/1-qa-service-mvp/research.md` - Research findings
- `specs/1-qa-service-mvp/data-model.md` - Data model details
- `specs/1-qa-service-mvp/contracts/api.md` - API documentation
- `src/types/index.ts` - TypeScript type definitions
- `src/lib/auth.ts` - Auth utilities
- `src/lib/supabase.ts` - Supabase client setup
- `src/lib/api-client.ts` - Frontend API utilities
- `src/components/RichTextEditor.tsx` - Tiptap editor
- `src/components/AuthContext.tsx` - Auth provider
- `src/components/AnswerForm.tsx` - Answer creation
- `src/components/CommentForm.tsx` - Comment creation
- `src/app/login/page.tsx` - Login page
- `src/app/questions/[id]/page.tsx` - Question detail
- `src/app/questions/[id]/edit/page.tsx` - Question edit (optional)
- `src/app/api/.../*` - All route handlers

### Modified Files
- `src/app/layout.tsx` - Add auth context provider
- `src/app/page.tsx` - Connect to real API
- `src/app/questions/page.tsx` - Connect to real API
- `src/app/questions/new/page.tsx` - Integrate Tiptap, form submission

### Database
- Migration files for schema setup

---

## 11. Next Steps

1. ✅ Complete Phase 0 research (Supabase setup, decisions)
2. Generate `research.md` documenting all decisions
3. Begin Phase 1 in parallel streams:
   - Database schema + type generation
   - Component/page scaffolding
4. Sync on API contracts as central coordination point
5. Begin integration once Supabase + API routes ready
6. Deploy to Vercel for team testing

---

## Status

**Phase 0**: Starting research phase
**Phase 1**: Ready to begin after research complete
**Phase 2**: Follows phase 1

---

## Document Management

- **Last Updated**: 2025-11-30
- **Maintainer**: Development Team
- **Related Artifacts**:
  - `spec.md` - Feature specification
  - `research.md` - Research findings (to be created)
  - `data-model.md` - Data model details (to be created)
  - `contracts/api.md` - API contracts (to be created)
