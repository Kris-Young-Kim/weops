# 📋 WeOps 개발 TODO 리스트

**프로젝트**: WeOps (위옵스)  
**버전**: 1.0  
**최종 업데이트**: 2025-01-21  
**상태**: 개발 준비 완료 → Sprint 1 시작

---

## ✅ 완료된 작업

### 문서 및 기획

- [x] 모든 개발 문서에서 Supabase → Neon 전환 반영
- [x] Neon 사용 가이드 작성 (`docs/NEON_GUIDE.md`)
- [x] Supabase → Neon 마이그레이션 가이드 작성 (`docs/MIGRATION_SUPABASE_TO_NEON.md`)
- [x] 프로젝트 구조 문서화 (`docs/DIR.md`)
- [x] ERD 및 시스템 아키텍처 다이어그램 작성 (`docs/Mermaid.md`)
- [x] PRD, MRD, MPD 문서 작성
- [x] 비개발자용 데이터 관리 가이드 작성

### 기술 스택 결정

- [x] Next.js 16 (App Router) 결정
- [x] Neon (Serverless PostgreSQL) 결정
- [x] Clerk (인증) 결정
- [x] Drizzle ORM 결정
- [x] shadcn/ui + Tailwind CSS 결정

---

## 🚀 Sprint 1: 프로젝트 세팅 & 인증 (W1)

### 프로젝트 초기 설정

- [x] Next.js 16 프로젝트 생성 및 기본 설정
- [x] TypeScript 설정 (`tsconfig.json`)
- [x] ESLint 설정 (`eslint.config.mjs`)
- [x] Prettier 설정 (`.prettierrc`, `.prettierignore`)
- [x] `.gitignore` 파일 설정
- [x] `.cursorignore` 파일 설정
- [x] `package.json` 스크립트 설정

### 환경 변수 설정

- [x] `.env.local` 파일 생성 (템플릿 제공)
- [x] Neon `DATABASE_URL` 설정 ✅ **완료: .env.local에 설정됨**
- [x] Neon `DATABASE_POOL_URL` 설정 (프로덕션용, 가이드 문서화)
- [x] Clerk 인증 키 설정 ✅ **완료: .env.local에 설정됨**
- [x] `.env.example` 파일 생성
- [x] 환경 변수 설정 가이드 문서 작성 (`docs/ENV_SETUP.md`)

### 데이터베이스 설정 (Neon + Drizzle)

- [x] Neon 프로젝트 생성 및 연결 확인 ✅ **완료: .env.local에 DATABASE_URL 설정됨**
- [x] Drizzle ORM 패키지 설치 (`drizzle-orm`, `drizzle-kit`, `postgres`)
- [x] `drizzle.config.ts` 파일 생성
- [x] `src/db/index.ts` - DB 연결 설정 (Connection Pooling 포함)
- [x] `src/db/schema.ts` - 데이터베이스 스키마 정의
  - [x] `organizations` 테이블
  - [x] `users` 테이블 (clerk_user_id 포함)
  - [x] `recipients` 테이블
  - [x] `products` 테이블
  - [x] `assets` 테이블
  - [x] `orders` 테이블
  - [x] `order_items` 테이블
- [x] 초기 마이그레이션 생성 및 적용 (`pnpm db:push` 완료 - 스키마 동기화됨) ✅ **완료: 모든 테이블 생성 완료**
- [x] 인덱스 생성 (성능 최적화) - 스키마에 이미 정의됨
- [x] 데이터베이스 관리 가이드 문서 작성 ✅ **완료: `docs/WeOps-데이터베이스-관리-가이드.md` 생성**
  - [x] 절대 수정 금지 테이블 정의
  - [x] 제한적 수정 가능 테이블 정의 (products)
  - [x] 운영자 체크리스트 작성
  - [x] 정규화 원칙 적용 확인 (배열 데이터 없음, 1:N 관계 명시적 관리)
  - [x] 참고 문서 링크 추가

### 인증 및 멀티테넌시 (Clerk)

- [x] Clerk 프로젝트 생성 및 설정 ✅ **완료: .env.local에 API 키 설정됨**
- [x] Clerk Provider 설정 (`app/layout.tsx`) ✅ **완료**
- [x] 인증 페이지 생성 ✅ **완료**
  - [x] `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
  - [x] `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
  - [x] `app/(auth)/layout.tsx`
- [x] Clerk 미들웨어 설정 (`proxy.ts`) ✅ **완료**
- [x] 사용자 동기화 로직 구현 ✅ **완료**
  - [x] `hooks/use-sync-user.ts` - Clerk → Neon 사용자 동기화 훅
  - [x] `components/providers/sync-user-provider.tsx` - 자동 동기화 프로바이더
  - [x] `app/api/sync-user/route.ts` - 동기화 API 라우트
- [x] `lib/utils/get-user-org.ts` - clerk_user_id로 org_id 조회 유틸리티 함수 ✅ **완료**
- [x] Organization(사업소) 격리 로직 구현 ✅ **완료**
  - [x] `actions/auth.ts` - `requireOrgId()` 함수 구현
  - [x] 모든 Server Actions에 org_id 필터링 적용
    - [x] `actions/recipients.ts` ✅
    - [x] `actions/orders.ts` ✅
    - [x] `actions/assets.ts` ✅
    - [x] `actions/stats.ts` ✅
  - [x] `lib/utils/org-isolation.ts` - 추가 헬퍼 함수 생성
  - [x] Organization 격리 로직 가이드 문서 작성 (`docs/ORGANIZATION-ISOLATION-GUIDE.md`)

### 기본 레이아웃

- [ ] Root Layout (`app/layout.tsx`)
  - [ ] Pretendard 폰트 설정
  - [ ] ClerkProvider 설정
  - [ ] SyncUserProvider 설정
  - [ ] 전역 스타일 (`app/globals.css`)
- [ ] Dashboard Layout (`app/(dashboard)/layout.tsx`)
  - [ ] Sidebar 컴포넌트 (`src/components/layout/sidebar.tsx`)
  - [ ] Header 컴포넌트 (`src/components/layout/header.tsx`)
  - [ ] Mobile Nav 컴포넌트 (`src/components/layout/mobile-nav.tsx`)
- [ ] 404 페이지 (`app/not-found.tsx`)

### 수급자 관리 (Recipients) - 기본 CRUD

- [ ] 수급자 목록 페이지 (`app/(dashboard)/recipients/page.tsx`)
- [ ] 수급자 상세 페이지 (`app/(dashboard)/recipients/[id]/page.tsx`)
- [ ] 수급자 등록/수정 폼 컴포넌트
- [ ] Server Actions 구현 (`src/actions/recipient-actions.ts`)
  - [ ] `createRecipient` - 수급자 등록
  - [ ] `updateRecipient` - 수급자 정보 수정
  - [ ] `deleteRecipient` - 수급자 삭제 (soft delete 권장)
  - [ ] `getRecipients` - 수급자 목록 조회 (org_id 필터링)
  - [ ] `getRecipientById` - 수급자 상세 조회
- [ ] Zod 스키마 정의 (`src/lib/validations/recipient-schema.ts`)
- [ ] 잔여 한도 계산 로직 검증

### 공통 컴포넌트 (shadcn/ui)

- [ ] shadcn/ui 초기 설정 (`components.json`)
- [ ] 기본 UI 컴포넌트 설치
  - [ ] Button
  - [ ] Card
  - [ ] Input
  - [ ] Form
  - [ ] Table (Data Table)
  - [ ] Dialog
  - [ ] Toast
  - [ ] Select
  - [ ] Label

---

## 📦 Sprint 2: WeStock 모듈 (W2)

### 제품 마스터 관리

- [ ] 제품 목록 페이지 (`app/(dashboard)/products/page.tsx`)
- [ ] 제품 등록/수정 폼
- [ ] Server Actions (`src/actions/product-actions.ts`)
  - [ ] `createProduct` - 제품 등록
  - [ ] `updateProduct` - 제품 정보 수정
  - [ ] `getProducts` - 제품 목록 조회
- [ ] Zod 스키마 (`src/lib/validations/product-schema.ts`)

### 자산(Asset) 관리 (WeStock 핵심)

- [ ] 자산 목록 페이지 (`app/(dashboard)/inventory/page.tsx`)
- [ ] 자산 상세 페이지 (`app/(dashboard)/inventory/[id]/page.tsx`)
- [ ] 자산 등록 폼
  - [ ] 제품 선택
  - [ ] 시리얼 넘버 입력
  - [ ] QR 코드 자동 생성
- [ ] QR 코드 생성 로직 (`src/lib/utils/qr-generator.ts`)
- [ ] QR 코드 인쇄 페이지 (`app/(dashboard)/inventory/qr/page.tsx`)
- [ ] Server Actions (`src/actions/inventory-actions.ts`)
  - [ ] `createAsset` - 자산 등록
  - [ ] `updateAssetStatus` - 자산 상태 변경 (FSM)
  - [ ] `getAssets` - 자산 목록 조회
  - [ ] `getAssetByQrCode` - QR 코드로 자산 조회

### 자산 상태 머신 (FSM)

- [ ] 상태 전이 로직 구현
  - [ ] AVAILABLE → RENTED (대여 출고)
  - [ ] RENTED → RETURNING (반납 요청)
  - [ ] RETURNING → SANITIZING (입고 및 소독 시작)
  - [ ] SANITIZING → AVAILABLE (소독 완료)
  - [ ] 상태 전이 검증 (SANITIZING에서 RENTED로 직접 변경 불가)
- [ ] 소독 일지 작성 기능
  - [ ] 소독 일지 폼
  - [ ] `last_sanitized_at` 업데이트

### 모바일 QR 스캐너

- [ ] QR 스캐너 컴포넌트 (`src/components/features/inventory/qr-scanner.tsx`)
- [ ] 카메라 권한 요청 처리
- [ ] QR 코드 스캔 후 자산 정보 표시
- [ ] 상태 변경 팝업 (스캔 성공 시)
- [ ] 햅틱 피드백 (모바일)

### 위치 추적 (Google Maps)

- [ ] Google Maps API 설정
- [ ] 지도 컴포넌트 (`src/components/features/dashboard/map-view.tsx`)
- [ ] 자산 위치 표시 (현재 수급자 위치)
- [ ] 위치 업데이트 로직 (주문 시 자동 업데이트)

---

## 🛡️ Sprint 3: WeGuard 모듈 (W3) - 핵심 기능

### 주문 관리 기본

- [ ] 주문 목록 페이지 (`app/(dashboard)/orders/page.tsx`)
- [ ] 주문 상세 페이지 (`app/(dashboard)/orders/[id]/page.tsx`)
- [ ] 신규 주문 입력 페이지 (`app/(dashboard)/orders/new/page.tsx`)

### WeGuard 엔진 구현

- [ ] 주문 입력 폼 컴포넌트 (`src/components/features/orders/order-form.tsx`)
  - [ ] 수급자 선택
  - [ ] 상품 검색 및 선택
  - [ ] 장바구니
  - [ ] 실시간 금액 계산기
- [ ] Server Actions (`src/actions/order-actions.ts`)
  - [ ] `validateOrder` - 주문 검증 (WeGuard 로직)
    - [ ] 연간 한도액 체크
    - [ ] 내구연한 체크
    - [ ] 본인부담금 계산 (10원 절사)
  - [ ] `createOrder` - 주문 생성 (트랜잭션)
    - [ ] 주문 생성
    - [ ] 주문 상세 생성
    - [ ] 자산 상태 변경 (대여 시)
    - [ ] 수급자 한도 차감
- [ ] Zod 스키마 (`src/lib/validations/order-schema.ts`)

### 한도 체크 로직

- [ ] 잔여 한도 계산 함수 (`src/lib/utils/limit-calculator.ts`)
  - [ ] Formula: 1,600,000원 - (금년도 기 청구액 합계)
  - [ ] 실시간 계산 (200ms 이내)
- [ ] 한도 초과 시 UI 차단
  - [ ] Save 버튼 비활성화
  - [ ] Toast 에러 메시지
  - [ ] 잔여 한도 그래프 표시 (`src/components/features/recipients/limit-chart.tsx`)

### 내구연한 체크 로직

- [ ] 내구연한 테이블 정의 (`src/lib/constants/durability.ts`)
- [ ] 과거 구매 이력 조회
- [ ] 내구연한 내 재구매 차단 로직
- [ ] 경고 메시지 표시

### 본인부담금 계산

- [ ] 본인부담금 계산 함수 (`src/lib/utils/copay-calculator.ts`)
  - [ ] Formula: `Math.floor((제품가 * 본인부담율) / 10) * 10`
  - [ ] 감경율별 계산 (15%, 9%, 6%, 0%)
- [ ] 실시간 계산기 UI (`src/components/features/orders/cart-summary.tsx`)
  - [ ] 총액 표시
  - [ ] 본인부담금 표시
  - [ ] 공단 청구액 표시

### 장바구니 기능

- [ ] 장바구니 상태 관리
- [ ] 상품 추가/제거
- [ ] 수량 조정
- [ ] 실시간 총액 계산

---

## 📄 Sprint 4: WePaper 모듈 & UI 폴리싱 (W4)

### PDF 생성 기능

- [ ] PDF 생성 라이브러리 설정 (`@react-pdf/renderer` 또는 `puppeteer`)
- [ ] PDF 템플릿 컴포넌트
  - [ ] 복지용구 공급계약서
  - [ ] 본인부담금 수납대장
  - [ ] 급여제공기록지
- [ ] PDF 생성 API (`app/api/pdf/route.ts`)
- [ ] PDF 다운로드 기능

### 전자 서명

- [ ] 서명 캔버스 컴포넌트 (`src/components/features/orders/signature-canvas.tsx`)
- [ ] 서명 이미지 저장
- [ ] PDF에 서명 합성

### 대시보드 개선

- [ ] 대시보드 메인 페이지 (`app/(dashboard)/page.tsx`)
- [ ] 통계 카드 컴포넌트 (`src/components/features/dashboard/stats-card.tsx`)
  - [ ] 오늘의 할 일 (반납 예정, 계약 만료 임박)
  - [ ] 월간 청구액
  - [ ] 재고 현황
- [ ] 지도 뷰 통합

### 모바일 최적화

- [ ] 반응형 디자인 적용
- [ ] 모바일 네비게이션 개선
- [ ] 터치 제스처 최적화
- [ ] PWA 설정 (`app/manifest.ts`)

### UI/UX 개선

- [ ] 로딩 상태 처리
- [ ] 에러 처리 및 사용자 친화적 메시지
- [ ] 성공 피드백 (Toast)
- [ ] 접근성 개선 (a11y)

---

## 🔧 인프라 및 배포

### 개발 환경

- [ ] `.cursor/` 디렉토리 설정
  - [ ] `rules/` 커서 룰 파일들
  - [ ] `mcp.json` MCP 서버 설정 (선택)
- [ ] `.github/` 디렉토리 설정
  - [ ] GitHub Actions 워크플로우 (CI/CD)
  - [ ] Issue 템플릿
  - [ ] Pull Request 템플릿
- [ ] `.husky/` 디렉토리 설정 (Git Hooks)

### 프로덕션 준비

- [ ] Vercel 프로젝트 설정
- [ ] 환경 변수 설정 (Vercel Dashboard)
- [ ] Neon Connection Pooling 활성화
- [ ] 도메인 설정
- [ ] SSL 인증서 확인

### 모니터링 및 로깅

- [ ] 에러 로깅 설정 (Sentry 등)
- [ ] 성능 모니터링
- [ ] 사용자 분석 (선택)

---

## 📝 문서화

### 개발 문서

- [ ] API 문서 작성
- [ ] 컴포넌트 문서 작성
- [ ] 데이터베이스 스키마 문서 업데이트

### 사용자 문서

- [ ] 사용자 매뉴얼 작성
- [ ] 비디오 튜토리얼 (선택)

---

## 🎨 디자인 에셋

### 공통 에셋

- [ ] `public/favicon.ico` 파일
- [ ] `public/logo.png` 파일
- [ ] `public/og-image.png` 파일
- [ ] `public/icons/` 디렉토리 (PWA 아이콘)

### 브랜딩

- [ ] 로고 디자인 (BI_LOGO.md 참조)
- [ ] 컬러 팔레트 적용 (Blue-600, Teal-600, Rose-600)

---

## 🔐 보안 및 성능

### 보안

- [ ] RLS (Row Level Security) 정책 검토 (개발 마무리 단계)
- [ ] 데이터 암호화 (개인정보)
- [ ] HTTPS 강제
- [ ] CORS 설정

### 성능 최적화

- [ ] 데이터베이스 인덱스 최적화
- [ ] 쿼리 최적화 (N+1 문제 해결)
- [ ] 이미지 최적화
- [ ] 코드 스플리팅

---

## 📊 향후 확장 기능 (Post-MVP)

### Phase 2

- [ ] 알림톡 연동 (Kakao)
- [ ] 배치 작업 (n8n 또는 Cron)
  - [ ] 반납 예정 알림
  - [ ] 내구연한 만료 체크
- [ ] 엑셀 다운로드 기능
- [ ] 통계 대시보드 고도화

### Phase 3

- [ ] 건강보험공단 API 연동
- [ ] 프랜차이즈 전용 대시보드
- [ ] 다국어 지원 (선택)

---

## 📌 참고 문서

- [PRD](./PRD.md) - 제품 요구사항 문서
- [MVP기획서](./MVP기획서.md) - MVP 우선순위 및 구현 전략
- [DIR.md](./DIR.md) - 프로젝트 디렉토리 구조
- [NEON_GUIDE.md](./NEON_GUIDE.md) - Neon 데이터베이스 사용 가이드
- [Mermaid.md](./Mermaid.md) - ERD 및 시스템 아키텍처
- [TRD.md](./TRD.md) - 기술 요구사항 문서
- [WeOps-데이터베이스-관리-가이드.md](./WeOps-데이터베이스-관리-가이드.md) - 데이터베이스 관리 원칙 및 운영 가이드
- [ORGANIZATION-ISOLATION-GUIDE.md](./ORGANIZATION-ISOLATION-GUIDE.md) - Organization(사업소) 격리 로직 구현 가이드

---

**마지막 업데이트**: 2025-01-21  
**다음 리뷰**: Sprint 1 완료 후
