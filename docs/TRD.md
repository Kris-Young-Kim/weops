⚙️ WeOps TRD (Technical Requirements Document)
프로젝트명 WeOps (위옵스) 기술 스택 Next.js 16, Neon, Clerk, Shadcn
버전 V1.0 (Architecture Freeze) 작성일 2025년 12월 24일
대상 독자 Full-stack Developers, DBA, DevOps 문서 등급 Critical

1. 시스템 아키텍처 (System Architecture)
   1.1 High-Level Architecture
   WeOps는 'Serverless First' 및 'Edge First' 전략을 채택하여 초기 인프라 비용을 최소화하고 확장성을 확보합니다.
   Frontend & BFF: Next.js 16 (App Router) - Vercel Edge Network 상에서 동작.
   Database: Neon (Serverless PostgreSQL) - 컴퓨팅과 스토리지가 분리된 아키텍처.
   Auth: Clerk - Identity Provider (IdP) 및 Multi-tenancy 관리.
   Storage: Vercel Blob Storage 또는 AWS S3 - 이미지 및 파일 저장소.
   Realtime: Server-Sent Events (SSE) 또는 WebSocket - 실시간 업데이트.
   Worker/Batch: n8n (Self-hosted or Cloud) - 정기 알림 및 스케줄링.
   1.2 Tech Stack Versions
   Framework: Next.js 16.0.0+ (React 19 RC 포함)
   Language: TypeScript 5.5+
   ORM: Drizzle ORM (Prisma 대비 Cold start 속도 우위 및 SQL 제어력 강화)
   Package Manager: pnpm (디스크 공간 효율화)
   UI Library: shadcn/ui + Tailwind CSS 4.0
2. 프론트엔드 상세 명세 (Frontend Specs)
   2.1 Next.js 16 Core Features 활용 전략
   Server Actions: API Route를 별도로 만들지 않고, 폼 제출 및 데이터 변이(Mutation)를 서버 함수로 직접 처리하여 백엔드 로직을 통합.
   PPR (Partial Prerendering):
   전략: 사이드바와 네비게이션은 정적(Static)으로 빌드.
   동적: 대시보드의 실시간 재고 현황, 주문 내역은 동적(Dynamic) 스트리밍으로 처리하여 **TTFB(Time to First Byte)**를 획기적으로 단축.
   Turbopack: 개발 환경 빌드 속도 최적화.
   2.2 상태 관리 (State Management)
   Server State: React Server Components (RSC)를 통해 DB 데이터를 직접 Fetching. 클라이언트 상태 최소화.
   Client State: 장바구니(Cart), 필터링 옵션 등 일시적 상태는 Nuqs (URL Query String 기반 상태 관리) 또는 Zustand 사용.
   2.3 모바일 최적화 (PWA)
   Manifest: next-pwa를 설정하여 현장 배송 기사들이 앱처럼 설치하여 사용.
   Camera Access: react-qr-reader를 사용하여 브라우저단에서 카메라 접근 및 QR 파싱.
3. 데이터베이스 설계 및 전략 (Database Strategy) - DBA Review 필
   20년 차 DBA 관점에서 **데이터 무결성(Integrity), 동시성 제어(Concurrency), 보안(Security)**에 중점을 둔 설계입니다.
   3.1 Naming Convention & Standards
   Tables: plural_snake_case (예: organizations, assets)
   Columns: snake_case (예: is_verified, created_at)
   Primary Keys: UUID (v7) 사용. (Time-sorted UUID로 인덱싱 성능 저하 방지 및 클러스터링 효율화)
   Currency: 금액 관련 필드는 절대 FLOAT를 쓰지 않음. INTEGER (원 단위) 또는 DECIMAL(12, 0) 사용.
   3.2 Schema Design (Core Logic)
   A. Multi-tenancy & Security (RLS)
   SaaS의 핵심은 데이터 격리입니다. 어플리케이션 레벨의 WHERE 절에만 의존하지 않고, **Row Level Security (RLS)**를 적용합니다.
   code
   SQL
   -- 조직(Tenant) 테이블
   CREATE TABLE organizations (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   clerk_org_id VARCHAR(255) NOT NULL UNIQUE,
   name VARCHAR(100) NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

-- RLS 정책 예시 (Postgres Level)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON assets
USING (org_id = current_setting('app.current_org_id')::uuid);
B. Asset Management (Concurrency Control)
동시에 여러 직원이 같은 제품을 대여하려고 할 때 Race Condition을 방지해야 합니다.
code
SQL
CREATE TABLE assets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID NOT NULL REFERENCES organizations(id),
product_code VARCHAR(50) NOT NULL, -- 인덱스 필요
qr_code VARCHAR(255) NOT NULL UNIQUE, -- 유니크 인덱스
status VARCHAR(20) NOT NULL CHECK (status IN ('AVAILABLE', 'RENTED', 'SANITIZING', 'DISCARDED')),
version INTEGER DEFAULT 1, -- Optimistic Locking용
updated_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 전략
CREATE INDEX idx_assets_org_status ON assets(org_id, status); -- "대여 가능 목록" 조회 고속화
Locking Strategy: 재고 상태 변경 시 Optimistic Locking (version 컬럼 체크) 또는 SELECT ... FOR UPDATE 구문 사용.
C. Order & Billing (Data Integrity)
청구 데이터는 수정 불가능한 기록(Immutable Log)에 가까워야 합니다.
code
SQL
CREATE TABLE orders (
id UUID PRIMARY KEY,
org_id UUID NOT NULL,
recipient_id UUID NOT NULL REFERENCES recipients(id),
total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
copay_amount INTEGER NOT NULL CHECK (copay_amount >= 0),
claim_amount INTEGER NOT NULL GENERATED ALWAYS AS (total_amount - copay_amount) STORED, -- 계산된 컬럼 (실수 방지)
is_verified BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW()
);
3.3 Backup & PITR
Neon 기능 활용: Neon의 Time Travel 기능을 활용하여, 실수로 데이터를 삭제하거나 잘못 업데이트했을 때 특정 시점(초 단위)으로 즉시 복구 가능하도록 설정. 4. 백엔드 로직 및 API 명세 (Backend Specs)
4.1 WeGuard Engine (Validation Logic)
서버 액션(actions/order.ts) 내에서 실행될 핵심 로직입니다. Zod 스키마를 통해 런타임 유효성을 검증합니다.
code
TypeScript
// Zod Schema 예시
const OrderSchema = z.object({
recipientId: z.string().uuid(),
items: z.array(z.object({
productCode: z.string(),
price: z.number().int().positive(),
})),
}).refine(async (data) => {
// 1. DB에서 수급자 한도 조회
const limit = await getAnnualLimit(data.recipientId);
// 2. 주문 총액 계산
const total = data.items.reduce((acc, item) => acc + item.price, 0);
// 3. 검증
return total <= limit;
}, { message: "연간 한도액 초과" });
4.2 PDF Generation
Library: react-pdf/renderer 사용.
Process: 클라이언트 사이드 렌더링이 아니라, 서버에서 Stream 형태로 PDF를 생성하여 클라이언트로 전송 (보안 및 성능 목적). 5. 서드파티 연동 (Integrations)
5.1 Google Maps API
Usage: 자산 위치 시각화 (assets 테이블의 lat, lng 컬럼 활용).
Optimization: API 호출 비용 절감을 위해, 주소->좌표 변환(Geocoding)은 데이터 **'저장 시점'**에 1회만 수행하여 DB에 좌표를 캐싱함.
5.2 n8n (Automation)
Webhook: Next.js에서 특정 이벤트(예: 내구연한 도래) 발생 시 n8n Webhook 호출.
Cron: 매일 00:00에 실행되어 expiry_date가 D-7인 수급자를 찾아 알림 테이블에 Insert. 6. 개발 및 배포 파이프라인 (DevOps & CI/CD)
6.1 GitHub Strategy
Main: Production 배포 (안정화 버전).
Develop: 개발 서버 배포.
Feature Branches: feat/login, fix/billing-calc 등으로 기능 단위 개발 후 PR(Pull Request).
6.2 CI/CD Automation (GitHub Actions)
Code Quality: PR 생성 시 ESLint, Prettier 체크.
Type Check: tsc --noEmit 실행.
Deployment: Vercel 자동 배포 (Preview URL 생성).
6.3 Monitoring
Vercel Analytics: 페이지 조회수 및 사용자 흐름 추적.
Sentry: 런타임 에러(500, 404) 실시간 로깅 및 슬랙 알림 연동.
[DBA의 최종 검토 의견]
"WeOps의 DB 설계는 단순히 데이터를 담는 그릇이 아닙니다. GENERATED COLUMNS를 이용해 계산 실수를 DB 레벨에서 차단하고, UUID v7과 RLS를 도입해 성능과 보안을 모두 잡았습니다. 특히 자산 상태 관리에 FSM(Finite State Machine) 개념을 DB 제약조건(CHECK)으로 강제한 점은 데이터 오염을 막는 최고의 안전장치입니다. 이대로 구현하시면 됩니다."
