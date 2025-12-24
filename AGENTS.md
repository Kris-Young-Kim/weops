# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Next.js 16.0+** with React 19 and App Router
- **Authentication**: Clerk (with Korean localization)
- **Database**: Neon (Serverless PostgreSQL) with Drizzle ORM
- **Styling**: Tailwind CSS v4 (uses `globals.css`, no config file)
- **UI Components**: shadcn/ui (based on Radix UI)
- **Icons**: lucide-react
- **Forms**: react-hook-form + Zod
- **Package Manager**: pnpm
- **Language**: TypeScript (strict typing required)

## Development Commands

```bash
# Development server with turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## Project Architecture

### Clerk + Neon Integration

이 프로젝트는 Clerk와 Neon의 통합을 사용합니다:

1. **인증 흐름**:

   - Clerk가 사용자 인증 처리
   - `SyncUserProvider`가 로그인 시 자동으로 Clerk 사용자를 Neon `users` 테이블에 동기화
   - Drizzle ORM을 통해 Neon 데이터베이스에 접근

2. **데이터베이스 접근** (`src/db/`):

   - `index.ts`: Drizzle ORM 클라이언트 설정
     - Connection Pooling 지원 (프로덕션)
     - Neon 연결 설정
   - `schema.ts`: 테이블 스키마 정의 (Drizzle ORM)
     - Type-safe 스키마 정의
     - 마이그레이션 자동 생성
   - `migrations/`: Drizzle이 생성한 SQL 마이그레이션 파일들

3. **사용자 동기화**:
   - `hooks/use-sync-user.ts`: Clerk → Neon 사용자 동기화 훅
   - `components/providers/sync-user-provider.tsx`: RootLayout에서 자동 실행
   - `app/api/sync-user/route.ts`: 실제 동기화 로직 (API 라우트)

### Directory Convention

프로젝트 파일은 `app` 외부에 저장:

- `app/`: 라우팅 전용 (page.tsx, layout.tsx, route.ts 등만)
- `components/`: 재사용 가능한 컴포넌트
  - `components/ui/`: shadcn 컴포넌트 (자동 생성, 수정 금지)
  - `components/providers/`: React Context 프로바이더들
- `lib/`: 유틸리티 함수 및 클라이언트 설정
  - `lib/utils.ts`: 공통 유틸리티 (cn 함수 등)
- `src/db/`: 데이터베이스 스키마 및 마이그레이션 (Neon + Drizzle)
  - `src/db/index.ts`: Drizzle ORM 클라이언트
  - `src/db/schema.ts`: 테이블 스키마 정의
  - `src/db/migrations/`: Drizzle이 생성한 SQL 마이그레이션 파일들
- `hooks/`: 커스텀 React Hook들

**예정된 디렉토리** (아직 없지만 필요 시 생성):

- `actions/`: Server Actions (API 대신 우선 사용)
- `types/`: TypeScript 타입 정의
- `constants/`: 상수 값들
- `states/`: 전역 상태 (jotai 사용, 최소화)

### Naming Conventions

- **파일명**: kebab-case (예: `use-sync-user.ts`, `sync-user-provider.tsx`)
- **컴포넌트**: PascalCase (파일명은 여전히 kebab-case)
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase

## Database

### Neon + Drizzle ORM

**데이터베이스**: Neon (Serverless PostgreSQL)  
**ORM**: Drizzle ORM

#### 마이그레이션 관리

마이그레이션 파일은 Drizzle이 자동 생성하며, `src/db/migrations/` 디렉토리에 저장됩니다.

**명령어**:
```bash
# 스키마 변경사항 감지 및 마이그레이션 파일 생성
pnpm db:generate

# 마이그레이션 적용 (Neon DB에 반영)
pnpm db:migrate

# 빠른 프로토타이핑 (주의: 프로덕션에서는 사용 금지)
pnpm db:push
```

**마이그레이션 파일 구조**:
```
src/db/migrations/
├── 0000_initial.sql
├── 0001_add_users_table.sql
└── ...
```

**중요**:

- 마이그레이션 파일은 Git에 커밋하여 버전 관리
- 프로덕션 배포 전 반드시 스테이징 환경에서 테스트
- Neon의 Branching 기능을 활용하여 안전한 마이그레이션

#### 현재 스키마

**데이터베이스 테이블**:

- `users`: Clerk 사용자와 동기화되는 사용자 정보
  - `id`: UUID (Primary Key)
  - `clerk_user_id`: TEXT (Unique, Clerk User ID)
  - `email`: TEXT
  - `org_id`: UUID (Foreign Key → organizations)
  - `role`: TEXT (OWNER, STAFF, DRIVER)
  - `created_at`: TIMESTAMPTZ

- `organizations`: 사업소 정보
- `recipients`: 수급자 정보
- `products`: 제품 마스터
- `assets`: 자산 (WeStock)
- `orders`: 주문 (WeGuard)
- `order_items`: 주문 상세

**파일 저장소**:

- **Vercel Blob Storage** 또는 **AWS S3** 사용
- Storage 관련 가이드는 [NEON_GUIDE.md](./docs/NEON_GUIDE.md) 참조

## Environment Variables

`.env.example` 참고하여 `.env` 파일 생성:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Neon Database
DATABASE_URL="postgresql://user:pass@[endpoint].neon.tech/[database]?sslmode=require"
DATABASE_POOL_URL="postgresql://user:pass@[endpoint].neon.tech/[database]?sslmode=require&pgbouncer=true"

# Storage (Vercel Blob 또는 AWS S3)
BLOB_READ_WRITE_TOKEN=  # Vercel Blob 사용 시
# 또는
AWS_ACCESS_KEY_ID=  # AWS S3 사용 시
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=
```

## Development Guidelines

### Server Actions vs API Routes

**우선순위**: Server Actions > API Routes

- 가능하면 항상 Server Actions 사용 (`actions/` 디렉토리)
- API Routes는 불가피한 경우에만 사용 (웹훅, 외부 API 등)
- 현재 `/api/sync-user`는 기존 구조상 API Route로 구현됨

### UI Components

1. **shadcn/ui 설치 확인**: 사용 전 `/components/ui/` 디렉토리 체크
2. **설치 명령어**: `pnpx shadcn@latest add [component-name]`
3. **아이콘**: lucide-react 사용 (`import { Icon } from 'lucide-react'`)

### Styling

- Tailwind CSS v4 사용 (설정은 `app/globals.css`에만)
- `tailwind.config.js` 파일은 사용하지 않음
- 다크/라이트 모드 지원 고려

### TypeScript

- 모든 코드에 타입 정의 필수
- 인터페이스 우선, 타입은 필요시만
- enum 대신 const 객체 사용
- `satisfies` 연산자로 타입 검증

### React 19 & Next.js 16 Patterns

```typescript
// Async Request APIs (항상 await 사용)
const cookieStore = await cookies();
const headersList = await headers();
const params = await props.params;
const searchParams = await props.searchParams;

// Server Component 우선
// 'use client'는 필요한 경우에만
// middleware.ts 대신 proxy.ts 사용 (Next.js 16)
```

## Key Files

- `proxy.ts`: Clerk 미들웨어 (인증 라우트 보호, Next.js 16 proxy 컨벤션)
- `app/layout.tsx`: RootLayout with ClerkProvider + SyncUserProvider
- `src/db/index.ts`: Drizzle ORM 클라이언트 (Neon 연결)
- `src/db/schema.ts`: 데이터베이스 스키마 정의
- `components.json`: shadcn/ui 설정

## Additional Cursor Rules

프로젝트에는 다음 Cursor 규칙들이 있습니다:

- `.cursor/rules/web/nextjs-convention.mdc`: Next.js 컨벤션
- `.cursor/rules/web/design-rules.mdc`: UI/UX 디자인 가이드
- `.cursor/rules/web/playwright-test-guide.mdc`: 테스트 가이드
- `.cursor/rules/supabase/`: Supabase 관련 규칙들 (레거시, 참고용)
- `docs/NEON_GUIDE.md`: Neon 사용법 상세 가이드

주요 원칙은 이 CLAUDE.md에 통합되어 있으나, 세부사항은 해당 파일들 참고.
