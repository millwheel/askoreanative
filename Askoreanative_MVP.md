# Korea Q&A Platform – MVP Specification

외국인이 한국에 대해 무엇이든 물어보고, 한국인이 답변하는 Q&A 서비스의 MVP 명세서.  
이 문서는 Claude(혹은 다른 AI 에이전트)에게 구현 작업을 위임하기 위한 개발 기준 문서이다.

---

# 1. MVP 목표

- 외국인이 한국 관련 질문을 올릴 수 있다.
- 한국인이 질문에 답변할 수 있다.
- 질문자/답변자 간 최저 기능의 Q&A 인터랙션이 가능하다.
- 사용자 프로필/레벨/기본 통계 제공.

---

# 2. 기술 스택

## Frontend + Backend
- **Next.js 14 (App Router)**
- **React + Server Components**
- **TailwindCSS**

## Backend / Database
- **Supabase**
    - Auth (Google OAuth)
    - Postgres DB
    - Row Level Security (RLS)
    - Edge Functions(optional)

## Deployment
- Next.js → Vercel
- Supabase → Supabase Cloud

---

# 3. 전체 아키텍처

Next.js (App Router)
├── UI Pages
├── Server Actions (Business Logic)
└── API Route Handlers (/app/api/…)

Supabase
├── Auth (users)
├── Postgres (profiles, questions, answers, credit_tx, payout_requests)
└── RLS Policies

- 비즈니스 로직은 **Next.js Server Actions**로 처리.
- DB CRUD는 Supabase JS SDK 사용.

---

# 4. 데이터 모델

## 4.1 `profiles`
사용자 프로필 (auth.users 확장)

```sql
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_native_korean boolean not null default false,
  bio text,
  native_language text,
  country text,
  level int not null default 1,
  total_answers int not null default 0,
  total_accepted_answers int not null default 0,
  credits int not null default 0,
  created_at timestamptz default now()
);