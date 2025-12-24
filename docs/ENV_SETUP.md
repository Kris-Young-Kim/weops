# 환경 변수 설정 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**목적**: WeOps 프로젝트 환경 변수 설정 방법 안내

---

## 📋 목차

1. [필수 환경 변수](#1-필수-환경-변수)
2. [설정 방법](#2-설정-방법)
3. [Neon Database 설정](#3-neon-database-설정)
4. [Clerk 인증 설정](#4-clerk-인증-설정)
5. [Vercel 배포 시 설정](#5-vercel-배포-시-설정)

---

## 1. 필수 환경 변수

### 데이터베이스 (Neon)

- `DATABASE_URL`: Neon 데이터베이스 연결 문자열 (개발/프로덕션)
- `DATABASE_POOL_URL`: Neon Connection Pooling 연결 문자열 (프로덕션 권장)

### 인증 (Clerk)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk 공개 키 (클라이언트)
- `CLERK_SECRET_KEY`: Clerk 비밀 키 (서버)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: 로그인 페이지 경로
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`: 로그인 후 리다이렉트 URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`: 회원가입 후 리다이렉트 URL

### 앱 설정

- `NEXT_PUBLIC_APP_URL`: 앱 기본 URL (개발: `http://localhost:3000`)

---

## 2. 설정 방법

### 로컬 개발 환경

1. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.example 파일을 복사
cp .env.example .env.local
```

2. `.env.local` 파일을 열고 실제 값으로 채우기

3. 파일 저장 (`.env.local`은 자동으로 `.gitignore`에 포함됨)

### 프로덕션 환경 (Vercel)

Vercel 대시보드에서 환경 변수 설정:

1. Vercel 프로젝트 → Settings → Environment Variables
2. 각 환경 변수 추가
3. 환경별 설정 (Production, Preview, Development)

---

## 3. Neon Database 설정

### 3.1 Neon 프로젝트 생성

1. [Neon Console](https://console.neon.tech) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름 입력 (예: `weops-dev`)

### 3.2 연결 문자열 가져오기

1. Neon 프로젝트 대시보드 → **Connection Details**
2. **Connection string** 복사
3. 형식: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

### 3.3 Connection Pooling 설정 (프로덕션)

1. Neon 프로젝트 → **Connection Pooling**
2. Pooling 모드 선택 (Transaction 또는 Session)
3. Pooling 연결 문자열 복사
4. 형식: `postgresql://user:password@host.neon.tech/dbname?sslmode=require&pgbouncer=true`

### 3.4 .env.local 예시

```bash
# 개발 환경 (Direct Connection)
DATABASE_URL="postgresql://user:pass@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require"

# 프로덕션 환경 (Connection Pooling)
DATABASE_POOL_URL="postgresql://user:pass@ep-xxx-xxx-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true"
```

---

## 4. Clerk 인증 설정

### 4.1 Clerk 프로젝트 생성

1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. 새 애플리케이션 생성
3. 애플리케이션 이름 입력 (예: `WeOps`)

### 4.2 API 키 가져오기

1. Clerk 대시보드 → **API Keys**
2. **Publishable key** 복사 → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. **Secret key** 복사 → `CLERK_SECRET_KEY`

### 4.3 인증 설정

1. Clerk 대시보드 → **User & Authentication**
2. **Email, Phone, Username** 등 인증 방법 선택
3. 한국어 지원 설정 (선택사항)

### 4.4 .env.local 예시

```bash
# Clerk 인증 키
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 인증 페이지 경로
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

---

## 5. Vercel 배포 시 설정

### 5.1 환경 변수 추가

1. Vercel 프로젝트 → **Settings** → **Environment Variables**
2. 각 환경 변수 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `DATABASE_URL` | Neon 연결 문자열 | Production, Preview, Development |
| `DATABASE_POOL_URL` | Neon Pooling 연결 문자열 | Production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | All |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | All |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | All |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` | All |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` | All |
| `NEXT_PUBLIC_APP_URL` | 프로덕션 URL | Production |

### 5.2 환경별 설정

- **Production**: 프로덕션 데이터베이스 및 프로덕션 Clerk 키
- **Preview**: 스테이징 데이터베이스 및 개발 Clerk 키
- **Development**: 로컬 개발용 (일반적으로 사용 안 함)

### 5.3 배포 후 확인

1. 배포 완료 후 환경 변수 로드 확인
2. 로그인/회원가입 테스트
3. 데이터베이스 연결 테스트

---

## 6. 환경 변수 검증

### 6.1 로컬에서 확인

```bash
# 개발 서버 실행
pnpm dev

# 환경 변수 로드 확인 (브라우저 콘솔)
console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
```

### 6.2 필수 변수 체크리스트

- [ ] `DATABASE_URL` 설정됨
- [ ] `DATABASE_POOL_URL` 설정됨 (프로덕션)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정됨
- [ ] `CLERK_SECRET_KEY` 설정됨
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` 설정됨
- [ ] `NEXT_PUBLIC_APP_URL` 설정됨

---

## 7. 문제 해결

### 7.1 환경 변수가 로드되지 않음

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확한지 확인 (`.env.local`, `.env` 아님)
- 개발 서버 재시작 (`pnpm dev`)

### 7.2 Clerk 인증 오류

- Clerk 대시보드에서 애플리케이션 URL 설정 확인
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` 경로가 올바른지 확인
- Clerk 키가 올바른지 확인 (테스트/프로덕션 키 구분)

### 7.3 데이터베이스 연결 오류

- Neon 연결 문자열 형식 확인
- SSL 모드 확인 (`sslmode=require`)
- Connection Pooling URL 확인 (프로덕션)

---

## 8. 보안 주의사항

### 8.1 절대 커밋하지 말 것

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 이미 포함되어 있습니다
- 비밀 키가 노출되면 즉시 재발급하세요

### 8.2 환경 변수 관리

- 프로덕션과 개발 환경의 키를 분리하세요
- 정기적으로 키를 로테이션하세요
- Vercel 환경 변수는 암호화되어 저장됩니다

---

## 9. 참고 자료

- [Neon 공식 문서](https://neon.tech/docs)
- [Clerk 공식 문서](https://clerk.com/docs)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

---

**문서 정보**

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21  
**버전**: 1.0

