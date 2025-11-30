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

### User Story 2 - Foreign Traveler Asking Questions (Priority: P1)

A foreign traveler wants to ask specific questions about planning their Korea trip. They register/login and post a question with text, images, and category information.

**Why this priority**: Asking questions is core to the service value proposition. This is the primary content creation flow for travelers.

**Independent Test**: Can be fully tested by registering as foreign questioner, creating a question with title/body/category/images, and verifying it appears in the question list. Delivers core value of enabling question creation.

**Acceptance Scenarios**:

1. **Given** a foreign traveler is logged in with `UserType = FOREIGN_QUESTIONER`, **When** they click "Ask a Question", **Then** they are taken to the question creation page
2. **Given** a traveler is on the question creation page, **When** they fill in title, category, body text, and upload images, **Then** all content is properly formatted and saved
3. **Given** a traveler submits a question, **When** the question is saved successfully, **Then** they are redirected to the question detail page showing their new question
4. **Given** a traveler created a question, **When** they visit their question detail page, **Then** they see options to edit or delete their question
5. **Given** a question creator clicks edit, **When** they modify content and save, **Then** the updated content is reflected with updated timestamp

---

### User Story 3 - Korean Local/Resident Answering Questions (Priority: P1)

A Korean native or long-term resident wants to share travel advice. They register/login with appropriate user type and post detailed answers with images and formatting.

**Why this priority**: Answers are the core value delivery. Enabling experienced locals to provide high-quality advice is essential to service success.

**Independent Test**: Can be fully tested by registering as answerer, viewing a question, posting an answer with text/images, and verifying it appears. Delivers core value of answer creation.

**Acceptance Scenarios**:

1. **Given** a Korean local is logged in with `UserType = KOREAN_NATIVE_ANSWERER`, **When** they view a question detail page, **Then** they see a form to post an answer
2. **Given** an answerer fills in their response with text and images, **When** they submit, **Then** the answer is saved with their user information and timestamp
3. **Given** an answerer has posted an answer, **When** they view the question detail, **Then** they can edit or delete their own answer
4. **Given** a user with `UserType` that is not an answerer type, **When** they view a question, **Then** they cannot see the answer submission form
5. **Given** an answerer submits an answer, **When** the question owner views it, **Then** the answer appears in the question's answer list

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

- What happens when a user logs in as one user type and later tries to perform actions restricted to another user type? → System should deny the action and show appropriate message
- What happens when an image upload fails during question/answer creation? → User should be notified and able to retry
- What happens when a user tries to edit/delete content they don't own? → System should deny the action and show 403 error
- What happens when a question has no answers yet? → The question should still be viewable with empty answers section
- What happens when a user deletes their account after creating questions/answers? → Their content should be retained but marked as deleted user
- What happens when a comment is posted on a deleted answer? → System should prevent the action since parent doesn't exist

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**:
- **FR-001**: System MUST allow users to login via Supabase Auth (Google OAuth as primary method)
- **FR-002**: System MUST assign `UserType` to each user from enum: `FOREIGN_QUESTIONER`, `KOREAN_NATIVE_ANSWERER`, `LONG_TERM_RESIDENT_ANSWERER`, `ETHNIC_KOREAN_FOREIGN_NATIONAL_ANSWERER`
- **FR-003**: System MUST enforce that only `FOREIGN_QUESTIONER` users can create questions
- **FR-004**: System MUST enforce that only users with `*_ANSWERER` user types can create answers
- **FR-005**: System MUST ensure users can only edit/delete their own content
- **FR-006**: System MUST allow unregistered users to view all questions and answers

**Questions Management**:
- **FR-007**: System MUST allow `FOREIGN_QUESTIONER` users to create questions with title, category, rich-text body, and image attachments
- **FR-008**: System MUST support categories for questions (5-7 categories predefined)
- **FR-009**: System MUST store question body as Tiptap JSON format for rich-text editing
- **FR-010**: System MUST allow question creators to edit their questions
- **FR-011**: System MUST allow question creators to delete their questions
- **FR-012**: System MUST display questions with metadata: author, creation date, answer count, category
- **FR-013**: System MUST support question search by title and body text
- **FR-014**: System MUST support filtering questions by category
- **FR-015**: System MUST sort questions by creation date (most recent first)

**Answers Management**:
- **FR-016**: System MUST allow answerer-type users to create answers on questions
- **FR-017**: System MUST store answer body as Tiptap JSON format
- **FR-018**: System MUST allow answerers to include image attachments in answers
- **FR-019**: System MUST allow answer creators to edit their answers
- **FR-020**: System MUST allow answer creators to delete their answers
- **FR-021**: System MUST display answers with author metadata and timestamp
- **FR-022**: System MUST prevent non-answerer users from creating answers

**Comments Management**:
- **FR-023**: System MUST allow logged-in users to post comments on questions
- **FR-024**: System MUST allow logged-in users to post comments on answers
- **FR-025**: System MUST store comments as plain text (no rich formatting)
- **FR-026**: System MUST allow comment authors to delete their own comments
- **FR-027**: System MUST display comments with author and timestamp
- **FR-028**: System MUST prevent unregistered users from posting comments

**Image Attachments & Storage**:
- **FR-029**: System MUST support image upload during question/answer creation
- **FR-030**: System MUST use Supabase Storage as backend for image storage
- **FR-031**: System MUST generate and return image URLs for rendering in galleries
- **FR-032**: System MUST validate uploaded files are images (jpg, png, gif, webp)
- **FR-033**: System MUST limit image file size to maximum 5MB per image
- **FR-034**: System MUST display images in inline gallery format on question/answer detail pages

**Rich Text Editor (Tiptap) Requirements**:
- **FR-035**: System MUST provide Tiptap editor with Bold formatting capability
- **FR-036**: System MUST provide Tiptap editor with Bullet List capability
- **FR-037**: System MUST provide Tiptap editor with Quote/Blockquote capability
- **FR-038**: System MUST provide Tiptap editor with Hyperlink insertion capability
- **FR-039**: System MUST provide Tiptap editor with Image upload capability (integrated with Supabase Storage)
- **FR-040**: System MUST provide Tiptap editor with Undo/Redo functionality
- **FR-041**: System MUST NOT provide unsupported features: Heading, Table, Font size/color, Video embed, Code block

**UI/UX Requirements**:
- **FR-042**: System MUST implement mint theme color scheme (Primary: #2EC4B6, Light: #D8F7F3, Highlight: #A5EFE7)
- **FR-043**: System MUST be fully responsive and optimized for mobile devices
- **FR-044**: System MUST display user avatar and display name in profiles/comments/answers
- **FR-045**: System MUST show login prompts to unregistered users when attempting restricted actions
- **FR-046**: System MUST redirect users to intended page after login (using `redirectTo` parameter)

**API Endpoints**:
- **FR-047**: System MUST expose `GET /api/auth/me` endpoint returning current user profile
- **FR-048**: System MUST expose `GET /api/questions` endpoint with search/filter/sort parameters
- **FR-049**: System MUST expose `POST /api/questions` endpoint (requires login + FOREIGN_QUESTIONER)
- **FR-050**: System MUST expose `GET /api/questions/:id` endpoint
- **FR-051**: System MUST expose `PUT /api/questions/:id` endpoint (creator only)
- **FR-052**: System MUST expose `DELETE /api/questions/:id` endpoint (creator only)
- **FR-053**: System MUST expose `POST /api/answers` endpoint (requires login + answerer type)
- **FR-054**: System MUST expose `PUT /api/answers/:id` endpoint (creator only)
- **FR-055**: System MUST expose `DELETE /api/answers/:id` endpoint (creator only)
- **FR-056**: System MUST expose `POST /api/comments` endpoint (requires login)
- **FR-057**: System MUST expose `DELETE /api/comments/:id` endpoint (creator only)
- **FR-058**: System MUST expose `POST /api/upload` endpoint for image uploads

### Key Entities

- **UserProfile**: Represents a registered user with email, display name, avatar, language preference, user type, and timestamps
- **Question**: Represents a traveler's question with title, category, rich-text body, creator, answers, comments, and timestamps
- **Answer**: Represents a local expert's response to a question with rich-text body, author, comments, image attachments, and timestamps
- **Comment**: Represents discussion on questions/answers with plain text body, parent reference, author, and timestamps
- **Attachment**: Represents image files attached to questions/answers with file URL, type, and timestamps

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
- Rich text editor complexity: Users need basic formatting only; advanced formatting (tables, code, etc.) not required
- User type assignment: Handled at signup/admin level; system assumes valid user types in database
- Search: Full-text search on question title and body text; not requiring advanced NLP
- Comments: Plain text only; not requiring rich formatting like questions/answers
- Image gallery: Display as inline gallery or lightbox; not requiring advanced image editing
- Language: Primary interface language is English; language preference field exists for future i18n support

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
