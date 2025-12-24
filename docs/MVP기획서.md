1. 🗄️ Neon Database Schema (SQL)
   Neon의 SQL Editor에 바로 복사해서 붙여넣으시면 테이블이 싹 생성되도록 짰습니다.
   가장 중요한 점은 users 테이블에 clerk_user_id를 넣어서 Clerk 인증 정보와 우리 DB를 연결하는 것입니다.
   code
   SQL
   -- 1. 조직 (Organizations): 하나의 사업소를 의미합니다.
   CREATE TABLE organizations (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name TEXT NOT NULL, -- 사업소 이름 (예: 위옵스 케어)
   biz_number TEXT, -- 사업자 번호
   created_at TIMESTAMPTZ DEFAULT NOW()
   );

-- 2. 사용자 (Users): Clerk과 연결되는 핵심 테이블
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
clerk_user_id TEXT UNIQUE NOT NULL, -- ⭐ Clerk의 user.id를 여기에 저장 (필수!)
email TEXT NOT NULL,
role TEXT DEFAULT 'STAFF' CHECK (role IN ('OWNER', 'STAFF', 'DRIVER')), -- 권한
org_id UUID REFERENCES organizations(id), -- 소속된 사업소
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 수급자 (Recipients): 어르신 정보
CREATE TABLE recipients (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID REFERENCES organizations(id) NOT NULL, -- 어느 사업소 고객인지
name TEXT NOT NULL,
ltc_number TEXT NOT NULL, -- L번호 (장기요양인정번호)
copay_rate NUMERIC(3, 1) NOT NULL, -- 본인부담율 (15, 9, 6, 0)
limit_balance INTEGER DEFAULT 1600000, -- 연간 한도 잔액 (초기 160만원)
expiry_date DATE, -- 인정 유효기간
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 제품 마스터 (Products): 공단 고시 정보 (공통 데이터)
CREATE TABLE products (
code TEXT PRIMARY KEY, -- 복지용구 코드 (예: WS-1234)
name TEXT NOT NULL,
price INTEGER NOT NULL, -- 공단 고시가
category TEXT, -- 품목명 (전동침대 등)
durability_years INTEGER DEFAULT 0 -- 내구연한 (년)
);

-- 5. 자산 (Assets): QR로 관리할 실물 제품 (WeStock 핵심)
CREATE TABLE assets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID REFERENCES organizations(id) NOT NULL,
product_code TEXT REFERENCES products(code),
serial_number TEXT, -- 제조사 시리얼
qr_code TEXT UNIQUE, -- 우리가 생성한 QR 코드 값
status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'SANITIZING', 'DISCARDED')),
current_recipient_id UUID REFERENCES recipients(id), -- 현재 누구 집에 있는지 (NULL이면 창고)
last_sanitized_at TIMESTAMPTZ, -- 마지막 소독일
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 주문 (Orders): 청구 방어 로직이 적용된 결과물
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID REFERENCES organizations(id) NOT NULL,
recipient_id UUID REFERENCES recipients(id) NOT NULL,
user_id UUID REFERENCES users(id), -- 주문을 처리한 직원
total_amount INTEGER NOT NULL, -- 총액
copay_amount INTEGER NOT NULL, -- 본인부담금 (10원 절사 적용됨)
claim_amount INTEGER NOT NULL, -- 공단 청구액
order_date DATE DEFAULT CURRENT_DATE,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 주문 상세 (Order Items): 주문에 포함된 자산들
CREATE TABLE order_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
asset_id UUID REFERENCES assets(id), -- 대여 나간 자산
product_code TEXT REFERENCES products(code), -- 판매 품목일 경우 자산 ID 대신 코드 사용
price INTEGER NOT NULL -- 당시 단가
);

-- 성능을 위한 인덱스 설정
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_assets_org_status ON assets(org_id, status);
CREATE INDEX idx_orders_recipient ON orders(recipient_id); 2. 🗺️ ERD (Entity Relationship Diagram)
팀장님께서 한눈에 이해하실 수 있도록 도식화했습니다.
**Users 테이블의 clerk_user_id**가 외부 인증 시스템(Clerk)과 우리 DB를 이어주는 다리 역할을 합니다.
code
Mermaid
erDiagram
%% 외부 인증 시스템
CLERK_AUTH {
string id PK "user_2p..."
string email
}

    %% 우리 DB (Neon)
    ORGANIZATIONS ||--|{ USERS : "has"
    ORGANIZATIONS ||--o{ RECIPIENTS : "manages"
    ORGANIZATIONS ||--o{ ASSETS : "owns"

    %% 핵심 연결 고리
    USERS {
        uuid id PK
        string clerk_user_id UK "⭐ Clerk ID와 매핑"
        uuid org_id FK
        string role "OWNER / STAFF"
    }

    RECIPIENTS ||--o{ ORDERS : "places"
    USERS ||--o{ ORDERS : "processes"

    PRODUCTS ||--o{ ASSETS : "defines"
    ASSETS ||--o{ ORDER_ITEMS : "is_rented_as"

    ORDERS ||--|{ ORDER_ITEMS : "contains"

    RECIPIENTS {
        string name
        int limit_balance "한도 잔액"
        decimal copay_rate "본인부담율"
    }

3. 🚀 Updated MVP 기획서 (Neon & Clerk Edition)
   이전 기획서에서 기술 스택을 반영하여 수정/검토한 최종본입니다.

1) 기술 스택 (Tech Stack)
   Frontend: Next.js 16 (App Router) - 웹앱 구현.
   Backend/DB: Neon (Serverless PostgreSQL) - 데이터 저장 및 마이그레이션 관리.
   Authentication: Clerk - 로그인/회원가입, 세션 관리.
   전략: 로그인 성공 시 Clerk Webhook 또는 클라이언트 로직을 통해 Neon users 테이블에 정보 동기화.
   Deploy: Vercel.
2) UX / 데이터 흐름 (User Flow)
   "로그인부터 데이터 조회까지의 흐름"
   접속: 사용자가 앱에 접속.
   인증 (Clerk): <SignIn /> 컴포넌트를 통해 로그인.
   식별: 로그인 성공 시 clerk_user_id 획득.
   권한 조회: Neon users 테이블에서 WHERE clerk_user_id = '...' 로 쿼리하여, 이 사람이 어떤 사업소(org_id) 소속인지 확인.
   데이터 격리: 이후 모든 쿼리(재고 조회, 수급자 조회)에 WHERE org_id = '내 사업소 ID'를 자동으로 붙여서 타 사업소 데이터 접근 차단.
3) MVP 우선순위 (Page Implementation)
   팀장님 말씀대로 상세 페이지부터 구현하는 전략입니다.
   1단계: 대시보드 및 기본 설정 (Dashboard)
   로그인 후 사업소 정보 표시.
   (중요) 내 사업소의 user 테이블에 내 정보가 잘 들어갔는지 확인.
   2단계: 수급자 상세 (Recipient Detail)
   수급자 등록 및 조회.
   핵심: limit_balance (잔여 한도)가 DB에 정확히 저장되고 차감되는지 테스트.
   3단계: 재고 상세 (Inventory Detail)
   assets 테이블에 데이터 입력 (Dummy Data).
   QR 코드 컬럼에 데이터가 들어가는지 확인.
   4단계: 주문 상세 (Order Detail) - ★ WeGuard 엔진
   주문 입력 시 수급자 한도 초과 여부 체크.
   Neon의 Stored Procedure 또는 Next.js Server Action에서 검증 로직 구현.
4) 점검 사항 (Checklist)
   ✅ Clerk 연동: Neon의 users 테이블에 clerk_user_id 필드를 Unique Key로 설정하였는가? (완료)
   ✅ 관계 설정: assets 테이블이 products를 참조하고, order_items가 assets를 참조하는 구조가 맞는가? (완료)
   ✅ 데이터 타입: 금액(Price)은 INTEGER, 본인부담율은 NUMERIC으로 설정하여 계산 오차를 없앴는가? (완료)
   👨‍💻 팀장의 조언 (Vibe Coding 팁)
   팀장님, 이제 코딩을 시작하실 때 Cursor나 AI에게 이렇게 명령하시면 됩니다.
   "Neon에 내가 준 SQL 스키마를 적용했어.
   이제 Next.js에서 Clerk으로 로그인한 유저의 clerk_user_id를 가져와서,
   Neon의 users 테이블과 매칭해 로그인한 유저의 org_id를 찾는 유틸리티 함수(getUserOrg)를 만들어줘."
   이 org_id를 찾는 함수가 바이브 코딩의 첫 번째 단추입니다. 이게 되어야 재고든 주문이든 불러올 수 있습니다.
