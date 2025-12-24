🛠️ WeOps V1.0 MPD (Master Product Document)
프로젝트명	WeOps (위옵스)
정의	대한민국 복지용구 사업소를 위한 통합 운영 OS (Operating System)
핵심 가치	"빈틈없는 재고, 삭감 없는 청구"
기술 스택	Next.js 16, Clerk, Neon(Postgres), Vercel Blob Storage, Shadcn/ui
1. 시스템 구조 (System Architecture)
WeOps는 크게 3가지 핵심 모듈로 구성됩니다.
🔹 Module 1: WeStock (스마트 자산/재고 관리)
목표: 단순 수량 관리가 아닌, '개별 자산의 생애주기' 추적.
기능 명세:
QR Lifecycle: 제품 입고 시 고유 QR 부착 -> 대여 출고 -> 회수(소독대기) -> 소독완료 -> 재입고 과정을 모바일로 스캔하여 처리.
Location Tracking: "지금 전동침대(WS-01)가 홍길동 어르신 댁(좌표)에 있다"는 것을 지도상에 표시.
자산 감가상각: 대여 횟수와 수리 이력을 기록해 폐기 시점을 자동 추천.
🔹 Module 2: WeGuard (청구 방어 및 주문)
목표: 공단 전산 입력 전, **'가상의 심사관'**이 오류를 사전 차단.
기능 명세:
Real-time Limit Check: 주문 담기 버튼을 누르는 순간, (연간한도 160만 원 - 기사용액)을 계산해 초과 시 Blocking(주문 불가) 처리.
내구연한 필터: "이 어르신은 6개월 전에 욕창예방매트리스를 구매하셨습니다(내구연한 3년 남음)" 경고 팝업.
본인부담금 계산기: 감경율(15%, 9%, 6%, 기초)에 따른 10원 단위 절사 자동 계산.
🔹 Module 3: WePaper (행정 자동화)
목표: 반복되는 서류 작업 시간 90% 단축.
기능 명세:
원클릭 서류 생성: DB에 저장된 계약 정보를 바탕으로 복지용구 공급계약서, 본인부담금 수납대장 PDF 자동 생성 및 인쇄.
2. 데이터베이스 스키마 (Neon DB Schema)
code
SQL
-- 1. 사업소 (Tenant) : WeOps의 고객
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk 조직 ID
  name VARCHAR(100), -- 사업소명 (예: 위옵스 케어)
  biz_number VARCHAR(20) -- 사업자번호
);

-- 2. 수급자 (Recipients) : 어르신
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(50) NOT NULL,
  ltc_number VARCHAR(20) NOT NULL, -- L번호
  copay_rate DECIMAL(3, 1) NOT NULL, -- 본인부담율
  limit_balance INT DEFAULT 1600000, -- 잔여 한도액
  expiry_date DATE -- 인정 유효기간
);

-- 3. 자산 (Assets) : WeStock의 핵심
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  product_code VARCHAR(20), -- 공단 코드
  serial_number VARCHAR(100), -- 시리얼 번호
  qr_code VARCHAR(255) UNIQUE,
  status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'RENTED', 'SANITIZING', 'DISCARDED')),
  current_recipient_id UUID REFERENCES recipients(id) -- 현재 위치
);

-- 4. 주문/청구 (Orders) : WeGuard의 핵심
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  recipient_id UUID REFERENCES recipients(id),
  total_amt INT, -- 총액
  copay_amt INT, -- 본인부담금
  claim_amt INT, -- 공단청구액
  is_verified BOOLEAN DEFAULT TRUE -- WeGuard 검증 통과 여부