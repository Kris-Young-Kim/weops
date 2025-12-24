# Organization(사업소) 격리 로직 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**적용 범위**: WeOps 프로젝트 전체  
**목적**: 멀티테넌시 환경에서 사업소별 데이터 격리 구현 가이드

---

## 📋 목차

1. [개요](#1-개요)
2. [핵심 원칙](#2-핵심-원칙)
3. [구현 방법](#3-구현-방법)
4. [공통 헬퍼 함수](#4-공통-헬퍼-함수)
5. [Server Actions 구현 예시](#5-server-actions-구현-예시)
6. [API Route 구현 예시](#6-api-route-구현-예시)
7. [체크리스트](#7-체크리스트)

---

## 1. 개요

WeOps는 **멀티테넌시(Multi-tenancy)** 아키텍처를 사용합니다. 각 사업소(Organization)의 데이터는 완전히 격리되어야 하며, 다른 사업소의 데이터에 접근할 수 없어야 합니다.

### 데이터 격리 대상 테이블

다음 테이블들은 `org_id`로 필터링되어야 합니다:

- ✅ `users` - 사용자 정보
- ✅ `recipients` - 수급자 정보
- ✅ `assets` - 자산 정보
- ✅ `orders` - 주문 정보
- ✅ `order_items` - 주문 상세 (간접적으로 orders를 통해 격리됨)

### 데이터 격리 불필요 테이블

다음 테이블은 전역 마스터 데이터이므로 `org_id` 필터링이 필요 없습니다:

- `products` - 제품 마스터 (모든 사업소가 공유)
- `organizations` - 사업소 정보 (시스템 레벨)

---

## 2. 핵심 원칙

### 2.1 모든 데이터 조회는 org_id 필터링 필수

**원칙**: `org_id`가 있는 테이블을 조회할 때는 반드시 현재 사용자의 `org_id`로 필터링해야 합니다.

**잘못된 예시**:
```typescript
// ❌ 잘못된 방법: org_id 필터링 없음
const recipients = await db.select().from(recipients);
```

**올바른 예시**:
```typescript
// ✅ 올바른 방법: org_id 필터링 적용
const orgId = await requireOrgId();
const recipients = await db
  .select()
  .from(recipients)
  .where(eq(recipients.orgId, orgId));
```

### 2.2 데이터 생성 시 org_id 자동 설정

**원칙**: 새 데이터를 생성할 때는 현재 사용자의 `org_id`를 자동으로 설정해야 합니다.

**올바른 예시**:
```typescript
const orgId = await requireOrgId();
const [newRecipient] = await db
  .insert(recipients)
  .values({
    ...data,
    orgId, // 현재 사업소 ID로 자동 설정
  })
  .returning();
```

### 2.3 데이터 수정/삭제 시 소유권 확인

**원칙**: 데이터를 수정하거나 삭제할 때는 해당 데이터가 현재 사업소에 속하는지 확인해야 합니다.

**올바른 예시**:
```typescript
const orgId = await requireOrgId();
const [updated] = await db
  .update(recipients)
  .set(data)
  .where(and(
    eq(recipients.id, recipientId),
    eq(recipients.orgId, orgId) // 소유권 확인
  ))
  .returning();

if (!updated) {
  throw new Error("수급자를 찾을 수 없습니다.");
}
```

---

## 3. 구현 방법

### 3.1 Server Actions에서 사용

**기본 패턴**:
```typescript
"use server";

import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq, and } from "drizzle-orm";

export async function getRecipients() {
  // 1. 현재 사용자의 org_id 가져오기
  const orgId = await requireOrgId();
  
  // 2. org_id로 필터링하여 조회
  return await db
    .select()
    .from(recipients)
    .where(eq(recipients.orgId, orgId));
}
```

### 3.2 API Route에서 사용

**기본 패턴**:
```typescript
import { NextResponse } from "next/server";
import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq } from "drizzle-orm";

export async function GET() {
  // 1. 현재 사용자의 org_id 가져오기
  const orgId = await requireOrgId();
  
  // 2. org_id로 필터링하여 조회
  const result = await db
    .select()
    .from(recipients)
    .where(eq(recipients.orgId, orgId));
  
  return NextResponse.json(result);
}
```

---

## 4. 공통 헬퍼 함수

### 4.1 `actions/auth.ts`

**핵심 함수**:

- `requireOrgId()`: 현재 사용자의 org_id를 가져옵니다 (인증 필수)
- `getCurrentOrgId()`: 현재 사용자의 org_id를 가져옵니다 (인증 선택)
- `getCurrentUser()`: 현재 사용자 정보를 가져옵니다

**사용 예시**:
```typescript
import { requireOrgId } from "@/actions/auth";

export async function getRecipients() {
  const orgId = await requireOrgId(); // 인증 필수, org_id 없으면 에러
  // ...
}
```

### 4.2 `lib/utils/org-isolation.ts`

**추가 유틸리티 함수**:

- `withOrgFilter()`: org_id 필터 조건 생성
- `addOrgFilter()`: 기존 조건에 org_id 필터 추가
- `isResourceOwnedByCurrentOrg()`: 리소스 소유권 확인
- `requireResourceOwnership()`: 리소스 소유권 확인 (에러 발생)

**사용 예시**:
```typescript
import { addOrgFilter, requireResourceOwnership } from "@/lib/utils/org-isolation";
import { recipients } from "@/src/db";
import { like } from "drizzle-orm";

// 복잡한 조건에 org_id 필터 추가
const conditions = await addOrgFilter(
  recipients.orgId,
  [like(recipients.name, '%검색어%')]
);

// 리소스 소유권 확인
const recipient = await getRecipientById(id);
await requireResourceOwnership(recipient.orgId);
```

---

## 5. Server Actions 구현 예시

### 5.1 조회 (SELECT)

```typescript
"use server";

import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq, and, like, or } from "drizzle-orm";

export async function getRecipients(options?: {
  search?: string;
  limit?: number;
}) {
  const orgId = await requireOrgId();
  
  const conditions = [eq(recipients.orgId, orgId)];
  
  if (options?.search) {
    const searchPattern = `%${options.search}%`;
    conditions.push(
      or(
        like(recipients.name, searchPattern),
        like(recipients.ltcNumber, searchPattern)
      )!
    );
  }
  
  return await db
    .select()
    .from(recipients)
    .where(and(...conditions))
    .limit(options?.limit || 100);
}
```

### 5.2 생성 (INSERT)

```typescript
"use server";

import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import type { NewRecipient } from "@/src/db/schema";

export async function createRecipient(
  data: Omit<NewRecipient, "orgId">
) {
  const orgId = await requireOrgId();
  
  const [newRecipient] = await db
    .insert(recipients)
    .values({
      ...data,
      orgId, // 현재 사업소 ID로 자동 설정
    })
    .returning();
  
  return newRecipient;
}
```

### 5.3 수정 (UPDATE)

```typescript
"use server";

import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq, and } from "drizzle-orm";

export async function updateRecipient(
  recipientId: string,
  data: Partial<Omit<NewRecipient, "orgId" | "id">>
) {
  const orgId = await requireOrgId();
  
  const [updated] = await db
    .update(recipients)
    .set(data)
    .where(and(
      eq(recipients.id, recipientId),
      eq(recipients.orgId, orgId) // 소유권 확인
    ))
    .returning();
  
  if (!updated) {
    throw new Error("수급자를 찾을 수 없습니다.");
  }
  
  return updated;
}
```

### 5.4 삭제 (DELETE)

```typescript
"use server";

import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq, and } from "drizzle-orm";

export async function deleteRecipient(recipientId: string) {
  const orgId = await requireOrgId();
  
  await db
    .delete(recipients)
    .where(and(
      eq(recipients.id, recipientId),
      eq(recipients.orgId, orgId) // 소유권 확인
    ));
}
```

---

## 6. API Route 구현 예시

### 6.1 GET 요청

```typescript
import { NextResponse } from "next/server";
import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const orgId = await requireOrgId();
    
    const result = await db
      .select()
      .from(recipients)
      .where(eq(recipients.orgId, orgId));
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 6.2 POST 요청

```typescript
import { NextResponse } from "next/server";
import { requireOrgId } from "@/actions/auth";
import { db, recipients } from "@/src/db";
import type { NewRecipient } from "@/src/db/schema";

export async function POST(request: Request) {
  try {
    const orgId = await requireOrgId();
    const data = await request.json();
    
    const [newRecipient] = await db
      .insert(recipients)
      .values({
        ...data,
        orgId, // 현재 사업소 ID로 자동 설정
      })
      .returning();
    
    return NextResponse.json(newRecipient);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 7. 체크리스트

새로운 Server Action이나 API Route를 작성할 때 다음 체크리스트를 확인하세요:

### ✅ 필수 체크 항목

- [ ] `org_id`가 있는 테이블을 조회할 때 `requireOrgId()`를 사용했는가?
- [ ] 모든 SELECT 쿼리에 `eq(table.orgId, orgId)` 조건이 포함되어 있는가?
- [ ] INSERT 시 `orgId`를 자동으로 설정했는가?
- [ ] UPDATE/DELETE 시 `orgId` 조건으로 소유권을 확인했는가?
- [ ] 에러 메시지가 명확한가? (예: "수급자를 찾을 수 없습니다.")

### ✅ 권장 체크 항목

- [ ] 로그에 `orgId`가 포함되어 있는가? (디버깅 용이)
- [ ] 복잡한 조건이 있을 때 `addOrgFilter()` 헬퍼를 사용했는가?
- [ ] 리소스 소유권 확인이 필요한 경우 `requireResourceOwnership()`을 사용했는가?

---

## 8. 현재 구현 상태

### ✅ 완료된 Server Actions

- `actions/recipients.ts` - 모든 함수에서 `requireOrgId()` 사용 ✅
- `actions/orders.ts` - 모든 함수에서 `requireOrgId()` 사용 ✅
- `actions/assets.ts` - 모든 함수에서 `requireOrgId()` 사용 ✅
- `actions/stats.ts` - `requireOrgId()` 사용 ✅

### ✅ 완료된 API Routes

- `app/api/sync-user/route.ts` - 사용자 동기화 (org_id 필터링 불필요) ✅

### ✅ 완료된 유틸리티 함수

- `actions/auth.ts` - `requireOrgId()`, `getCurrentOrgId()` 등 ✅
- `lib/utils/get-user-org.ts` - `getUserOrg()` 함수 ✅
- `lib/utils/org-isolation.ts` - 추가 헬퍼 함수들 ✅

---

## 9. 주의사항

### 9.1 products 테이블은 예외

`products` 테이블은 전역 마스터 데이터이므로 `org_id` 필터링이 필요 없습니다. 모든 사업소가 동일한 제품 마스터를 공유합니다.

```typescript
// ✅ 올바른 방법: products는 org_id 필터링 없음
const products = await db.select().from(products);
```

### 9.2 JOIN 쿼리 시 주의

JOIN을 사용할 때는 양쪽 테이블 모두 `org_id`로 필터링해야 합니다.

```typescript
// ✅ 올바른 방법: 양쪽 테이블 모두 org_id 필터링
const result = await db
  .select()
  .from(orders)
  .leftJoin(recipients, eq(orders.recipientId, recipients.id))
  .where(and(
    eq(orders.orgId, orgId),
    eq(recipients.orgId, orgId) // JOIN된 테이블도 필터링
  ));
```

### 9.3 트랜잭션 사용 시

트랜잭션 내에서도 모든 쿼리에 `org_id` 필터링을 적용해야 합니다.

```typescript
await db.transaction(async (tx) => {
  // 모든 쿼리에 org_id 필터링 적용
  const recipient = await tx
    .select()
    .from(recipients)
    .where(and(
      eq(recipients.id, recipientId),
      eq(recipients.orgId, orgId)
    ))
    .limit(1);
  
  // ...
});
```

---

## 10. 참고 문서

- [WeOps 데이터베이스 관리 가이드](./WeOps-데이터베이스-관리-가이드.md) - 데이터베이스 관리 원칙
- [AGENTS.md](../AGENTS.md) - 프로젝트 아키텍처
- [src/db/schema.ts](../src/db/schema.ts) - 데이터베이스 스키마

---

**문서 승인**

- 작성자: WeOps Team
- 최종 승인일: 2025-01-21

---

## 변경 이력

### v1.0 (2025-01-21)
- 초기 문서 작성
- Organization 격리 로직 가이드
- Server Actions 구현 예시
- API Route 구현 예시
- 체크리스트 작성

