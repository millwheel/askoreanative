# shadcn/ui 마이그레이션 작업 관리

> **프로젝트:** askoreanative
> **목적:** 네이티브 HTML 요소를 shadcn/ui 컴포넌트로 점진적 교체
> **시작일:** 2025-12-14

---

## 📋 전체 진행 상황

- [ ] Phase 1: 폼 요소 (Select, Input, Button, Textarea)
- [ ] Phase 2: 레이아웃 (Card, Badge)
- [ ] Phase 3: 고급 기능 (Avatar, Dropdown Menu, Dialog, Toast)

---

## 🚀 Phase 1: 폼 요소 마이그레이션

**목표:** 모든 폼 요소를 shadcn/ui로 통일
**예상 소요:** 1-2일
**우선순위:** 🔴 높음

### 1.1 Select 컴포넌트

**설치:**
```bash
npx shadcn@latest add select
```

**작업 목록:**

- [ ] **홈페이지 검색 필터**
  - 파일: `src/app/page.tsx:45-49`
  - 현재: `<select>` + `<option>`
  - 변경: `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>`
  - 비고: 검색 기능 동작 확인 필요

- [ ] **Questions 페이지 필터**
  - 파일: `src/app/questions/page.tsx:63-71`
  - 현재: `<select value={category} onChange={(e) => setCategory(e.target.value)}>`
  - 변경: `<Select value={category} onValueChange={setCategory}>`
  - 비고: `onChange` → `onValueChange` 주의

- [ ] **New Question 카테고리 선택**
  - 파일: `src/app/questions/new/page.tsx:194-202`
  - 현재: `<select value={category} onChange={(e) => setCategory(e.target.value)}>`
  - 변경: `<Select value={category} onValueChange={setCategory}>`
  - 비고: 폼 제출 시 값 확인

**변경 예시:**
```tsx
// Before
<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary md:w-52"
>
  {CATEGORIES.map((c) => (
    <option key={c}>{c}</option>
  ))}
</select>

// After
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select value={category} onValueChange={setCategory}>
  <SelectTrigger className="w-full md:w-52">
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    {CATEGORIES.map((c) => (
      <SelectItem key={c} value={c}>
        {c}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 1.2 Input 컴포넌트

**설치:**
```bash
npx shadcn@latest add input
```

**작업 목록:**

- [x] **홈페이지 검색창**
  - 파일: `src/app/page.tsx:34-39`
  - 현재: `<input type="text" placeholder="Search...">`
  - 변경: `<Input type="text" placeholder="Search...">`
  - 비고: rounded-full 스타일 유지

- [x] **Questions 페이지 검색**
  - 파일: `src/app/questions/page.tsx:54-60`
  - 현재: `<input type="text" value={search} onChange={...}>`
  - 변경: `<Input type="text" value={search} onChange={...}>`
  - 비고: 검색 필터링 로직 확인

- [x] **New Question 제목 입력**
  - 파일: `src/app/questions/new/page.tsx:176-182`
  - 현재: `<input type="text" value={title} onChange={...}>`
  - 변경: `<Input type="text" value={title} onChange={...}>`
  - 비고: required validation 확인

**변경 예시:**
```tsx
// Before
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search questions about Korea..."
  className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
/>

// After
import { Input } from "@/components/ui/input"

<Input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search questions about Korea..."
  className="rounded-full"
/>
```

---

### 1.3 Button 컴포넌트

**설치:**
```bash
npx shadcn@latest add button
```

**작업 목록:**

- [x] **홈페이지 Hero CTA**
  - 파일: `src/app/page.tsx:20-25`
  - 현재: `<Link className="...">Ask Your First Question</Link>`
  - 변경: `<Button asChild><Link>Ask Your First Question</Link></Button>`
  - Variant: `variant="secondary"`

- [x] **홈페이지 검색 버튼**
  - 파일: `src/app/page.tsx:41-43`
  - 현재: `<button className="...">🔍</button>`
  - 변경: `<Button>🔍</Button>`
  - Variant: `variant="default"`

- [x] **홈페이지 View Details 버튼**
  - 파일: `src/app/page.tsx:106-108`
  - 현재: `<button className="rounded-full border...">View Details</button>`
  - 변경: `<Button variant="outline" size="sm">View Details</Button>`

- [x] **Questions 페이지 View Details**
  - 파일: `src/app/questions/page.tsx:128-130`
  - 현재: `<button className="rounded-full border...">View Details</button>`
  - 변경: `<Button variant="outline" size="sm">View Details</Button>`

- [x] **New Question Submit 버튼**
  - 파일: `src/app/questions/new/page.tsx:247-251`
  - 현재: `<button type="submit" className="...">Post Question</button>`
  - 변경: `<Button type="submit">Post Question (Mock)</Button>`

- [x] **New Question Upload 버튼**
  - 파일: `src/app/questions/new/page.tsx:233-238`
  - 현재: `<button type="button" className="...">Upload Image</button>`
  - 변경: `<Button type="button" variant="outline" size="sm">Upload Image</Button>`

- [x] **Login 페이지 Google 버튼**
  - 파일: `src/app/login/page.tsx:16-22`
  - 현재: `<button onClick={handleGoogleLogin} className="...">Google login</button>`
  - 변경: `<Button onClick={handleGoogleLogin} variant="outline" className="w-full">Google login</Button>`

- [x] **GNB Login 버튼**
  - 파일: `src/client/components/gnb.tsx:40-45`
  - 현재: `<Link className="rounded-md bg-primary...">Login</Link>`
  - 변경: `<Button asChild><Link href="/login">Login</Link></Button>`

- [x] **GNB Logout 버튼**
  - 파일: `src/client/components/gnb.tsx:52-57`
  - 현재: `<button onClick={handleLogout} className="...">Logout</button>`
  - 변경: `<Button onClick={handleLogout}>Logout</Button>`

- [x] **AskButton 컴포넌트**
  - 파일: `src/client/components/askButton.tsx:5-10`
  - 현재: `<Link className="...">Ask new question</Link>`
  - 변경: `<Button asChild><Link href="/questions/new">Ask new question</Link></Button>`

**변경 예시:**
```tsx
// Before
<button
  type="submit"
  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer"
>
  Post Question (Mock)
</button>

// After
import { Button } from "@/components/ui/button"

<Button type="submit">
  Post Question (Mock)
</Button>
```

**Link와 Button 함께 사용:**
```tsx
// Before
<Link href="/questions/new" className="rounded-full bg-primary...">
  Ask new question
</Link>

// After
import { Button } from "@/components/ui/button"
import Link from "next/link"

<Button asChild>
  <Link href="/questions/new">Ask new question</Link>
</Button>
```

---

### 1.4 Textarea 컴포넌트

**설치:**
```bash
npx shadcn@latest add textarea
```

**작업 목록:**

- [ ] **New Question 상세 내용**
  - 파일: `src/app/questions/new/page.tsx:210-216`
  - 현재: `<textarea rows={8} value={description} onChange={...}>`
  - 변경: `<Textarea rows={8} value={description} onChange={...}>`
  - 비고: placeholder 텍스트 유지

**변경 예시:**
```tsx
// Before
<textarea
  rows={8}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Add details like travel dates, budget, preferences..."
  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
/>

// After
import { Textarea } from "@/components/ui/textarea"

<Textarea
  rows={8}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Add details like travel dates, budget, preferences..."
  className="rounded-xl"
/>
```

---

## 🎨 Phase 2: 레이아웃 컴포넌트

**목표:** 일관된 레이아웃 구조
**예상 소요:** 1일
**우선순위:** 🟡 중간

### 2.1 Card 컴포넌트

**설치:**
```bash
npx shadcn@latest add card
```

**작업 목록:**

- [ ] **홈페이지 질문 리스트**
  - 파일: `src/app/page.tsx:65-111`
  - 현재: `<article className="rounded-2xl bg-white...">`
  - 변경: `<Card>` + `<CardHeader>` + `<CardContent>` + `<CardFooter>`

- [ ] **Questions 페이지 질문 카드**
  - 파일: `src/app/questions/page.tsx:85-134`
  - 현재: `<article className="rounded-2xl bg-white...">`
  - 변경: `<Card>` 구조로 리팩토링

- [ ] **Login 페이지 컨테이너**
  - 파일: `src/app/login/page.tsx:13-24`
  - 현재: `<div className="w-full max-w-md rounded-2xl bg-white...">`
  - 변경: `<Card>` + `<CardHeader>` + `<CardContent>`

- [ ] **New Question 폼 컨테이너**
  - 파일: `src/app/questions/new/page.tsx:66-260`
  - 현재: `<form className="rounded-2xl bg-white...">`
  - 변경: `<Card><form>...</form></Card>` 구조

- [ ] **New Question 사이드바**
  - 파일: `src/app/questions/new/page.tsx:263-311`
  - 현재: `<aside><div className="rounded-2xl bg-white...">`
  - 변경: `<Card>` 구조

**변경 예시:**
```tsx
// Before
<article className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
  <div className="mb-2 flex items-center justify-between gap-2">
    <h3 className="text-base font-semibold text-foreground">{q.title}</h3>
    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
      {q.category}
    </span>
  </div>
  <p className="mb-4 text-sm text-gray-600">{q.excerpt}</p>
  {/* footer content */}
</article>

// After
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

<Card className="transition hover:shadow-md">
  <CardHeader>
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="text-base">{q.title}</CardTitle>
      <Badge variant="secondary">{q.category}</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-600">{q.excerpt}</p>
  </CardContent>
  <CardFooter>
    {/* footer content */}
  </CardFooter>
</Card>
```

---

### 2.2 Badge 컴포넌트

**설치:**
```bash
npx shadcn@latest add badge
```

**작업 목록:**

- [ ] **홈페이지 카테고리 태그**
  - 파일: `src/app/page.tsx:73-76`
  - 현재: `<span className="rounded-full bg-primary-light...">{q.category}</span>`
  - 변경: `<Badge variant="secondary">{q.category}</Badge>`

- [ ] **Questions 페이지 카테고리 뱃지**
  - 파일: `src/app/questions/page.tsx:93-95`
  - 현재: `<span className="rounded-full bg-primary-light...">{q.category}</span>`
  - 변경: `<Badge variant="secondary">{q.category}</Badge>`

- [ ] **New Question "선택됨" 뱃지**
  - 파일: `src/app/questions/new/page.tsx:91-93`
  - 현재: `<span className="rounded-full bg-white px-2 py-0.5...">선택됨</span>`
  - 변경: `<Badge variant="outline" size="sm">선택됨</Badge>`

- [ ] **New Question Express 뱃지**
  - 파일: `src/app/questions/new/page.tsx:119-121`
  - 현재: `<span className="rounded-full bg-white...">선택됨</span>`
  - 변경: `<Badge variant="outline" size="sm">선택됨</Badge>`

**변경 예시:**
```tsx
// Before
<span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
  {q.category}
</span>

// After
import { Badge } from "@/components/ui/badge"

<Badge variant="secondary">{q.category}</Badge>
```

---

## 🌟 Phase 3: 고급 컴포넌트

**목표:** UX 개선 및 고급 기능
**예상 소요:** 선택적
**우선순위:** 🟢 낮음 (필요 시)

### 3.1 Avatar 컴포넌트

**설치:**
```bash
npx shadcn@latest add avatar
```

**작업 목록:**

- [ ] **홈페이지 작성자 아바타**
  - 파일: `src/app/page.tsx:83-86`
  - 현재: `<img src={q.authorAvatar} className="h-8 w-8 rounded-full">`
  - 변경: `<Avatar><AvatarImage src={...} /><AvatarFallback>...</AvatarFallback></Avatar>`

- [ ] **Questions 페이지 아바타**
  - 파일: `src/app/questions/page.tsx:103-106`
  - 현재: `<img src={q.authorAvatar} className="h-8 w-8 rounded-full">`
  - 변경: `<Avatar>` 구조

**변경 예시:**
```tsx
// Before
<img
  src={q.authorAvatar}
  alt={q.authorName}
  className="h-8 w-8 rounded-full object-cover"
/>

// After
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar className="h-8 w-8">
  <AvatarImage src={q.authorAvatar} alt={q.authorName} />
  <AvatarFallback>{q.authorName[0]}</AvatarFallback>
</Avatar>
```

---

### 3.2 Dropdown Menu

**설치:**
```bash
npx shadcn@latest add dropdown-menu
```

**작업 목록:**

- [ ] **GNB 사용자 메뉴**
  - 파일: `src/client/components/gnb.tsx:49-58`
  - 현재: `<div>{user.displayName}<button>Logout</button></div>`
  - 변경: `<DropdownMenu>` 구조로 Profile, Settings, Logout 메뉴 추가

**변경 예시:**
```tsx
// Before
{!loading && user && (
  <div className="flex items-center gap-6">
    <p className="text-sm text-gray-600">{user.displayName}</p>
    <button onClick={handleLogout} className="...">Logout</button>
  </div>
)}

// After
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

{!loading && user && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}
```

---

### 3.3 Dialog (향후 필요 시)

**설치:**
```bash
npx shadcn@latest add dialog
```

**사용 시나리오:**
- 질문 삭제 확인 다이얼로그
- 이미지 업로드 모달
- 로그아웃 확인 다이얼로그

---

### 3.4 Toast (향후 필요 시)

**설치:**
```bash
npx shadcn@latest add toast
```

**사용 시나리오:**
- 질문 등록 완료 알림
- 로그인 성공/실패 메시지
- API 에러 알림

---

## 📊 작업 통계

### 컴포넌트별 교체 수

| 컴포넌트 | 교체 대상 수 | Phase |
|---------|-------------|-------|
| Select | 3개 | 1 |
| Input | 3개 | 1 |
| Button | 10개 | 1 |
| Textarea | 1개 | 1 |
| Card | 5개 | 2 |
| Badge | 4개 | 2 |
| Avatar | 2개 | 3 |
| Dropdown Menu | 1개 | 3 |

**총계:** 29개 항목

---

## 🎯 빠른 시작 가이드

### Step 1: Phase 1 컴포넌트 일괄 설치
```bash
npx shadcn@latest add select input button textarea
```

### Step 2: Select부터 시작 (테스트)
1. `src/app/questions/page.tsx:63` - 단일 Select 교체
2. 테스트 후 나머지 2개 교체

### Step 3: Input 교체
3개 파일 순차적으로 교체

### Step 4: Button 교체
우선순위 높은 버튼부터 점진적 교체

### Step 5: 검증
- 모든 폼 동작 확인
- 스타일 일관성 확인
- 접근성 테스트 (키보드 네비게이션)

---

## ⚠️ 주의사항

### Select 교체 시
- `onChange` → `onValueChange`로 변경
- 이벤트 핸들러 시그니처 변경: `(e) => setValue(e.target.value)` → `(value) => setValue(value)`

### Button 교체 시
- Link와 함께 사용 시 `asChild` prop 사용
- `type="submit"` 유지 필수

### 스타일 유지
- 기존 `rounded-full` 등 커스텀 스타일은 `className`으로 유지
- shadcn 기본 스타일과 충돌 시 조정

### 테스트 체크리스트
- [ ] 폼 제출 동작
- [ ] 검색 필터링
- [ ] 키보드 네비게이션 (Tab, Enter, Arrow keys)
- [ ] 모바일 반응형
- [ ] 색상 테마 적용 확인

---

## 📝 작업 로그

### 2025-12-14
- [x] 마이그레이션 작업 계획 수립
- [x] Phase 1-3 작업 목록 작성
- [ ] 작업 시작 대기 중

---

**다음 단계:** Phase 1의 Select 컴포넌트부터 점진적으로 적용 시작