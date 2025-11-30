# Tasks: Korean Travel Q&A Service MVP

**Feature Branch**: `1-qa-service-mvp`
**Status**: Ready for Implementation
**Input**: spec.md (5 user stories), plan.md (tech stack & architecture), research.md (decisions), data-model.md (entities), contracts/api.md (endpoints)

**Organization**: Tasks are grouped by user story priority to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- File paths included for exact implementation locations

---

## Phase 1: Setup & Environment (Shared Infrastructure)

**Purpose**: Project initialization and basic configuration

**Checkpoint**: All environment variables and tooling ready to proceed

- [ ] T001 Set up Supabase project and configure environment variables in `.env.local`
- [ ] T002 Initialize shadcn/ui CLI and configure mint theme colors in `globals.css`
- [ ] T003 [P] Install core dependencies: @supabase/supabase-js, @tiptap/react, react-hook-form, zod
- [ ] T004 [P] Create project directory structure: `src/lib/`, `src/components/`, `src/app/api/`
- [ ] T005 Update `src/app/layout.tsx` to include AuthProvider context wrapper

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until Phase 2 is 100% complete

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel or sequentially

- [ ] T006 Create TypeScript types in `src/types/index.ts` (UserProfile, Question, Answer, Comment, Attachment, UserType enums)
- [ ] T007 Set up Supabase database schema migration SQL (run in Supabase console)
  - Create tables: user_profiles, questions, answers, comments, attachments
  - Configure RLS policies for each table
  - Create indexes for search and filtering
- [ ] T008 [P] Implement Supabase client initialization in `src/lib/supabase.ts`
- [ ] T009 [P] Create authentication utilities in `src/lib/auth.ts` (login, logout, getCurrentUser)
- [ ] T010 [P] Create AuthContext component in `src/components/AuthContext.tsx` with useAuth hook
- [ ] T011 [P] Implement API error handling middleware in `src/lib/api-utils.ts`
- [ ] T012 [P] Create shadcn/ui theme customization file for mint colors in `src/lib/theme.ts`
- [ ] T013 Create middleware for protected routes in `src/middleware.ts`
- [ ] T014 [P] Set up API base route handlers in `src/app/api/` directory structure
  - Create directories: `api/auth/me/`, `api/questions/`, `api/answers/`, `api/comments/`, `api/upload/`
- [ ] T015 Create base route handler template with auth checks in `src/app/api/base-handler.ts`

---

## Phase 3: User Story 1 - Unregistered User Browsing Questions (P1) 🎯

**Goal**: Enable unregistered visitors to view questions, answers, and comments without creating an account

**Independent Test**:
- Visit homepage and see recent questions
- Browse full question list with search/filter
- View question detail with answers and comments
- Redirect to login when attempting to create

**Acceptance Scenarios**:
1. Homepage displays service intro and 5 most recent questions
2. Question list shows all questions with metadata (title, author, date, answer count)
3. Search by keywords returns matching questions
4. Category filter returns questions in selected category
5. Questions sorted by most recent first
6. Question detail page shows full content, all answers, all comments
7. Unregistered user cannot create question (redirect to login)

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create Question and UserProfile display components in `src/components/QuestionCard.tsx`
- [ ] T017 [P] [US1] Create Answer and Comment display components in `src/components/AnswerCard.tsx` and `src/components/CommentList.tsx`
- [ ] T018 [US1] Implement `GET /api/questions` route handler in `src/app/api/questions/route.ts` with search/filter/sort
- [ ] T019 [US1] Implement `GET /api/questions/:id` route handler in `src/app/api/questions/[id]/route.ts`
- [ ] T020 [US1] Update homepage (`src/app/page.tsx`) to fetch and display recent questions from API
- [ ] T021 [US1] Update questions list page (`src/app/questions/page.tsx`) to use real data with working search/filter/sort
- [ ] T022 [US1] Create question detail page (`src/app/questions/[id]/page.tsx`) with full content, answers, and comments
- [ ] T023 [US1] Add login redirect buttons for unregistered users trying to write content in `src/components/LoginPrompt.tsx`
- [ ] T024 [US1] Implement pagination for question list in `src/components/Pagination.tsx`
- [ ] T025 [US1] Add empty state components for no questions/answers found in `src/components/EmptyState.tsx`

**Checkpoint**: User Story 1 complete - unregistered browsing fully functional and independently testable

---

## Phase 4: User Story 2 - Traveler Asking Questions (P1)

**Goal**: Enable CUSTOMER users to create, edit, and delete their own questions with rich text and images

**Independent Test**:
- Register/login as CUSTOMER
- Create question with title, category, body text, and images
- See question appear in list and detail page
- Edit and delete own question
- Cannot edit/delete others' questions

**Acceptance Scenarios**:
1. CUSTOMER user can access question creation page after login
2. Form has fields: title, category, body (Tiptap editor), image upload
3. Tiptap editor supports: bold, bullets, quotes, links, images
4. Image upload to Supabase Storage works with validation (5MB max, jpg/png/gif/webp)
5. Question saves with creator ID, timestamp, and Tiptap JSON body
6. Created question appears in list and detail pages
7. Creator can edit question (updates timestamp)
8. Creator can delete question
9. Non-creator cannot edit/delete (except ADMIN)
10. Form validation shows errors for empty/invalid fields

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create Tiptap editor component in `src/components/RichTextEditor.tsx` with extensions: Bold, BulletList, BlockQuote, Link, Image
- [ ] T027 [P] [US2] Create shadcn/ui Form wrapper components in `src/components/QuestionForm.tsx` and `src/components/QuestionFormField.tsx`
- [ ] T028 [US2] Implement `POST /api/questions` route handler in `src/app/api/questions/route.ts` (create question)
- [ ] T029 [US2] Implement `PUT /api/questions/:id` route handler in `src/app/api/questions/[id]/route.ts` (edit question)
- [ ] T030 [US2] Implement `DELETE /api/questions/:id` route handler in `src/app/api/questions/[id]/route.ts` (delete question)
- [ ] T031 [US2] Implement `POST /api/upload` route handler in `src/app/api/upload/route.ts` (image upload to Supabase Storage)
- [ ] T032 [P] [US2] Create category enum/constants in `src/lib/constants.ts`
- [ ] T033 [US2] Update question creation page (`src/app/questions/new/page.tsx`) to use real form with Tiptap and validation
- [ ] T034 [US2] Create question edit page (`src/app/questions/[id]/edit/page.tsx`)
- [ ] T035 [US2] Add auth guard to question creation/edit pages to redirect non-CUSTOMER users
- [ ] T036 [US2] Add edit/delete buttons to question detail page (visible to creator/ADMIN only)
- [ ] T037 [US2] Implement form validation with zod schema in `src/lib/validation.ts`
- [ ] T038 [US2] Add error handling and user feedback for form submission failures

**Checkpoint**: User Story 2 complete - question creation/editing fully functional, independently testable from US1

---

## Phase 5: User Story 3 - Korean Local Answering Questions (P1)

**Goal**: Enable ANSWERER users to create, edit, and delete their own answers with rich text and images

**Independent Test**:
- Register/login as ANSWERER
- View question detail page
- Create answer with title, body (Tiptap), and images
- See answer appear under question
- Edit and delete own answer
- CUSTOMER user cannot see answer form
- ANSWERER can create questions like CUSTOMER

**Acceptance Scenarios**:
1. ANSWERER user sees answer form on question detail page
2. CUSTOMER user does NOT see answer form
3. Answer form has: body (Tiptap editor), image upload
4. Answer saves with creator ID, timestamp, and Tiptap JSON body
5. Answer appears under question in answers list with author info
6. Multiple answers can be created for one question
7. Creator can edit answer (updates timestamp)
8. Creator can delete answer
9. Non-creator cannot edit/delete (except ADMIN)
10. ANSWERER can also create questions (via Question Creation flow)

### Implementation for User Story 3

- [ ] T039 [P] [US3] Create Answer form component in `src/components/AnswerForm.tsx` (reuse Tiptap from US2)
- [ ] T040 [US3] Implement `POST /api/answers` route handler in `src/app/api/answers/route.ts` (create answer)
- [ ] T041 [US3] Implement `PUT /api/answers/:id` route handler in `src/app/api/answers/[id]/route.ts` (edit answer)
- [ ] T042 [US3] Implement `DELETE /api/answers/:id` route handler in `src/app/api/answers/[id]/route.ts` (delete answer)
- [ ] T043 [US3] Add answer form to question detail page (`src/app/questions/[id]/page.tsx`) with role-based visibility
- [ ] T044 [US3] Create answer edit page (`src/app/answers/[id]/edit/page.tsx`)
- [ ] T045 [US3] Add edit/delete buttons to each answer (visible to creator/ADMIN only)
- [ ] T046 [US3] Implement role check for answer creation (ANSWERER/ADMIN only) in API route
- [ ] T047 [US3] Update question detail page to fetch and display all answers for question
- [ ] T048 [US3] Add auth guard to answer creation/edit pages

**Checkpoint**: User Story 3 complete - answer creation/editing fully functional, independently testable from US1/US2

---

## Phase 6: User Story 4 - Community Engagement Through Comments (P2)

**Goal**: Enable logged-in users to comment on questions and answers for discussion

**Independent Test**:
- Login as any user
- Add comment to question
- Add comment to specific answer
- See comments appear with author info
- Delete own comment
- Unregistered user cannot comment (redirect to login)

**Acceptance Scenarios**:
1. Logged-in user sees comment form on question and each answer
2. Comment form accepts plain text (no rich formatting)
3. Comment saves with creator ID, timestamp, parent (question/answer) reference
4. Comment appears under parent with author avatar, name, timestamp
5. Multiple comments can be added to one question/answer
6. Creator can delete own comment
7. Non-creator cannot delete (except ADMIN)
8. Unregistered user sees comments but cannot post (login redirect)
9. Comment form validation requires min 1 char, max 500 chars

### Implementation for User Story 4

- [ ] T049 [P] [US4] Create Comment form component in `src/components/CommentForm.tsx` (plain text, no editor)
- [ ] T050 [US4] Implement `POST /api/comments` route handler in `src/app/api/comments/route.ts` (create comment)
- [ ] T051 [US4] Implement `DELETE /api/comments/:id` route handler in `src/app/api/comments/[id]/route.ts` (delete comment)
- [ ] T052 [US4] Update question detail page to fetch and display comments on question
- [ ] T053 [US4] Update answer components to display comments on each answer
- [ ] T054 [US4] Add comment form sections below question and each answer (conditional on auth)
- [ ] T055 [US4] Add delete buttons to comments (visible to creator/ADMIN only)
- [ ] T056 [US4] Implement role check for comment creation (authenticated users only) in API route
- [ ] T057 [US4] Add comment validation (1-500 chars) in zod schema

**Checkpoint**: User Story 4 complete - comments fully functional, independently testable from previous stories

---

## Phase 7: User Story 5 - Content Discovery and Organization (P2)

**Goal**: Enable users to efficiently find questions through search, filtering, and sorting

**Independent Test**:
- Use search to find questions by keyword (matches title/body)
- Filter by category to see only relevant questions
- Sort by newest/most viewed
- Combine search + filter + sort
- See empty state when no matches

**Acceptance Scenarios**:
1. Search box accepts keywords and searches title/body text
2. Search returns questions matching keywords in < 1 second
3. Category filter shows only questions in selected category
4. Multiple categories available (5-7 predefined)
5. Sort options: Newest, Most Viewed
6. Newest is default sort (most recent first)
7. Search + filter + sort can be combined
8. Empty state shown when no results match
9. Pagination shows more results when available
10. Active filters shown with clear button

### Implementation for User Story 5

- [ ] T058 [P] [US5] Enhance `GET /api/questions` route with full-text search implementation in `src/app/api/questions/route.ts`
- [ ] T059 [P] [US5] Add PostgreSQL FTS indexes for search optimization in database migration
- [ ] T060 [P] [US5] Create search and filter UI components in `src/components/QuestionFilters.tsx`
- [ ] T061 [US5] Implement category filter logic in questions list page (`src/app/questions/page.tsx`)
- [ ] T062 [US5] Implement sort logic (newest/mostViewed) in questions list page
- [ ] T063 [US5] Update API route to support sort parameter (created_at, views)
- [ ] T064 [US5] Add active filter badges with clear functionality in `src/components/ActiveFilters.tsx`
- [ ] T065 [US5] Implement loading state during search/filter operations
- [ ] T066 [US5] Add debouncing to search input in `src/lib/hooks/useDebounce.ts`
- [ ] T067 [US5] Create empty state component for no search results
- [ ] T068 [US5] Test full-text search performance with realistic data volume

**Checkpoint**: User Story 5 complete - discovery fully functional, independently testable from all previous stories

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories and overall quality

**Checkpoint**: All user stories complete, MVP ready for production

- [ ] T069 [P] Add error boundaries in `src/components/ErrorBoundary.tsx` for error handling
- [ ] T070 [P] Implement loading skeleton components in `src/components/Skeleton.tsx` for better UX
- [ ] T071 [P] Add toast/notification system in `src/components/Toast.tsx` for user feedback
- [ ] T072 [P] Implement logging throughout API routes for debugging
- [ ] T073 Create comprehensive README in root documenting setup, structure, deployment
- [ ] T074 Add TypeScript strict mode validation throughout codebase
- [ ] T075 [P] Test all user stories end-to-end on mobile (375px viewport)
- [ ] T076 [P] Verify responsive design breakpoints (375px, 768px, 1024px)
- [ ] T077 Run full user story scenarios in sequence to verify integration
- [ ] T078 Test edge cases (CUSTOMER trying to answer, ANSWERER creating questions, ADMIN deletions)
- [ ] T079 Performance optimization: verify search < 1 sec, image upload < 10 sec
- [ ] T080 Verify authentication flow: login redirect works, protected routes blocked
- [ ] T081 Test image upload validation (file size, type, error handling)
- [ ] T082 Document deployment instructions in `DEPLOYMENT.md`
- [ ] T083 Create `.env.example` with all required environment variables
- [ ] T084 [P] Run build and type checks: `npm run build && npm run typecheck`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 ✅ - BLOCKS all user stories
- **Phases 3-7 (User Stories)**: All depend on Phase 2 - can run in parallel or sequentially
- **Phase 8 (Polish)**: Depends on all desired user stories

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) → Deploy MVP

### User Story Dependencies

| Story | Depends On | Can Run Parallel With |
|-------|-----------|----------------------|
| US1 (Browse) | Phase 2 | None (has no dependencies on other stories) |
| US2 (Ask) | Phase 2 | US1 (can overlap, uses same API) |
| US3 (Answer) | Phase 2 + US1/US2 | US1 + US2 (depends on questions existing) |
| US4 (Comment) | Phase 2 + US1/US2/US3 | US1-US3 (depends on questions/answers existing) |
| US5 (Discover) | Phase 2 + US1/US2 | US1 + US2 (search/filter on questions) |

### Parallel Opportunities

**Phase 1 (Setup)**:
- All [P] tasks can run in parallel (T003, T004)

**Phase 2 (Foundational)**:
- All [P] tasks can run in parallel (T008, T009, T010, T011, T012, T014)
- Models (T006, T007) must complete before route handlers

**After Phase 2 Complete**:
- All user stories (US1-US5) can be worked on in parallel by different team members
- Within each story, [P] tasks can run in parallel

**Example Parallel Setup** (3 developers):

```
Developer A: Phase 1 (Setup) + Phase 2 (Foundations) → User Story 1 (Browse)
Developer B: [Waits for Phase 2] → User Story 2 (Ask)
Developer C: [Waits for Phase 2] → User Story 3 (Answer)

Later:
Developer A: [After US1] → User Story 5 (Discover)
Developer B: [After US2] → User Story 4 (Comment)
Developer C: [After US3] → Polish
```

---

## MVP Scope (Minimum Viable Product)

**Recommended MVP**: Phases 1-4 (US1-US3)

This delivers core value:
- ✅ Browse questions/answers without login (US1)
- ✅ Create/edit/delete questions as CUSTOMER (US2)
- ✅ Create/edit/delete answers as ANSWERER (US3)

**Timeline**: ~11 days for MVP (2 day setup + foundational, 3 days per user story)

**Post-MVP (Phase 5+)**: Add Comments, Search/Filter, Polish

---

## Task Completion Checklist

Use this to track progress as tasks are completed:

- [ ] **Phase 1 Complete**: Environment ready
  - All env vars configured
  - Dependencies installed
  - Project structure created
  - AuthProvider integrated

- [ ] **Phase 2 Complete**: Foundation ready (GATE for user stories)
  - Supabase schema created with RLS policies
  - Types defined and TypeScript strict
  - Auth context working
  - API error handling in place
  - Protected route middleware working
  - All route handler directories created

- [ ] **Phase 3 Complete**: US1 - Unregistered browsing fully functional
  - Homepage shows recent questions
  - Question list with search/filter/sort works
  - Question detail shows full content
  - Login redirects work for write actions
  - **Independent test passed**: Can browse without account

- [ ] **Phase 4 Complete**: US2 - Question creation fully functional
  - Create question form works with Tiptap editor
  - Image upload to Supabase works
  - Edit and delete own questions work
  - Questions appear in list/detail pages
  - **Independent test passed**: Can create questions as CUSTOMER

- [ ] **Phase 5 Complete**: US3 - Answer creation fully functional
  - Answer form visible to ANSWERER only
  - Create/edit/delete answers work
  - Answers appear under questions
  - CUSTOMER blocked from answering
  - **Independent test passed**: Can answer questions as ANSWERER

- [ ] **Phase 6 Complete**: US4 - Comments fully functional
  - Comment forms work on questions/answers
  - Comments appear with author info
  - Delete own comments works
  - Auth redirect for unregistered users
  - **Independent test passed**: Can comment and see all interactions

- [ ] **Phase 7 Complete**: US5 - Discovery fully functional
  - Search finds questions by keyword
  - Category filter works
  - Sorting works (newest/mostViewed)
  - Pagination works
  - **Independent test passed**: Can find questions efficiently

- [ ] **Phase 8 Complete**: Polish done
  - All components have error boundaries
  - Loading states implemented
  - Responsive design verified (375px+)
  - All user stories integrated
  - Build succeeds with no type errors
  - **Ready for production deployment**

---

## Notes

- **[P] marker**: Tasks can run in parallel (different files, no blocking dependencies)
- **[Story] label**: Maps task to specific user story (US1-US5) for traceability
- **Each user story**: Independently completable and testable
- **Commit strategy**: Commit after each major task or logical group completion
- **Stop points**: After each Phase Checkpoint, test that story independently before proceeding
- **File paths**: All absolute paths from repository root (`src/...`, `tests/...`)
- **Status tracking**: Check boxes as you complete, keep for audit trail

---

## Implementation Notes

### Key Design Decisions

1. **Route Handlers**: Use Next.js Route Handlers in `src/app/api/` for BFF pattern
2. **Database**: Direct Supabase queries (no ORM for MVP) with proper type safety
3. **Components**: shadcn/ui for consistency, Tiptap for rich text, React hooks for state
4. **Auth**: Supabase Auth with Google OAuth, cookies handled automatically
5. **Tests**: Not included (optional), but structure allows easy addition later

### Common Implementation Patterns

**API Route Template** (in `src/app/api/[resource]/route.ts`):
```typescript
// 1. Check authentication via cookies
// 2. Validate request body
// 3. Query Supabase with proper error handling
// 4. Return typed response or error (400/401/403/500)
```

**Component Template** (in `src/components/[Component].tsx`):
```typescript
// 1. Use shadcn/ui for consistent styling
// 2. Fetch data from `/api/[resource]` if needed
// 3. Handle loading/error states with Skeleton/Toast
// 4. Use hooks for form state (react-hook-form for shadcn/ui)
```

**Page Template** (in `src/app/[route]/page.tsx`):
```typescript
// 1. Check auth status via AuthContext
// 2. Fetch initial data from API
// 3. Render components with proper error boundaries
// 4. Add breadcrumbs/navigation context
```

---

## Document Status

- **Created**: 2025-11-30
- **Status**: Ready for Implementation
- **Total Tasks**: 84
- **Estimated Timeline**: 2-3 weeks for full MVP (depends on team size)
- **MVP Timeline**: 11 days (if focused on Phase 1-4)
