# 한국 여행 Q&A 서비스 프로젝트 명세서

## 1. 프로젝트 개요

외국인의 한국 여행 준비 시 겪는 문제점:
- 난잡한 정보
- 현장 상황 기반 조언 부족
- 외국어 대응 어려움

**목표**: 외국인이 질문하고 한국 로컬이 답변하는 민트 테마 Q&A 웹 서비스

**주요 특징**:
- 질문/답변 중심의 초간단 구조
- 로그인 없이 "보기" 가능
- 로그인한 사용자만 글 작성 가능
- 질문자는 외국인 (`UserType = FOREIGN_QUESTIONER`)
- 답변자는 한국 로컬 (`UserType = *_ANSWERER`)
- 모바일 친화적 UI/UX
- Next.js + Supabase 기반 MVP
- 향후 Spring/NestJS 백엔드로 확장 가능한 구조

---

## 2. 무엇을 만들 것인가?

### 2.1 페이지 구성

#### 1) 홈 페이지 (`/`)
- 서비스 소개 문구
- "Ask a Question" 버튼
    - 로그인 → `/questions/new`
    - 비로그인 → `/login?redirectTo=/questions/new`
- 최근 질문 일부 미리보기

#### 2) 로그인 페이지 (`/login`)
- Supabase Auth (Google 로그인 중심)
- 로그인 성공 시 `redirectTo` 경로로 이동
- UI: 모바일 친화적, 세로 로그인 폼 구성

#### 3) 질문 목록 페이지 (`/questions`)
- 질문 리스트
    - 제목, 카테고리, 작성자, 작성일, 답변 수
- 검색 (제목/본문 일부)
- 카테고리 필터
- 정렬 (최신순)
- 질문 클릭 → 상세 페이지 이동

#### 4) 질문 상세 페이지 (`/questions/[id]`)
- 질문 본문 (Tiptap JSON 렌더링)
- 첨부 이미지 갤러리
- 질문 메타 정보 (작성자/시간/카테고리)
- 답변 리스트
- 댓글 리스트
    - 질문 댓글
    - 각 답변 댓글
- **작성 권한**:
    - 비로그인: 보기만 가능 / 작성 버튼 → `/login`
    - 로그인: 작성 가능
    - 작성자 본인만 수정/삭제 가능

#### 5) 질문 작성 & 편집 페이지
- 신규: `/questions/new`
- 수정: `/questions/[id]/edit`
- 접근 제약: 로그인 필수
- **폼 구성**:
    - 제목
    - 카테고리 (5–7개)
    - 본문 (Tiptap)
    - 이미지 업로드 (Supabase Storage)
- 저장하면 `/questions/[id]`로 이동

#### 6) 답변 작성 & 편집
- 기본: 질문 상세 페이지 내 인라인 폼에서 작성
- 편집: `/answers/[id]/edit` 또는 인라인 편집
- **접근 제약**:
    - 로그인 필수
    - `UserType`이 답변자 그룹일 때만 작성 가능
    - 본인 답변만 수정/삭제 가능

---

### 2.2 데이터 모델

> 모든 모델에는 `createdAt`, `updatedAt` 필드가 존재

#### UserProfile
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 유저 PK |
| email | string | 로그인 이메일 |
| displayName | string | 프로필 이름 |
| avatarUrl | string | 아바타 이미지 |
| languagePreference | string | UI 언어 (e.g. "en") |
| userType | enum | 질문자/답변자 구분 |
| createdAt | timestamp | 생성 일시 |
| updatedAt | timestamp | 수정 일시 |

**userType Enum 정의**:
```typescript
enum UserType {
  FOREIGN_QUESTIONER,
  KOREAN_NATIVE_ANSWERER,
  LONG_TERM_RESIDENT_ANSWERER,
  ETHNIC_KOREAN_FOREIGN_NATIONAL_ANSWERER
}
```

#### Question
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | |
| userId | string | 질문자 ID |
| title | string | |
| body | JSON (Tiptap) | |
| category | string | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

#### Answer
| 필드 | 타입 |
|------|------|
| id | string |
| questionId | string |
| userId | string |
| body | JSON |
| createdAt | timestamp |
| updatedAt | timestamp |

#### Comment
| 필드 | 타입 |
|------|------|
| id | string |
| parentType | "question" or "answer" |
| parentId | string |
| userId | string |
| body | string |
| createdAt | timestamp |
| updatedAt | timestamp |

#### Attachment
| 필드 | 타입 |
|------|------|
| id | string |
| parentType | "question" or "answer" |
| parentId | string |
| fileUrl | string |
| fileType | string |
| createdAt | timestamp |
| updatedAt | timestamp |

---

### 2.3 에디터(Tiptap) 요구사항

#### 필수 기능
- Bold
- Bullet List
- Quote
- Hyperlink
- Image Upload (Supabase Storage)
- Undo/Redo

#### 불필요한 기능
- Heading
- Table
- Font size/color
- Video embed
- Code block

#### 디자인 방향
- Quora 스타일의 심플 입력 폼
- **민트 테마 컬러**:
    - Primary: `#2EC4B6`
    - Light: `#D8F7F3`
    - Highlight: `#A5EFE7`

---

## 3. 어떻게 만들 것인가?

### 3.1 기술 스택

#### 현재(MVP)
- **Frontend + BFF**: Next.js 14 (App Router)
- **Auth**: Supabase Auth
- **DB**: Supabase Postgres
- **File Storage**: Supabase Storage
- **UI**: React + TailwindCSS + Tiptap
- **Deployment**: Vercel + Supabase

---

### 3.2 향후 확장(고트래픽 대비)

#### 1) 별도 백엔드 서버 구성
- Spring Boot 또는 NestJS 기반 독립 API 서버
- Next.js는 프론트엔드 역할만 유지
- RESTful API는 동일하게 재사용

#### 2) DB 확장/교체 용이성
- Supabase 특화 기능 (RLS, RPC 등)은 최소화
- 일반적인 RDBMS (Postgres/MySQL/RDS)로 이관 가능
- ORM/JPA/TypeORM으로 포팅 가능하도록 데이터 모델 유지

#### 3) Storage 확장
- Supabase Storage → AWS S3 등으로 교체 가능
- `/api/upload` 엔드포인트만 교체하면 됨

#### 4) Repository 패턴 구조 유지
Next.js Route Handler 내부에서:
- Service 레이어
- Repository 레이어

→ Spring/Nest 초기 마이그레이션이 매우 쉽다.

---

### 3.3 API 설계

> 현재는 Next.js Route Handler에서 구현되지만,  
> 향후 Spring/Nest에서 그대로 재사용 가능한 REST API 패턴으로 설계

#### Auth
- `GET /api/auth/me`

#### Questions
- `GET /api/questions`
- `POST /api/questions` (로그인 + `userType = FOREIGN_QUESTIONER`)
- `GET /api/questions/:id`
- `PUT /api/questions/:id` (본인 글)
- `DELETE /api/questions/:id` (본인 글)

#### Answers
- `POST /api/answers` (로그인 + `userType ∈ ANSWERER GROUP`)
- `PUT /api/answers/:id`
- `DELETE /api/answers/:id`

#### Comments
- `POST /api/comments`
- `DELETE /api/comments/:id`

#### Upload
- `POST /api/upload`
- 확장 시 S3/GCS 등으로 교체 가능하도록 추상화

---

## 4. UX 원칙

- **비로그인**: 보기만 가능
- **로그인**:
    - 본인 콘텐츠만 수정/삭제
    - `userType`에 따라 질문/답변 권한 분리
- 모바일 우선
- 불필요한 기능 제거
- 민트 테마 유지
- 에디터는 최소 기능만 제공

---

## 5. 개발 로드맵

1. UI Skeleton 만들기
2. `types.ts` 작성
3. Mock API 연결
4. Minimal Tiptap Editor 구현
5. Supabase Auth 연결
6. DB Schema 생성 (RDB 공통 규칙 기반)
7. 이미지 업로드 구현
8. 권한(`UserType`) 로직 완성
9. UX 다듬기 · SEO 기본 적용

---

## 6. 최종 요약

이 문서는 아래 목표를 달성한다:

- 외국인 질문자 ↔ 로컬 답변자가 참여하는 Q&A 서비스
- 간결한 UI/UX
- Next.js + Supabase 기반 MVP
- 향후 Spring/NestJS로 백엔드 분리 가능한 확장성 고려한 설계
- Supabase 종속성 최소화
- `UserType` 기반의 명확한 역할 분리