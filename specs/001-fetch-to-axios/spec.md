# Feature Specification: Migrate Client-Side Fetch to Axios

**Feature Branch**: `001-fetch-to-axios`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "내 프로젝트는 지금 fetch를 통해 api를 가져오고 있다. 서버쪽 route.ts는 supabase sdk를 통해 외부 값을 가져오고 있다. 서버쪽은 변경할 필요 없으나, 클라이언트 쪽 코드는 교체할 필요가 있다. fetch가 아니라 axios를 통해 page 구현부를 좀더 간편하게 처리하고 싶은 거다."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Creates Axios Utilities (Priority: P1)

As a developer, I need to create reusable Axios utility functions based on the example project patterns so that I can replace fetch calls with a standardized, cookie-based HTTP client that works seamlessly with the NextJS internal API routes.

**Why this priority**: This is the foundation for all other work. Without the utilities, no migration can occur. It provides immediate value by establishing error handling patterns and response wrapping that will be used throughout the application.

**Independent Test**: Can be fully tested by creating the utility files, verifying they compile without errors, and writing simple unit tests that demonstrate apiGet, apiPost, apiPut, and apiDelete functions return properly formatted ApiResult objects with data/error/status properties.

**Acceptance Scenarios**:

1. **Given** the example directory contains axios implementation patterns, **When** a developer creates new axios utility files in the project, **Then** the utilities must include apiClient configured with baseURL "/api" and withCredentials true
2. **Given** the utilities are implemented, **When** a developer calls apiGet with a valid URL, **Then** it returns an ApiResult with typed data, null error, and status code
3. **Given** the utilities are implemented, **When** an API call fails, **Then** it returns an ApiResult with null data, formatted error object, and appropriate status code
4. **Given** the utilities handle errors, **When** a 401 unauthorized response occurs, **Then** the error is properly captured and formatted without manual token handling

---

### User Story 2 - SWR Hooks Use Axios (Priority: P2)

As a developer, I need to update SWR-based hooks (useProfile, useMe) to use axios utilities instead of fetch so that data fetching is consistent across the application and benefits from centralized error handling.

**Why this priority**: SWR hooks are used in multiple pages and provide critical user session data. Migrating these early ensures authentication-related pages have consistent error handling and prepares the foundation for other page migrations.

**Independent Test**: Can be tested by running the application, navigating to pages that use useProfile or useMe hooks, and verifying user data loads correctly. Confirm error scenarios (logged out, network failures) display appropriate error states.

**Acceptance Scenarios**:

1. **Given** useProfile and useMe hooks currently use fetch, **When** they are updated to use axios utilities, **Then** they continue to return the same data structure to components
2. **Given** axios utilities are used in SWR hooks, **When** the API returns user data, **Then** the hooks revalidate and mutate data correctly as before
3. **Given** a user is not authenticated, **When** the hooks fetch data, **Then** they handle 401 errors gracefully without breaking the application
4. **Given** network errors occur, **When** SWR hooks attempt to fetch, **Then** error messages are properly formatted and passed to components

---

### User Story 3 - Custom Hooks Use Axios (Priority: P2)

As a developer, I need to update the useQuestions custom hook to use axios utilities instead of fetch so that question listing functionality has consistent error handling and response formatting.

**Why this priority**: The questions feature is a core user-facing function. Migrating this hook ensures the main listing pages have reliable error handling and consistent data patterns.

**Independent Test**: Can be tested by navigating to the questions page and home page, verifying questions load correctly, search filtering works, and error states display when API calls fail.

**Acceptance Scenarios**:

1. **Given** useQuestions currently uses fetch, **When** it is updated to use axios utilities, **Then** question data loads and displays correctly on pages
2. **Given** axios handles errors, **When** the questions API fails, **Then** the hook sets errorMessage state with a user-friendly message
3. **Given** questions are loading, **When** axios handles the request, **Then** loading states transition correctly from true to false
4. **Given** search filtering is active, **When** questions are fetched via axios, **Then** filtered results display without errors

---

### User Story 4 - Page Components Use Axios (Priority: P3)

As a developer, I need to update all page components (profile, questions/new, questions/[id]) to use axios utilities for inline fetch calls so that all client-side API interactions follow the same patterns and error handling approach.

**Why this priority**: These pages have direct fetch calls that need migration. While important, they can be migrated after the foundation (P1) and critical hooks (P2) are in place.

**Independent Test**: Can be tested by manually testing each page - creating a new question, updating profile, viewing question details - and verifying all operations complete successfully with proper error messaging.

**Acceptance Scenarios**:

1. **Given** the profile page uses fetch for PATCH requests, **When** it is updated to use axios apiPatch utility, **Then** profile updates save correctly and show success/error messages
2. **Given** questions/new page uses fetch for POST and GET, **When** updated to use axios utilities, **Then** topics load correctly and new questions are created successfully
3. **Given** questions/[id] page uses fetch for GET, **When** updated to use axios utilities, **Then** question details load and display correctly
4. **Given** any page encounters an API error, **When** using axios utilities, **Then** error messages are user-friendly and actionable

---

### Edge Cases

- What happens when the API returns unexpected status codes (e.g., 403, 500, 502)? The axios error handler should format these into consistent ApiError objects with appropriate messages.
- How does the system handle network timeouts? The axios client should be configured with a timeout value (10000ms) and return a formatted error when exceeded.
- What happens when API responses have malformed JSON? The axios utilities should catch parsing errors and return a formatted ApiError with a fallback message.
- How are concurrent requests handled in SWR hooks? SWR's built-in deduplication and caching should continue to work with axios-based fetchers.
- What happens when a user performs an action (e.g., creates question) while offline? The axios client should return a network error that components can display to users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create an axios client instance configured with baseURL "/api" and withCredentials true for cookie-based authentication
- **FR-002**: System MUST implement wrapper functions (apiGet, apiPost, apiPut, apiDelete, apiPatch) that return ApiResult type with data, error, and status properties
- **FR-003**: System MUST handle all axios errors by converting them to a standardized ApiError format including timestamp, status, error type, message, and path
- **FR-004**: System MUST NOT include manual token handling code (getAccessToken, isTokenExpired, clearTokens, Authorization headers) as authentication is cookie-based
- **FR-005**: System MUST implement response interceptors for logging request/response information during development
- **FR-006**: System MUST update useProfile hook to use axios utilities while maintaining the same return interface (profile, loading, error, mutate)
- **FR-007**: System MUST update useMe hook to use axios utilities while maintaining the same return interface (user, loading, error, mutate)
- **FR-008**: System MUST update useQuestions hook to use axios utilities while maintaining the same return interface and data flow
- **FR-009**: System MUST update profile page PATCH request to use axios apiPatch utility
- **FR-010**: System MUST update questions/new page POST and GET requests to use axios apiPost and apiGet utilities
- **FR-011**: System MUST update questions/[id] page GET request to use axios apiGet utility
- **FR-012**: System MUST preserve all existing component functionality, state management, and user interactions during migration
- **FR-013**: System MUST handle 401 unauthorized errors by clearing authentication state (following pattern from example interceptors)
- **FR-014**: System MUST handle 500 server errors by logging appropriate error messages
- **FR-015**: System MUST configure axios client with a 10000ms timeout for all requests

### Key Entities

- **ApiClient**: Axios instance configured for internal NextJS API routes with cookie credentials, timeout, and JSON headers
- **ApiResult<T>**: Generic response wrapper containing nullable data of type T, nullable ApiError, and nullable status code
- **ApiError**: Standardized error object with timestamp, status code, error type string, message, and path
- **Axios Utilities**: Collection of functions (apiGet, apiPost, apiPut, apiDelete, apiPatch) that wrap axios client calls and return ApiResult objects

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing pages continue to function identically to current fetch-based implementation with no regression in user experience
- **SC-002**: All API calls use standardized error handling that returns consistent ApiError objects with user-friendly messages
- **SC-003**: Developers can make API calls using simplified utility functions (apiGet, apiPost, etc.) in under 1 line of code instead of 5+ lines with fetch
- **SC-004**: Error scenarios (network failures, 401, 500 errors) display appropriate messages to users without breaking the application
- **SC-005**: Zero fetch calls remain in src/app directory after migration is complete
- **SC-006**: All SWR hooks and page components compile and run without TypeScript errors related to axios integration
- **SC-007**: Profile updates, question creation, and question viewing complete successfully using axios utilities
- **SC-008**: Cookie-based authentication works seamlessly without manual token management code

## Assumptions

1. The NextJS server routes (/api/*) are already configured to accept cookie-based authentication and will not be modified
2. The existing Supabase session cookie mechanism is working correctly and will continue to be sent with withCredentials: true
3. TypeScript types for responses (QuestionSummaryResponse, QuestionDetailResponse, UserProfileResponse, etc.) are already defined and will not change
4. The example directory provides a complete reference implementation that is suitable for adaptation to this project
5. The axios package is already installed in the project dependencies
6. All current API endpoints return JSON responses that can be parsed by axios
7. Error response format from server routes is compatible with the ApiError type structure from examples, or can be adapted via the error handler
8. The development team prefers logging request/response information during development (as shown in example interceptors)