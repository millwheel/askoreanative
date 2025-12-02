# Deployment Guide - Ask Korean Native MVP

이 가이드는 Ask Korean Native MVP를 다양한 플랫폼에 배포하는 방법을 설명합니다.

## 배포 체크리스트

- [ ] 빌드 성공 (`npm run build`)
- [ ] 타입 체크 통과 (`npm run typecheck`)
- [ ] 환경 변수 설정 완료
- [ ] Supabase 마이그레이션 적용
- [ ] 이미지 업로드 버킷 생성
- [ ] Google OAuth 설정

## Vercel 배포 (권장)

### 1. Vercel 계정 생성

https://vercel.com 에서 계정 생성

### 2. 프로젝트 연결

```bash
npm install -g vercel
vercel
```

### 3. 환경 변수 설정

Vercel 대시보드에서 Settings > Environment Variables 설정:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

### 4. 배포

```bash
vercel --prod
```

## AWS Amplify 배포

### 1. AWS 계정 생성

### 2. GitHub 저장소 연결

AWS Amplify Console에서 GitHub 저장소 연결

### 3. 빌드 설정

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 4. 환경 변수 설정

Amplify Console에서 환경 변수 추가

## Docker 배포

### 1. Dockerfile 생성

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. 빌드 및 실행

```bash
docker build -t ask-korean-native .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  ask-korean-native
```

## Supabase 설정

### 1. 프로젝트 생성

https://supabase.com 에서 새 프로젝트 생성

### 2. 마이그레이션 실행

Supabase SQL Editor에서:

```bash
# 001_create_initial_schema.sql 실행
# 002_add_search_optimization.sql 실행
```

### 3. 스토리지 버킷 생성

- 버킷명: `question-images`
- 공개 설정: 예
- 정책 설정:
  ```sql
  -- 읽기 권한
  CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-images');
  
  -- 인증 사용자 쓰기 권한
  CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'question-images' AND
    auth.role() = 'authenticated'
  );
  ```

### 4. Google OAuth 설정

1. Google Cloud Console에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. Supabase > Authentication > Providers > Google 설정
4. 리다이렉트 URL 추가:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

## 환경 변수

### 필수 변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 선택 변수

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 성능 최적화

### 1. 이미지 최적화

- Next.js Image 컴포넌트 사용 (이미 구현)
- Supabase 이미지 리사이징 활용 가능

### 2. 데이터베이스

- 인덱스 자동 생성 (마이그레이션에 포함)
- 쿼리 최적화 (필요시)

### 3. 캐싱

- Next.js 기본 캐싱 활용
- ISR (Incremental Static Regeneration) 고려

## 모니터링

### Vercel Analytics

- 자동으로 활성화됨
- Vercel Dashboard에서 확인

### Supabase

- SQL Editor에서 쿼리 실행 시간 확인
- Database > Logs에서 에러 로그 확인

## 문제 해결

### 이미지 업로드 실패

- Supabase Storage 버킷 권한 확인
- 파일 크기 제한 (5MB) 확인

### 검색이 느림

- `idx_questions_search_vector` 인덱스 존재 확인
- `002_add_search_optimization.sql` 마이그레이션 적용 확인

### 인증 오류

- Google OAuth 리다이렉트 URL 확인
- Supabase 프로젝트 설정에서 URL 확인

### 데이터베이스 연결 오류

- 환경 변수 확인
- Supabase 프로젝트 활성 상태 확인
- 방화벽 규칙 확인 (클라우드 배포시)

## 롤백

배포 실패시:

### Vercel
```bash
vercel rollback
```

### AWS Amplify
- AWS Console에서 배포 이력 확인
- 이전 버전으로 재배포

### Docker
```bash
docker ps  # 컨테이너 확인
docker stop <container_id>  # 현재 버전 중지
docker run # 이전 버전 실행
```

## 보안 체크리스트

- [ ] 환경 변수 보안 (공개하지 않음)
- [ ] HTTPS 활성화
- [ ] CORS 설정 적절
- [ ] 수정된 API 로직 검토
- [ ] 데이터베이스 백업 활성화

## 성능 벤치마크

배포 후 다음을 확인하세요:

- [ ] 검색 응답 < 1초
- [ ] 이미지 업로드 < 10초
- [ ] 페이지 로딩 < 3초

---

더 많은 정보는 공식 문서를 참조하세요:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Deployment](https://supabase.com/docs/guides/hosting)
- [Vercel Docs](https://vercel.com/docs)
