# Ask Korean Native - MVP

> 한국 여행객들과 한국 현지인 전문가들을 연결하는 Q&A 플랫폼

한국 여행에 대한 실시간 질답 커뮤니티입니다. 여행객들은 질문을 올리고, 한국 현지 전문가들이 답변하며, 커뮤니티가 함께 토론하는 방식으로 운영됩니다.

## 주요 기능

### 👤 사용자 역할
- **CUSTOMER**: 질문 작성 및 댓글 가능
- **ANSWERER**: 질문 + 답변 작성 가능 (한국 현지인 전문가)
- **ADMIN**: 모든 콘텐츠 삭제 및 관리

### 📝 완료된 User Stories

1. **Browse Questions** ✅ - 질문 열람 및 조회
2. **Ask Questions** ✅ - 질문 작성/수정/삭제
3. **Answer Questions** ✅ - 답변 작성/수정/삭제
4. **Community Comments** ✅ - 댓글 작성/삭제
5. **Content Discovery** ✅ - 검색, 필터, 정렬

## 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 19+**
- **Tailwind CSS 4**
- **shadcn/ui** (UI Components)
- **Tiptap** (Rich Text Editor)
- **React Hook Form + Zod** (Forms & Validation)

### Backend & Database
- **Supabase** (Auth, PostgreSQL, Storage)
- **Next.js Route Handlers** (API/BFF)
- **TypeScript**

## 설정 및 실행

### 사전 요구사항
- Node.js 18+
- Supabase 계정

### 1. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에서 다음을 수정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션 실행

Supabase 대시보드의 SQL Editor에서:
- `supabase/migrations/001_create_initial_schema.sql`
- `supabase/migrations/002_add_search_optimization.sql`

### 4. 개발 서버 시작

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 방문

## API 엔드포인트

### Questions
- `GET /api/questions` - 질문 목록 (검색, 필터, 정렬)
- `POST /api/questions` - 질문 생성
- `GET /api/questions/:id` - 질문 상세
- `PUT /api/questions/:id` - 질문 수정
- `DELETE /api/questions/:id` - 질문 삭제

### Answers
- `POST /api/answers` - 답변 생성 (ANSWERER만)
- `GET /api/answers/:id` - 답변 상세
- `PUT /api/answers/:id` - 답변 수정
- `DELETE /api/answers/:id` - 답변 삭제

### Comments
- `POST /api/comments` - 댓글 생성
- `DELETE /api/comments/:id` - 댓글 삭제

### Upload
- `POST /api/upload` - 이미지 업로드

## 프로젝트 구조

```
src/
├── app/
│   ├── api/           # API Route Handlers
│   ├── questions/     # Questions pages
│   ├── answers/       # Answer edit
│   └── page.tsx       # Home
├── components/        # React components
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── validation.ts
│   ├── logger.ts
│   └── hooks/
└── types/
```

## 빌드 및 배포

```bash
# 빌드
npm run build

# 타입 체크
npm run typecheck

# 배포 (Vercel, AWS, etc)
```

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 라이선스

MIT License

---

**Made with ❤️ for Korean Travelers and Local Experts**
