# Neon 데이터베이스 사용 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**대상**: 개발자, DBA  
**적용 범위**: WeOps 프로젝트 전체

---

## 📋 목차

1. [Neon이란?](#1-neon이란)
2. [Neon 계정 생성 및 프로젝트 설정](#2-neon-계정-생성-및-프로젝트-설정)
3. [연결 설정 (Connection Setup)](#3-연결-설정-connection-setup)
4. [Drizzle ORM 연동](#4-drizzle-orm-연동)
5. [마이그레이션 관리](#5-마이그레이션-관리)
6. [Branching 기능 활용](#6-branching-기능-활용)
7. [Time Travel (PITR) 활용](#7-time-travel-pitr-활용)
8. [Connection Pooling](#8-connection-pooling)
9. [모니터링 및 성능 최적화](#9-모니터링-및-성능-최적화)
10. [Storage 및 파일 관리 대체 방안](#10-storage-및-파일-관리-대체-방안)
11. [Realtime 기능 대체 방안](#11-realtime-기능-대체-방안)
12. [자주 묻는 질문 (FAQ)](#12-자주-묻는-질문-faq)

---

## 1. Neon이란?

**Neon**은 Serverless PostgreSQL 데이터베이스 서비스입니다. 컴퓨팅과 스토리지가 분리된 아키텍처로, 자동 스케일링과 비용 최적화를 제공합니다.

### 주요 특징

- ✅ **Serverless**: 자동 스케일링, 사용한 만큼만 과금
- ✅ **Branching**: Git처럼 데이터베이스 브랜치 생성 가능 (개발/스테이징/프로덕션 분리)
- ✅ **Time Travel**: 특정 시점으로 데이터 복구 가능 (PITR)
- ✅ **Connection Pooling**: 내장 커넥션 풀링으로 성능 최적화
- ✅ **Vercel 통합**: Vercel과 완벽한 통합 지원
- ✅ **PostgreSQL 호환**: 표준 PostgreSQL이므로 기존 도구/라이브러리 모두 사용 가능

### Supabase와의 차이점

| 기능         | Supabase          | Neon                                         |
| ------------ | ----------------- | -------------------------------------------- |
| 데이터베이스 | PostgreSQL        | PostgreSQL                                   |
| 인증         | Supabase Auth     | 외부 (Clerk 사용)                            |
| Storage      | Supabase Storage  | 외부 필요 (Vercel Blob, S3 등)               |
| Realtime     | Supabase Realtime | 외부 필요 (WebSocket, Server-Sent Events 등) |
| Branching    | ❌                | ✅                                           |
| Time Travel  | ❌                | ✅                                           |

---

## 2. Neon 계정 생성 및 프로젝트 설정

### 2.1 계정 생성

1. [Neon 공식 웹사이트](https://neon.tech) 접속
2. "Sign Up" 클릭 (GitHub 계정으로 가입 권장)
3. 이메일 인증 완료

### 2.2 프로젝트 생성

1. Neon Console 대시보드에서 **"Create Project"** 클릭
2. 프로젝트 정보 입력:
   - **Project Name**: `weops-production` (또는 원하는 이름)
   - **Region**: `Seoul (ap-northeast-2)` 또는 가장 가까운 리전 선택
   - **PostgreSQL Version**: `16` (최신 버전 권장)
3. **"Create Project"** 클릭

### 2.3 연결 정보 확인

프로젝트 생성 후 다음 정보를 확인하세요:

```
Connection String:
postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require

또는

Host: [endpoint].neon.tech
Database: [database]
User: [user]
Password: [password]
Port: 5432
```

**⚠️ 중요**: Connection String은 한 번만 표시되므로 `.env.local`에 즉시 저장하세요.

---

## 3. 연결 설정 (Connection Setup)

### 3.1 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Neon Database
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require"

# Connection Pooling (선택사항, 성능 향상)
DATABASE_POOL_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require&pgbouncer=true"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3.2 Connection Pooling 사용

Neon은 **Connection Pooling**을 내장 지원합니다. 프로덕션 환경에서는 반드시 사용하세요.

**이유**:

- Serverless 환경에서 연결 수 제한 문제 해결
- Cold start 시간 단축
- 비용 절감

**사용 방법**:

1. Neon Console에서 **"Connection Pooling"** 활성화
2. Pooling URL을 `DATABASE_POOL_URL`에 저장
3. 프로덕션에서는 `DATABASE_POOL_URL` 사용, 개발 환경에서는 `DATABASE_URL` 사용

```typescript
// lib/db/index.ts
const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_POOL_URL!
    : process.env.DATABASE_URL!;
```

---

## 4. Drizzle ORM 연동

### 4.1 패키지 설치

필요한 패키지를 설치합니다:

```bash
# 프로덕션 의존성
pnpm add drizzle-orm postgres

# 개발 의존성 (마이그레이션 및 타입 생성 도구)
pnpm add -D drizzle-kit @types/pg
```

**패키지 설명**:

- `drizzle-orm`: Drizzle ORM 코어 라이브러리 (Type-safe 쿼리 빌더)
- `postgres`: PostgreSQL 드라이버 (Neon과 호환)
- `drizzle-kit`: 마이그레이션 생성 및 스키마 관리 도구 (개발용)
- `@types/pg`: PostgreSQL 타입 정의 (TypeScript 지원)

### 4.2 Drizzle 설정 파일 생성

`drizzle.config.ts` 파일 생성:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 4.3 데이터베이스 연결 설정

`src/db/index.ts` 파일 생성:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection Pooling 사용 (프로덕션)
const connectionString =
  process.env.DATABASE_POOL_URL || process.env.DATABASE_URL!;

// 개발 환경: 직접 연결
// 프로덕션: Connection Pooling
const client = postgres(connectionString, {
  max: 1, // Serverless 환경에서는 1로 설정
});

export const db = drizzle(client, { schema });
```

### 4.4 package.json 스크립트 추가

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 5. 마이그레이션 관리

### 5.1 스키마 생성

`src/db/schema.ts` 파일에 테이블 정의:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkOrgId: varchar("clerk_org_id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  bizNumber: varchar("biz_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 5.2 마이그레이션 생성 및 적용

```bash
# 1. 스키마 변경사항 감지 및 마이그레이션 파일 생성
pnpm db:generate

# 2. 마이그레이션 적용 (Neon DB에 반영)
pnpm db:migrate

# 또는 빠른 프로토타이핑 시 (주의: 프로덕션에서는 사용 금지)
pnpm db:push
```

### 5.3 마이그레이션 파일 구조

생성된 마이그레이션 파일은 `src/db/migrations/` 디렉토리에 저장됩니다:

```
src/db/migrations/
├── 0000_initial.sql
├── 0001_add_users_table.sql
└── ...
```

**⚠️ 중요**: 마이그레이션 파일은 Git에 커밋하여 버전 관리하세요.

---

## 6. Branching 기능 활용

Neon의 **Branching** 기능은 Git처럼 데이터베이스 브랜치를 생성할 수 있습니다.

### 6.1 Branch 생성

**Neon Console에서**:

1. 프로젝트 선택
2. **"Branches"** 탭 클릭
3. **"Create Branch"** 클릭
4. 브랜치 이름 입력: `development`, `staging` 등

### 6.2 Branch별 환경 변수

각 브랜치마다 다른 Connection String이 생성됩니다:

```env
# Production
DATABASE_URL="postgresql://user:pass@ep-prod-xxx.neon.tech/db?sslmode=require"

# Staging
DATABASE_URL_STAGING="postgresql://user:pass@ep-staging-xxx.neon.tech/db?sslmode=require"

# Development
DATABASE_URL_DEV="postgresql://user:pass@ep-dev-xxx.neon.tech/db?sslmode=require"
```

### 6.3 Branch 활용 시나리오

**시나리오 1: 기능 개발**

```bash
# 1. 새 브랜치 생성 (Neon Console)
# 2. 개발 환경 변수 설정
DATABASE_URL=$DATABASE_URL_DEV

# 3. 개발 및 테스트
pnpm db:push  # 스키마 변경 테스트

# 4. 완료 후 Production 브랜치에 마이그레이션 적용
DATABASE_URL=$DATABASE_URL
pnpm db:migrate
```

**시나리오 2: 데이터 복사**

```bash
# Staging 브랜치에 Production 데이터 복사 (Neon Console에서 가능)
# 또는 SQL로 직접 복사
```

### 6.4 Branch 삭제

더 이상 필요 없는 브랜치는 삭제하여 비용을 절감할 수 있습니다.

---

## 7. Time Travel (PITR) 활용

Neon의 **Time Travel** 기능을 사용하면 특정 시점으로 데이터를 복구할 수 있습니다.

### 7.1 Time Travel 사용 방법

**Neon Console에서**:

1. 프로젝트 선택
2. **"Time Travel"** 탭 클릭
3. 복구할 시점 선택 (타임라인에서 선택)
4. **"Create Branch"** 또는 **"Restore"** 클릭

### 7.2 실수 복구 시나리오

**시나리오: 실수로 데이터 삭제**

```sql
-- 실수로 실행한 쿼리
DELETE FROM orders WHERE id = 'xxx';

-- 복구 방법:
-- 1. Neon Console → Time Travel
-- 2. 삭제 전 시점 선택
-- 3. 새 브랜치 생성 또는 현재 브랜치로 복구
-- 4. 복구된 데이터 확인 후 Production에 반영
```

### 7.3 Time Travel 제한사항

- **보관 기간**: Neon 플랜에 따라 다름 (Free: 7일, Pro: 30일)
- **복구 시간**: 몇 분 ~ 몇 시간 소요 가능
- **성능 영향**: Time Travel 사용 시 일시적 성능 저하 가능

---

## 8. Connection Pooling

### 8.1 Pooling 활성화

**Neon Console에서**:

1. 프로젝트 선택
2. **"Connection Pooling"** 탭 클릭
3. **"Enable Pooling"** 클릭
4. Pooling URL 복사

### 8.2 Pooling URL 사용

```typescript
// lib/db/index.ts
const connectionString =
  process.env.DATABASE_POOL_URL || process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 1, // Serverless 환경에서는 1로 설정
  idle_timeout: 20, // 20초 후 연결 종료
  connect_timeout: 10, // 10초 연결 타임아웃
});
```

### 8.3 Pooling 모니터링

Neon Console에서 다음 지표를 모니터링할 수 있습니다:

- Active Connections
- Connection Pool Usage
- Query Performance

---

## 9. 모니터링 및 성능 최적화

### 9.1 Neon Console 모니터링

**Neon Console**에서 다음을 확인할 수 있습니다:

- **Metrics**: 쿼리 수, 연결 수, CPU/메모리 사용량
- **Queries**: 느린 쿼리 분석
- **Logs**: 데이터베이스 로그

### 9.2 성능 최적화 팁

**1. 인덱스 최적화**

```sql
-- 자주 조회되는 컬럼에 인덱스 생성
CREATE INDEX idx_assets_org_status ON assets(org_id, status);
CREATE INDEX idx_orders_recipient_date ON orders(recipient_id, order_date DESC);
```

**2. 쿼리 최적화**

```typescript
// ❌ 나쁜 예: N+1 쿼리
const orders = await db.select().from(orders);
for (const order of orders) {
  const recipient = await db
    .select()
    .from(recipients)
    .where(eq(recipients.id, order.recipientId));
}

// ✅ 좋은 예: JOIN 사용
const ordersWithRecipients = await db
  .select()
  .from(orders)
  .leftJoin(recipients, eq(orders.recipientId, recipients.id));
```

**3. Connection Pooling 사용**

- 프로덕션에서는 반드시 Connection Pooling 사용
- Serverless 환경에서 연결 수 제한 문제 해결

---

## 10. Storage 및 파일 관리 대체 방안

Neon은 파일 저장소를 제공하지 않으므로, 다음 대안을 사용해야 합니다.

### 10.1 Vercel Blob Storage (권장)

**설치**:

```bash
pnpm add @vercel/blob
```

**사용 예시**:

```typescript
import { put } from "@vercel/blob";

// 파일 업로드
const blob = await put("filename.pdf", file, {
  access: "public",
});

// URL: blob.url
```

**장점**:

- Vercel과 완벽한 통합
- CDN 자동 제공
- 간단한 API

### 10.2 AWS S3

**설치**:

```bash
pnpm add @aws-sdk/client-s3
```

**사용 예시**:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "ap-northeast-2" });

await s3Client.send(
  new PutObjectCommand({
    Bucket: "weops-storage",
    Key: "filename.pdf",
    Body: fileBuffer,
  }),
);
```

### 10.3 Cloudflare R2

**장점**:

- S3 호환 API
- egress 비용 없음
- 저렴한 가격

---

## 11. Realtime 기능 대체 방안

Neon은 Realtime 기능을 제공하지 않으므로, 다음 대안을 사용해야 합니다.

### 11.1 Server-Sent Events (SSE)

**Next.js API Route 예시**:

```typescript
// app/api/realtime/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // 주기적으로 데이터 전송
      const interval = setInterval(() => {
        const data = JSON.stringify({ message: "update" });
        controller.enqueue(`data: ${data}\n\n`);
      }, 1000);

      // 클라이언트 연결 종료 시 정리
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**클라이언트 사용**:

```typescript
const eventSource = new EventSource("/api/realtime");
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // UI 업데이트
};
```

### 11.2 WebSocket (Socket.io)

**설치**:

```bash
pnpm add socket.io socket.io-client
```

**서버 설정** (별도 서버 필요):

```typescript
import { Server } from "socket.io";

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("subscribe", (room) => {
    socket.join(room);
  });
});
```

### 11.3 Polling (간단한 대안)

**클라이언트에서 주기적으로 조회**:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetch("/api/orders");
    // UI 업데이트
  }, 5000); // 5초마다

  return () => clearInterval(interval);
}, []);
```

---

## 12. 자주 묻는 질문 (FAQ)

### Q1. Neon 무료 플랜의 제한사항은?

**A**:

- 데이터베이스 크기: 0.5GB
- 프로젝트 수: 1개
- Time Travel: 7일
- Connection Pooling: 지원

### Q2. 프로덕션에서 Connection Pooling을 사용해야 하나요?

**A**: 네, 반드시 사용하세요. Serverless 환경에서 연결 수 제한 문제를 해결하고 성능을 향상시킵니다.

### Q3. 마이그레이션을 되돌릴 수 있나요?

**A**:

- Drizzle은 롤백 기능을 제공하지 않습니다.
- 대신 Neon의 Time Travel 기능을 사용하여 이전 시점으로 복구할 수 있습니다.
- 또는 수동으로 롤백 마이그레이션 SQL을 작성하여 적용하세요.

### Q4. 여러 환경(개발/스테이징/프로덕션)을 어떻게 관리하나요?

**A**: Neon의 Branching 기능을 사용하세요. 각 환경마다 별도의 브랜치를 생성하고, 각 브랜치의 Connection String을 환경 변수로 관리하세요.

### Q5. 데이터베이스 백업은 어떻게 하나요?

**A**:

- Neon은 자동 백업을 제공합니다 (Time Travel 기능).
- 추가로 pg_dump를 사용하여 수동 백업도 가능합니다:

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Q6. 느린 쿼리를 어떻게 찾나요?

**A**:

- Neon Console의 **"Queries"** 탭에서 느린 쿼리를 확인할 수 있습니다.
- 또는 PostgreSQL의 `pg_stat_statements` 확장을 사용하세요.

### Q7. RLS (Row Level Security)를 사용할 수 있나요?

**A**: 네, Neon은 표준 PostgreSQL이므로 RLS를 완벽하게 지원합니다. 다만 애플리케이션 레벨에서도 데이터 격리를 구현하는 것을 권장합니다.

---

## 참고 자료

- [Neon 공식 문서](https://neon.tech/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

**문서 정보**

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21  
**버전**: 1.0
