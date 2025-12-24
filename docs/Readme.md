📘 WeOps (위옵스) - 복지용구 운영의 표준
![alt text](https://img.shields.io/badge/Status-Development-blue)
![alt text](https://img.shields.io/badge/Next.js-16.0-black)
![alt text](https://img.shields.io/badge/DB-Neon_Postgres-green)
![alt text](https://img.shields.io/badge/Auth-Clerk-purple)
"빈틈없는 재고, 삭감 없는 청구"
대한민국 2,173개 복지용구 사업소를 위한 차세대 운영체제(OS).
16년 차 보조공학 전문가의 노하우와 Next.js 16의 기술력을 결합했습니다.
🧐 About Project
WeOps는 복지용구 사업소의 고질적인 문제인 **'재고 손실'**과 '부당 청구 환수' 공포를 해결하기 위해 탄생한 Vertical SaaS입니다.
기존 요양원 중심의 무거운 ERP나 수기(Excel) 관리의 한계를 넘어, **물류(Logistics)**와 **규제 준수(Compliance)**에 최적화된 워크플로우를 제공합니다.
💡 핵심 해결 과제 (Pain Points Solved)
Audit Defense: 복잡한 공단 급여 기준(내구연한, 한도액)을 실시간으로 검증하여 청구 오류 원천 차단.
Asset Lifecycle: QR 코드를 통한 입고-대여-회수-소독-폐기의 전 과정 추적.
Paperless: 계약서, 본인부담금 수납대장 등 행정 서류 원클릭 자동 생성.
🚀 Key Features (Modules)

1. 🛡️ WeGuard (Smart Billing Engine)
   "입력은 자유롭게, 검증은 깐깐하게"
   실시간 한도 체크: 주문 즉시 수급자의 연간 잔여 한도액 계산 및 초과 시 주문 차단.
   내구연한 필터: 중복 구매 및 금지 품목 자동 필터링.
   자동 계산기: 본인부담율(15%, 9%, 6%, 0%)에 따른 10원 단위 절사 금액 자동 산출.
2. 📦 WeStock (QR Inventory System)
   "어르신 댁에 있는 침대까지 추적합니다"
   QR Lifecycle: 모바일 스캔으로 상태 변경 (대여중 → 회수대기 → 소독중 → 대여가능).
   소독 강제화: 소독 일지가 작성되지 않은 제품은 대여 불가 처리 (법적 리스크 제거).
   Location View: Google Maps 연동 실시간 자산 위치 관제.
3. 📄 WePaper (Admin Automation)
   전자서명 기반 모바일 계약 체결.
   공단 표준 양식(hwp, pdf) 자동 생성 및 출력.
   🛠 Tech Stack
   Performance, Security, and Scalability를 최우선으로 선정했습니다.
   Category Technology Reason
   Framework Next.js 16 (App Router) Server Actions, PPR을 통한 최상의 성능과 DX.
   Language TypeScript 5.5 엄격한 타입 안정성 보장.
   Database Neon (Serverless Postgres) Branching 및 Time Travel 기능을 활용한 안전한 마이그레이션.
   ORM Drizzle ORM 가볍고 SQL 친화적인 Type-safe ORM.
   Auth Clerk B2B Multi-tenancy(조직 격리) 완벽 지원.
   UI shadcn/ui + Tailwind 상용 ERP 수준의 깔끔하고 전문적인 디자인.
   Infra Vercel Edge Network 배포.
   📊 System Architecture
   상세한 구조는 Mermaid.md 및 TRD를 참조하세요.
   WeOps는 Serverless Architecture를 기반으로 설계되었습니다.
   code
   Mermaid
   flowchart LR
   User[Client] --> Clerk[Auth Middleware]
   Clerk --> Next[Next.js Server Actions]
   Next --> WeGuard[WeGuard Logic]
   WeGuard --> DB[(Neon Postgres)]
   💻 Getting Started
   이 프로젝트는 pnpm을 패키지 매니저로 사용합니다.
4. Prerequisites
   Node.js 20.0.0 이상
   pnpm 설치 (npm i -g pnpm)
5. Installation
   code
   Bash

# 리포지토리 클론

git clone https://github.com/your-org/weops-platform.git
cd weops-platform

# 의존성 설치

pnpm install 3. Environment Setup (.env.local)
루트 경로에 .env.local 파일을 생성하고 다음 키를 입력하세요.
code
Env

# Database (Neon)

DATABASE_URL="postgresql://user:pass@ep-xyz.aws.neon.tech/weops?sslmode=require"

# Auth (Clerk)

NEXT*PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test*..."
CLERK*SECRET_KEY="sk_test*..."

# App Config

NEXT_PUBLIC_APP_URL="http://localhost:3000" 4. Database Push
Drizzle ORM을 사용하여 스키마를 Neon DB에 반영합니다.
code
Bash
pnpm db:push 5. Run Development Server
code
Bash
pnpm dev
브라우저에서 http://localhost:3000으로 접속합니다.
📂 Project Structure
Next.js 16 Feature-based Architecture를 따릅니다. 상세 내용은 DIR.md 참조.
code
Bash
src/
├── actions/ # Server Actions (Backend Logic)
├── app/ # Pages & Routes
├── components/ # UI Components
│ ├── features/ # Business Logic Components (WeGuard, WeStock)
│ └── ui/ # Shadcn Base Components
├── db/ # Schema & Config
└── lib/ # Utils & Validations
📅 Roadmap
Phase 1 (MVP): 핵심 기능(재고, 청구 방어) 구현 및 Beta Test (Current)
Phase 2 (Advance): 모바일 PWA 배포, 알림톡(Kakao) 연동
Phase 3 (Scale): 건강보험공단 API 공식 연동, 프랜차이즈 전용 대시보드
🤝 Contributing
WeOps는 현재 Closed Beta 단계입니다.
기여를 원하시거나 버그를 발견하시면 Issues에 등록해 주세요.
📜 License
Copyright © 2025 WeOps Team. All rights reserved.
Proprietary Software. Unauthorized copying is strictly prohibited.
👨‍💼 Message from the PM
"현장의 답답함을 누구보다 잘 알기에 만들었습니다.
개발자에게는 최고의 기술적 도전을, 사업소장님께는 저녁이 있는 삶을 선물하겠습니다."

- 16년 차 보조공학사 & Team Leader 드림
