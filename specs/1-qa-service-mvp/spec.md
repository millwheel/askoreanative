# Feature Specification: Korean Travel Q&A Service MVP

**Feature Branch**: `1-qa-service-mvp`
**Created**: 2025-11-30
**Status**: Draft
**Input**: Askoreanative MVP - 한국 여행 Q&A 서비스

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unregistered User Browsing Questions (Priority: P1)

An unregistered visitor wants to explore questions and answers about traveling to Korea without creating an account. They should be able to discover relevant travel advice from local experts.

**Why this priority**: This is the entry point to the service. Removing registration barriers increases discoverability and user retention.

**Independent Test**: Can be fully tested by visiting homepage, browsing question list, viewing question details without authentication. Delivers value as read-only Q&A discovery experience.

**Acceptance Scenarios**:

1. **Given** an unregistered user visits the homepage, **When** they see the interface, **Then** they see service introduction and a list of recent questions
2. **Given** an unregistered user is on the question list, **When** they search or filter by category, **Then** they see matching questions sorted by recency
3. **Given** an unregistered user views a question detail page, **When** they try to write a question or answer, **Then** they are redirected to login
4. **Given** an unregistered user views a question, **When** they view answers and comments, **Then** they can read all content without authentication

---

### User Story 2 - Traveler Asking Questions (Priority: P1)

A traveler wants to ask specific questions about planning their Korea trip. They register/login as a CUSTOMER and post a question with text, images, and category information.

**Why this priority**: Asking questions is core to the service value proposition. This is the primary content creation flow for users.

**Independent Test**: Can be fully tested by registering as CUSTOMER, creating a question with title/body/category/images, and verifying it appears in the question list. Delivers core value of enabling question creation.

**Acceptance Scenarios**:

1. **Given** a user is logged in with `UserType = CUSTOMER`, **When** they click "Ask a Question", **Then** they are taken to the question creation page
2. **Given** a traveler is on the question creation page, **When** they fill in title, category, body text, and upload images, **Then** all content is properly formatted and saved
3. **Given** a traveler submits a question, **When** the question is saved successfully, **Then** they are redirected to the question detail page showing their new question
4. **Given** a question creator visits their question detail page, **When** they look at their question, **Then** they see options to edit or delete their question (if they are the creator)
5. **Given** a question creator clicks edit, **When** they modify content and save, **Then** the updated content is reflected with updated timestamp

---

### User Story 3 - Korean Local/Resident Answering Questions (Priority: P1)

A Korean native or long-term resident wants to share travel advice. They register/login with `UserType = ANSWERER` and can post detailed answers with images and formatting, plus create their own questions.

**Why this priority**: Answers are the core value delivery. Enabling experienced locals to provide high-quality advice is essential to service success.

**Independent Test**: Can be fully tested by registering as ANSWERER, viewing a question, posting an answer with text/images, and verifying it appears. Delivers core value of answer creation.

**Acceptance Scenarios**:

1. **Given** a user is logged in with `UserType = ANSWERER`, **When** they view a question detail page, **Then** they see a form to post an answer
2. **Given** an answerer fills in their response with text and images, **When** they submit, **Then** the answer is saved with their user information and timestamp
3. **Given** an answerer has posted an answer, **When** they view the question detail, **Then** they can edit or delete their own answer
4. **Given** a user with `UserType = CUSTOMER`, **When** they view a question, **Then** they cannot see the answer submission form
5. **Given** an answerer submits an answer, **When** the question creator views it, **Then** the answer appears in the question's answer list
6. **Given** an ANSWERER user, **When** they want to ask a question, **Then** they can create questions just like CUSTOMER users

---

### User Story 4 - Community Engagement Through Comments (Priority: P2)

Users want to ask clarification questions or provide feedback on existing questions and answers through comments. This enables discussion without creating separate Q&A pairs.

**Why this priority**: Comments add depth to discussions and help clarify understanding. Secondary to core Q&A functionality but improves user satisfaction.

**Independent Test**: Can be fully tested by posting comments on questions/answers and verifying they appear. Delivers value of discussion/clarification.

**Acceptance Scenarios**:

1. **Given** a logged-in user views a question, **When** they see a comment section, **Then** they can write and submit a comment
2. **Given** a user submits a comment on a question, **When** the comment is saved, **Then** it appears under the question's comment list with author and timestamp
3. **Given** a user views an answer, **When** they submit a comment on that answer, **Then** the comment appears linked to that specific answer
4. **Given** a comment author views their comment, **When** they click delete, **Then** the comment is removed from the system
5. **Given** an unregistered user views comments, **When** they try to post a comment, **Then** they are prompted to login

---

### User Story 5 - Content Discovery and Organization (Priority: P2)

Users want to efficiently find relevant travel questions. They can search by keywords, filter by category, and browse sorted by recency.

**Why this priority**: Discovery mechanisms determine whether users find useful content. Important for user engagement but secondary to core Q&A creation.

**Independent Test**: Can be fully tested by using search, category filters, and sorting controls independently. Delivers value of content discoverability.

**Acceptance Scenarios**:

1. **Given** a user is on the questions list page, **When** they enter search keywords, **Then** questions matching the search terms appear (title/body match)
2. **Given** a user sees category filter options, **When** they select a category, **Then** only questions in that category are displayed
3. **Given** a user is browsing questions, **When** they view the list, **Then** questions are sorted by most recent first
4. **Given** a user applies multiple filters (search + category), **When** they are applied, **Then** results are filtered by all criteria
5. **Given** a user searches for non-existent content, **When** no matches are found, **Then** they see a helpful empty state message

---

### Edge Cases

- What happens when a CUSTOMER user tries to post an answer? → System should deny the action and show appropriate message
- What happens when an ADMIN user tries to delete another user's question? → System should allow the deletion
- What happens when an image upload fails during question/answer creation? → User should be notified and able to retry
- What happens when a user tries to edit/delete content they don't own (non-ADMIN)? → System should deny the action and show 403 error
- What happens when a question has no answers yet? → The question should still be viewable with empty answers section
- What happens when a user deletes their account after creating questions/answers? → Their content should be retained but marked as deleted user
- What happens when a comment is posted on a deleted answer? → System should prevent the action since parent doesn't exist
- What happens when an ANSWERER user wants to create a question? → System should allow it (ANSWERER can do both questions and answers)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**:
- **FR-001**: System MUST allow users to login via Supabase Auth (Google OAuth as primary method)
- **FR-002**: System MUST assign `UserType` to each user from enum: `CUSTOMER`, `ANSWERER`, `ADMIN`
- **FR-003**: System MUST support `AnswererType` enum for ANSWERER users: `KOREAN_NATIVE`, `LONG_TERM_RESIDENT`
- **FR-004**: System MUST enforce that `CUSTOMER` users can only create questions
- **FR-005**: System MUST enforce that `ANSWERER` users can create both questions and answers
- **FR-006**: System MUST enforce that `ADMIN` users can delete any questions and answers (in addition to their own)
- **FR-007**: System MUST ensure users can only edit/delete their own content (except ADMIN)
- **FR-008**: System MUST allow unregistered users to view all questions and answers

**Questions Management**:
- **FR-009**: System MUST allow `CUSTOMER` and `ANSWERER` users to create questions with title, category, rich-text body, and image attachments
- **FR-010**: System MUST support categories for questions (5-7 categories predefined)
- **FR-011**: System MUST store question body as Tiptap JSON format for rich-text editing
- **FR-012**: System MUST allow question creators to edit their questions
- **FR-013**: System MUST allow question creators to delete their questions (ADMIN can delete any question)
- **FR-014**: System MUST display questions with metadata: author, creation date, answer count, category
- **FR-015**: System MUST support question search by title and body text
- **FR-016**: System MUST support filtering questions by category
- **FR-017**: System MUST sort questions by creation date (most recent first)

**Answers Management**:
- **FR-018**: System MUST allow `ANSWERER` users to create answers on questions
- **FR-019**: System MUST store answer body as Tiptap JSON format
- **FR-020**: System MUST allow answerers to include image attachments in answers
- **FR-021**: System MUST allow answer creators to edit their answers
- **FR-022**: System MUST allow answer creators to delete their answers (ADMIN can delete any answer)
- **FR-023**: System MUST display answers with author metadata and timestamp
- **FR-024**: System MUST prevent `CUSTOMER` users from creating answers

**Comments Management**:
- **FR-025**: System MUST allow logged-in users to post comments on questions
- **FR-026**: System MUST allow logged-in users to post comments on answers
- **FR-027**: System MUST store comments as plain text (no rich formatting)
- **FR-028**: System MUST allow comment authors to delete their own comments
- **FR-029**: System MUST display comments with author and timestamp
- **FR-030**: System MUST prevent unregistered users from posting comments

**Image Attachments & Storage**:
- **FR-031**: System MUST support image upload during question/answer creation
- **FR-032**: System MUST use Supabase Storage as backend for image storage
- **FR-033**: System MUST generate and return image URLs for rendering in galleries
- **FR-034**: System MUST validate uploaded files are images (jpg, png, gif, webp)
- **FR-035**: System MUST limit image file size to maximum 5MB per image
- **FR-036**: System MUST display images in inline gallery format on question/answer detail pages

**Rich Text Editor (Tiptap) Requirements**:
- **FR-037**: System MUST provide Tiptap editor with Bold formatting capability
- **FR-038**: System MUST provide Tiptap editor with Bullet List capability
- **FR-039**: System MUST provide Tiptap editor with Quote/Blockquote capability
- **FR-040**: System MUST provide Tiptap editor with Hyperlink insertion capability
- **FR-041**: System MUST provide Tiptap editor with Image upload capability (integrated with Supabase Storage)

**UI Component Library (shadcn/ui) Requirements**:
- **FR-042**: System MUST use shadcn/ui component library for consistent, accessible UI components
- **FR-043**: System MUST apply mint theme colors to shadcn/ui components (Primary: #2EC4B6, Light: #D8F7F3, Highlight: #A5EFE7)
- **FR-044**: System MUST use shadcn/ui Dialog component for modals and confirmation dialogs
- **FR-045**: System MUST use shadcn/ui Form component for form validation and submission
- **FR-046**: System MUST use shadcn/ui Button, Input, Textarea, Select components for form controls
- **FR-047**: System MUST use shadcn/ui Card component for content containers
- **FR-048**: System MUST maintain consistent spacing and typography using Tailwind CSS with shadcn/ui defaults

**UI/UX Requirements**:
- **FR-049**: System MUST implement mint theme color scheme (Primary: #2EC4B6, Light: #D8F7F3, Highlight: #A5EFE7)
- **FR-050**: System MUST be fully responsive and optimized for mobile devices
- **FR-051**: System MUST display user avatar and display name in profiles/comments/answers
- **FR-052**: System MUST show login prompts to unregistered users when attempting restricted actions
- **FR-053**: System MUST redirect users to intended page after login (using `redirectTo` parameter)

**API Endpoints**:
- **FR-054**: System MUST expose `GET /api/auth/me` endpoint returning current user profile with UserType and AnswererType
- **FR-055**: System MUST expose `GET /api/questions` endpoint with search/filter/sort parameters
- **FR-056**: System MUST expose `POST /api/questions` endpoint (requires login + CUSTOMER or ANSWERER)
- **FR-057**: System MUST expose `GET /api/questions/:id` endpoint
- **FR-058**: System MUST expose `PUT /api/questions/:id` endpoint (creator only, or ADMIN)
- **FR-059**: System MUST expose `DELETE /api/questions/:id` endpoint (creator only, or ADMIN)
- **FR-060**: System MUST expose `POST /api/answers` endpoint (requires login + ANSWERER only)
- **FR-061**: System MUST expose `PUT /api/answers/:id` endpoint (creator only, or ADMIN)
- **FR-062**: System MUST expose `DELETE /api/answers/:id` endpoint (creator only, or ADMIN)
- **FR-063**: System MUST expose `POST /api/comments` endpoint (requires login)
- **FR-064**: System MUST expose `DELETE /api/comments/:id` endpoint (creator only)
- **FR-065**: System MUST expose `POST /api/upload` endpoint for image uploads

### Key Entities

- **UserProfile**: Represents a registered user with email, display name, avatar, language preference, `UserType` (CUSTOMER/ANSWERER/ADMIN), optional `AnswererType` (KOREAN_NATIVE/LONG_TERM_RESIDENT), and timestamps
- **Question**: Represents a user's question with title, category, rich-text body (Tiptap JSON), creator, answers, comments, attachments, and timestamps
- **Answer**: Represents an answerer's response to a question with rich-text body (Tiptap JSON), author, comments, image attachments, and timestamps. Linked to exactly one Question
- **Comment**: Represents discussion on questions/answers with plain text body, reference to post type (Question or Answer), post ID, author, and timestamps
- **Attachment**: Represents image files attached to questions/answers with file URL, file type, reference to post type (Question or Answer), post ID, and timestamps

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Unregistered users can view homepage and browse at least 10 recent questions without friction
- **SC-002**: Foreign travelers can create a question with title, body, category, and images in under 3 minutes
- **SC-003**: Korean locals can post answers to questions within 2 minutes of starting
- **SC-004**: All search and filter operations return results in under 1 second
- **SC-005**: Image uploads complete successfully within 10 seconds
- **SC-006**: Mobile users can complete core actions (view questions, ask questions, answer) on screens as small as 375px width
- **SC-007**: 95% of user authentication attempts complete successfully on first try
- **SC-008**: System successfully handles 100 concurrent users browsing/creating content without errors
- **SC-009**: Questions display with complete information (title, answers count, category, author, timestamp) on list page
- **SC-010**: Question detail page loads with all answers, comments, and image galleries visible
- **SC-011**: Users can distinguish between their own content and others' content in the UI
- **SC-012**: Navigation between question list → detail → create new question flows intuitively

## Assumptions

- Image file size limit: 5MB per image (standard for web applications)
- Categories: 5-7 predefined categories that cover common Korea travel topics (transport, food, accommodation, culture, activities, visa/documents, safety)
- Rich text editor complexity: Users need basic formatting only (bold, bullet list, quote, link, image); advanced formatting (tables, code, headings) not required
- User type assignment: CUSTOMER/ANSWERER assigned at signup; ADMIN role assigned by system administrators only
- AnswererType (KOREAN_NATIVE, LONG_TERM_RESIDENT): Used for profile information and future advanced features; not required for current MVP access control
- Search: Full-text search on question title and body text; not requiring advanced NLP
- Comments: Plain text only; not requiring rich formatting like questions/answers
- Image gallery: Display as inline gallery or lightbox; not requiring advanced image editing
- Language: Primary interface language is English; language preference field exists for future i18n support
- ADMIN user type: Can only be assigned by system administrators, not self-selected by users

## Out of Scope (Phase 2+)

- Real-time notifications for new answers/comments
- Email notifications
- User reputation/karma systems
- Question upvoting/rating
- Answer acceptance/marking as helpful
- User profiles with question/answer history
- Direct messaging between users
- Moderation and content flagging
- Admin dashboard
- Advanced analytics
- Multi-language interface (prepared but not implemented)
- Mobile native apps
- Spring/NestJS backend separation (architecture designed for this, implementation deferred)
