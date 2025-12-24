# Neon 데이터베이스 UI 연동 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**대상**: 개발자  
**적용 범위**: WeOps 프로젝트 전체

---

## 📋 목차

1. [개요](#1-개요)
2. [Server Actions 패턴](#2-server-actions-패턴)
3. [데이터 조회 예시](#3-데이터-조회-예시)
4. [데이터 생성/수정 예시](#4-데이터-생성수정-예시)
5. [에러 처리](#5-에러-처리)
6. [멀티테넌시 (org_id 필터링)](#6-멀티테넌시-org_id-필터링)
7. [UI 컴포넌트 업데이트 가이드](#7-ui-컴포넌트-업데이트-가이드)

---

## 1. 개요

이 프로젝트는 **Neon 데이터베이스**와 **Drizzle ORM**을 사용하여 데이터를 관리합니다. 모든 UI 컴포넌트는 **Server Actions**를 통해 Neon DB와 연동됩니다.

### 핵심 원칙

- ✅ **Server Actions 우선**: API Routes 대신 Server Actions 사용
- ✅ **자동 org_id 필터링**: 모든 쿼리는 현재 사용자의 사업소(org_id)로 자동 필터링
- ✅ **Type-safe**: Drizzle ORM의 타입 추론 활용
- ✅ **로깅**: 모든 Server Action에 로그 추가 (디버깅 용이)

---

## 2. Server Actions 패턴

### 2.1 기본 구조

Server Actions는 `actions/` 디렉토리에 저장되며, 다음과 같은 구조를 따릅니다:

```
actions/
├── auth.ts          # 인증 헬퍼 함수
├── assets.ts        # 자산 관리
├── orders.ts        # 주문 관리
├── recipients.ts    # 수급자 관리
└── stats.ts         # 통계 데이터
```

### 2.2 Server Action 작성 규칙

```typescript
"use server";

import { db, assets } from "@/src/db";
import { eq, and } from "drizzle-orm";
import { requireOrgId } from "./auth";

export async function getAssets() {
  console.group("[Server Action] getAssets");
  
  try {
    const orgId = await requireOrgId(); // 현재 사업소 ID 가져오기
    
    const result = await db
      .select()
      .from(assets)
      .where(eq(assets.orgId, orgId)); // org_id 필터링 필수!
    
    console.log(`Found ${result.length} assets`);
    console.groupEnd();
    
    return result;
  } catch (error) {
    console.error("Error:", error);
    console.groupEnd();
    throw error;
  }
}
```

### 2.3 인증 헬퍼 함수

`actions/auth.ts`에서 제공하는 함수들:

- `getCurrentUserId()`: 현재 Clerk User ID
- `getCurrentUser()`: 현재 Neon DB User 정보
- `getCurrentOrgId()`: 현재 Organization ID
- `requireAuth()`: 인증 필수 (에러 발생)
- `requireOrgId()`: org_id 필수 (에러 발생)

---

## 3. 데이터 조회 예시

### 3.1 컴포넌트에서 Server Action 호출

```tsx
"use client";

import { useEffect, useState } from "react";
import { getAssets } from "@/actions/assets";
import type { Asset } from "@/src/db/schema";

export function InventoryTable() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const data = await getAssets();
        setAssets(data);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      {assets.map((asset) => (
        <div key={asset.id}>{asset.productName}</div>
      ))}
    </div>
  );
}
```

### 3.2 React Server Component에서 직접 호출

```tsx
import { getAssets } from "@/actions/assets";

export default async function InventoryPage() {
  const assets = await getAssets();

  return (
    <div>
      {assets.map((asset) => (
        <div key={asset.id}>{asset.productName}</div>
      ))}
    </div>
  );
}
```

---

## 4. 데이터 생성/수정 예시

### 4.1 폼 제출 처리

```tsx
"use client";

import { useState } from "react";
import { createAsset } from "@/actions/assets";
import { useToast } from "@/hooks/use-toast";

export function CreateAssetForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    
    try {
      const asset = await createAsset({
        productId: formData.get("productId") as string,
        serialNumber: formData.get("serialNumber") as string,
        qrCode: formData.get("qrCode") as string,
        status: "AVAILABLE",
      });

      toast({
        title: "자산이 생성되었습니다",
        description: `QR 코드: ${asset.qrCode}`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit}>
      {/* 폼 필드들 */}
      <button type="submit" disabled={loading}>
        {loading ? "생성 중..." : "생성"}
      </button>
    </form>
  );
}
```

---

## 5. 에러 처리

### 5.1 Server Action에서 에러 처리

```typescript
export async function createAsset(data: NewAsset) {
  try {
    const orgId = await requireOrgId();
    
    // 유효성 검사
    if (!data.productId) {
      throw new Error("제품을 선택해주세요.");
    }
    
    const newAsset = await db.insert(assets).values({ ...data, orgId }).returning();
    return newAsset[0];
  } catch (error) {
    console.error("Error creating asset:", error);
    
    // 사용자 친화적인 에러 메시지
    if (error instanceof Error) {
      throw error; // 에러 메시지 그대로 전달
    }
    throw new Error("자산 생성 중 오류가 발생했습니다.");
  }
}
```

### 5.2 클라이언트에서 에러 처리

```tsx
try {
  const asset = await createAsset(data);
} catch (error) {
  // 에러 메시지를 사용자에게 표시
  toast({
    title: "오류",
    description: error instanceof Error ? error.message : "알 수 없는 오류",
    variant: "destructive",
  });
}
```

---

## 6. 멀티테넌시 (org_id 필터링)

### 6.1 자동 필터링

모든 Server Action은 `requireOrgId()`를 통해 현재 사용자의 `org_id`를 가져와서 자동으로 필터링합니다:

```typescript
const orgId = await requireOrgId();

// ❌ 잘못된 예: org_id 필터링 없음
const assets = await db.select().from(assets);

// ✅ 올바른 예: org_id 필터링 필수
const assets = await db
  .select()
  .from(assets)
  .where(eq(assets.orgId, orgId));
```

### 6.2 JOIN 쿼리에서도 필터링

```typescript
const result = await db
  .select()
  .from(assets)
  .leftJoin(products, eq(assets.productId, products.id))
  .where(eq(assets.orgId, orgId)); // assets 테이블의 org_id로 필터링
```

---

## 7. UI 컴포넌트 업데이트 가이드

### 7.1 기존 컴포넌트 업데이트 순서

1. **하드코딩된 데이터 제거**
   ```tsx
   // ❌ 이전
   const inventoryData = [
     { id: "1", productName: "보행기", ... },
   ];
   
   // ✅ 이후
   const [assets, setAssets] = useState<Asset[]>([]);
   ```

2. **Server Action import 및 호출**
   ```tsx
   import { getAssets } from "@/actions/assets";
   
   useEffect(() => {
     async function fetchData() {
       const data = await getAssets();
       setAssets(data);
     }
     fetchData();
   }, []);
   ```

3. **로딩 및 에러 상태 추가**
   ```tsx
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   
   if (loading) return <div>로딩 중...</div>;
   if (error) return <div>오류: {error}</div>;
   ```

### 7.2 업데이트 대상 컴포넌트

다음 컴포넌트들을 순차적으로 업데이트해야 합니다:

- ✅ `components/stats-cards.tsx` → `actions/stats.ts` 사용
- ✅ `components/inventory-table.tsx` → `actions/assets.ts` 사용
- ✅ `components/recent-orders.tsx` → `actions/orders.ts` 사용
- ✅ `components/beneficiary-search.tsx` → `actions/recipients.ts` 사용
- ✅ `components/product-search.tsx` → `actions/products.ts` 생성 필요

---

## 8. 참고 자료

- [Neon 가이드](./NEON_GUIDE.md)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Next.js Server Actions 문서](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**문서 정보**

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21  
**버전**: 1.0

