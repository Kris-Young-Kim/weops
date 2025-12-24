📂 WeOps DIR (Directory Structure & File Architecture)
프로젝트명 WeOps (위옵스) 기준 버전 Next.js 16.0
작성일 2025년 12월 24일 작성자 PM & Lead Dev
핵심 전략 Colocation (관련된 코드끼리 뭉치기) & Server Actions First

1. Root Structure (최상위 구조)
   code
   Bash
   weops-platform/
   ├── .env.local # 환경변수 (DB URL, Clerk Key - 보안 주의)
   ├── .eslintrc.json # 코드 스타일 규칙
   ├── .gitignore # Git 제외 설정
   ├── components.json # shadcn/ui 설정 파일
   ├── drizzle.config.ts # Drizzle ORM 설정 (Migration 경로 등)
   ├── middleware.ts # Clerk 인증 미들웨어 (Edge Runtime)
   ├── next.config.mjs # Next.js 설정 (PWA, Image Domain 등)
   ├── package.json # 의존성 관리
   ├── postcss.config.js # Tailwind CSS 처리
   ├── tailwind.config.ts # Tailwind 커스텀 테마 (Blue/Teal/Rose)
   ├── tsconfig.json # TypeScript 설정
   └── src/ # 🚀 모든 소스 코드는 여기에
2. Source Code Structure (src/)
   2.1 src/app (Next.js App Router)
   라우팅과 페이지 레이아웃을 담당합니다.
   code
   Bash
   src/app/
   ├── (auth)/ # [Route Group] 인증 관련 (URL에 포함 안 됨)
   │ ├── layout.tsx # 인증 페이지 공통 레이아웃 (Centering)
   │ ├── sign-in/[[...sign-in]]/page.tsx # Clerk 로그인
   │ └── sign-up/[[...sign-up]]/page.tsx # Clerk 회원가입
   │
   ├── (dashboard)/ # [Route Group] 메인 앱 (로그인 후)
   │ ├── layout.tsx # 사이드바, 헤더가 포함된 메인 레이아웃
   │ ├── page.tsx # / (대시보드 메인 - 통계, 지도)
   │ ├── inventory/ # [Feature] WeStock 재고 관리
   │ │ ├── page.tsx # 재고 리스트
   │ │ ├── [id]/page.tsx # 재고 상세 및 이력
   │ │ └── qr/page.tsx # QR 코드 생성/인쇄 페이지
   │ ├── orders/ # [Feature] WeGuard 주문 관리
   │ │ ├── page.tsx # 주문 리스트
   │ │ └── new/page.tsx # 신규 주문 입력 (핵심 기능)
   │ └── recipients/ # [Feature] 수급자 관리
   │ └── page.tsx # 수급자 리스트 및 CRUD
   │
   ├── api/ # 외부 통신용 API (Webhook 등)
   │ ├── webhooks/
   │ │ ├── clerk/route.ts # Clerk 사용자 생성 시 DB 동기화
   │ │ └── n8n/route.ts # n8n 배치 작업 트리거
   │ └── pdf/route.ts # PDF 스트리밍 생성 API
   │
   ├── global.css # 전역 스타일 (Tailwind directives)
   ├── layout.tsx # Root Layout (Font, Metadata, Providers)
   └── not-found.tsx # 404 페이지
   2.2 src/actions (Server Actions - Backend Logic)
   기존의 API Route를 대체합니다. 클라이언트 컴포넌트에서 직접 호출하는 백엔드 함수들입니다.
   code
   Bash
   src/actions/
   ├── index.ts # Export barrel
   ├── auth-actions.ts # 사용자 권한 체크 등
   ├── inventory-actions.ts # 재고 CRUD, 상태 변경 (QR 스캔 로직)
   ├── order-actions.ts # ⭐ WeGuard 청구 방어 로직 (가장 중요)
   └── recipient-actions.ts # 수급자 관리 로직
   2.3 src/components (UI Building Blocks)
   ui와 features를 철저히 분리하여 재사용성과 유지보수성을 높입니다.
   code
   Bash
   src/components/
   ├── ui/ # shadcn/ui 컴포넌트 (디자인 시스템)
   │ ├── button.tsx
   │ ├── card.tsx
   │ ├── data-table.tsx # TanStack Table 기반 (엑셀 스타일)
   │ ├── input.tsx
   │ ├── toast.tsx
   │ └── ...
   │
   ├── layout/ # 레이아웃 관련 컴포넌트
   │ ├── header.tsx # 상단 바 (프로필, 알림)
   │ ├── sidebar.tsx # 좌측 메뉴 (NavItems)
   │ └── mobile-nav.tsx # 모바일용 햄버거 메뉴
   │
   └── features/ # 비즈니스 로직이 포함된 도메인 컴포넌트
   ├── dashboard/
   │ ├── stats-card.tsx # 통계 카드
   │ └── map-view.tsx # Google Maps 연동 컴포넌트
   ├── inventory/
   │ ├── qr-scanner.tsx # react-qr-reader 래퍼
   │ └── asset-table.tsx # 자산 리스트 테이블
   ├── orders/
   │ ├── order-form.tsx # ⭐ 주문 입력 폼 (검증 로직 포함)
   │ └── cart-summary.tsx # 장바구니 및 금액 계산기
   └── recipients/
   └── limit-chart.tsx # 잔여 한도 시각화 그래프
   2.4 src/db (Database Layer - Neon/Drizzle)
   20년 차 DBA의 관점에서 스키마와 마이그레이션을 관리합니다.
   code
   Bash
   src/db/
   ├── index.ts # DB 연결 설정 (Connection Pool)
   ├── schema.ts # 테이블 정의 (Organizations, Users, Assets...)
   └── migrations/ # Drizzle이 생성한 SQL 파일들 (Git 관리 대상)
   ├── 0000_initial.sql
   └── ...
   2.5 src/lib (Utilities & Config)
   공통으로 쓰이는 헬퍼 함수들입니다.
   code
   Bash
   src/lib/
   ├── constants.ts # 상수 (내구연한 테이블, 본인부담율 등)
   ├── fonts.ts # Next.js Font 설정 (Pretendard)
   ├── formatters.ts # 금액 포맷팅 (KRW), 날짜 포맷팅
   ├── utils.ts # shadcn cn() 헬퍼
   └── validations/ # Zod Schemas (프론트/백엔드 공통 검증)
   ├── asset-schema.ts
   └── order-schema.ts # 주문 검증 규칙 (WeGuard 로직과 일치해야 함)
   2.6 src/types (TypeScript Definitions)
   DB 스키마에서 자동으로 유추되지 않는 복잡한 타입들을 정의합니다.
   code
   Bash
   src/types/
   ├── index.d.ts # 전역 타입
   └── nav.ts # 사이드바 메뉴 타입 정의
3. 핵심 파일 상세 설명 (Key Files Detail)
   src/db/schema.ts
   WeOps의 데이터 구조를 정의하는 가장 중요한 파일입니다.
   code
   TypeScript
   import { pgTable, uuid, varchar, integer, boolean, ... } from "drizzle-orm/pg-core";

// Organizations (Tenant)
export const organizations = pgTable("organizations", {
id: uuid("id").defaultRandom().primaryKey(),
clerkOrgId: varchar("clerk_org_id").notNull().unique(),
// ...
});

// Assets (WeStock)
export const assets = pgTable("assets", {
id: uuid("id").defaultRandom().primaryKey(),
status: varchar("status", { enum: ["AVAILABLE", "RENTED", ...] }).notNull(),
// ...
});
src/actions/order-actions.ts (WeGuard Engine)
청구 방어 로직이 구현되는 곳입니다. 클라이언트가 데이터를 조작할 수 없도록 Server Side에서만 실행됩니다.
code
TypeScript
"use server"; // Next.js Server Action 지시어

import { db } from "@/db";
import { orderSchema } from "@/lib/validations/order-schema";

export async function createOrder(data: unknown) {
// 1. Zod 검증
const parsed = orderSchema.parse(data);

// 2. WeGuard 로직 (한도 체크, 내구연한 체크)
const validation = await validateOrder(parsed);
if (!validation.ok) {
return { success: false, error: validation.message };
}

// 3. DB 트랜잭션 (주문 생성 + 재고 차감)
await db.transaction(async (tx) => {
// ... insert logic
});

return { success: true };
} 4. 파일 명명 규칙 (Naming Conventions)
Directories: kebab-case (예: user-profile, inventory)
Components: PascalCase (예: OrderForm.tsx, Sidebar.tsx)
단, Next.js App Router 파일은 소문자 필수 (page.tsx, layout.tsx)
Utility/Lib Files: camelCase (예: formatDate.ts, dbConfig.ts)
Server Actions: kebab-case + -actions.ts (예: order-actions.ts)
