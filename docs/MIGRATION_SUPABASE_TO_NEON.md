# Supabase → Neon 마이그레이션 가이드

**문서 버전**: 1.0  
**작성일**: 2025-01-21  
**목적**: Supabase에서 Neon으로 전환한 변경사항 요약

---

## 📋 변경 사항 요약

### 1. 데이터베이스 플랫폼 변경

| 항목 | 이전 (Supabase) | 현재 (Neon) |
|------|----------------|-------------|
| 데이터베이스 | Supabase PostgreSQL | Neon Serverless PostgreSQL |
| 인증 | Supabase Auth | Clerk (외부) |
| Storage | Supabase Storage | Vercel Blob Storage / AWS S3 |
| Realtime | Supabase Realtime | Server-Sent Events / WebSocket |
| ORM | Supabase Client | Drizzle ORM |
| 마이그레이션 | Supabase Migrations | Drizzle Migrations |
| 특별 기능 | RLS, Storage, Realtime | Branching, Time Travel, Connection Pooling |

### 2. 주요 변경점

#### ✅ 추가된 기능

- **Branching**: Git처럼 데이터베이스 브랜치 생성 (개발/스테이징/프로덕션 분리)
- **Time Travel**: 특정 시점으로 데이터 복구 가능 (PITR)
- **Connection Pooling**: 내장 커넥션 풀링으로 성능 최적화
- **Drizzle ORM**: Type-safe 쿼리 및 마이그레이션 관리

#### ❌ 제거된 기능

- Supabase Auth (→ Clerk로 대체)
- Supabase Storage (→ Vercel Blob Storage로 대체)
- Supabase Realtime (→ Server-Sent Events로 대체)
- Supabase Dashboard (→ Neon Console로 대체)

---

## 🔄 코드 변경 사항

### 데이터베이스 클라이언트

**이전 (Supabase)**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data } = await supabase.from('users').select('*');
```

**현재 (Neon + Drizzle)**:
```typescript
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const data = await db.select().from(users);
```

### 환경 변수 변경

**이전**:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**현재**:
```env
DATABASE_URL="postgresql://user:pass@[endpoint].neon.tech/[database]?sslmode=require"
DATABASE_POOL_URL="postgresql://user:pass@[endpoint].neon.tech/[database]?sslmode=require&pgbouncer=true"
```

### 마이그레이션 관리

**이전**:
```bash
# Supabase CLI 사용
supabase migration new create_users_table
supabase db push
```

**현재**:
```bash
# Drizzle ORM 사용
pnpm db:generate  # 스키마 변경 감지
pnpm db:migrate   # 마이그레이션 적용
pnpm db:push      # 빠른 프로토타이핑 (개발용)
```

---

## 📚 참고 문서

- [Neon 사용 가이드](./NEON_GUIDE.md) - 상세한 Neon 사용법
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Neon 공식 문서](https://neon.tech/docs)

---

## ⚠️ 주의사항

1. **기존 Supabase 코드 제거**: `lib/supabase/` 디렉토리의 파일들은 더 이상 사용하지 않습니다.
2. **Storage 마이그레이션**: 기존 Supabase Storage에 저장된 파일은 Vercel Blob Storage 또는 S3로 마이그레이션 필요.
3. **Realtime 기능**: 기존 Supabase Realtime을 사용하던 부분은 Server-Sent Events 또는 WebSocket으로 재구현 필요.

---

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21

