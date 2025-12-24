📝 WeOps PRD (Product Requirements Document)
프로젝트명 WeOps (위옵스) 버전 V1.0 (Detailed)
작성일 2025년 12월 24일 상태 개발 착수 승인용
작성자 PM (보조공학 팀장) 플랫폼 Web (Desktop/Mobile Hybrid)

1. 개요 (Product Overview)
   목적: 복지용구 사업소의 2대 리스크인 **'재고 손실'**과 **'부당 청구(환수)'**를 기술적으로 원천 차단하는 SaaS 구축.
   핵심 가치:
   WeStock: QR 기반의 실물 자산 생애주기 추적.
   WeGuard: 공단 기준(고시)에 의거한 실시간 청구 유효성 검증.
   타겟 디바이스:
   PC (Admin): 관리자용 대시보드, 대량 데이터 처리.
   Mobile (Field): 현장 배송/회수, QR 스캔, 전자서명.
2. 사용자 스토리 (User Stories)
   액터 (Actor) 상황 (Scenario) 요구사항 (Needs) 기대 효과 (Benefit)
   관리 책임자 월말 청구 마감 시 수급자 100명의 급여 계산을 1초 만에 끝내고 싶다. 야근 제로, 계산 실수 제로.
   배송 기사 어르신 댁 방문 시 스마트폰으로 제품 QR을 찍어 바로 '대여 시작' 처리를 하고 싶다. 수기 장부 작성 불필요, 실시간 재고 반영.
   상담 실장 전화 주문 상담 시 고객 이름만 치면 "한도 초과입니다"라고 시스템이 알려주길 원한다. 상담 즉시 불가 안내 가능 (추후 민원 방지).
3. 상세 기능 명세 (Functional Requirements)
   3.1 모듈 1: 인증 및 조직 관리 (Auth & Multi-tenancy)
   FR-1.1: Clerk을 사용하여 이메일/소셜 로그인 지원.
   FR-1.2: Organization(사업소) 격리. 사용자는 로그인 시 소속된 사업소(Tenant)의 데이터만 조회/수정 가능. (RLS: Row Level Security 적용)
   FR-1.3: 권한 분리. Owner(모든 권한), Staff(주문/재고 관리), Driver(배송/QR 스캔만 가능).
   3.2 모듈 2: WeStock (스마트 자산 관리)
   FR-2.1 제품 마스터 관리: 공단 고시 코드(예: WS-1234), 품명, 고시가, 대여/구매 구분 데이터 관리.
   FR-2.2 자산(Asset) 등록: 동일 제품이라도 개별 시리얼 넘버와 고유 QR 코드를 부여하여 개별 관리.
   Input: 제품 선택, 시리얼 넘버 입력.
   Output: QR 코드 라벨 이미지 생성 (프린터 출력용).
   FR-2.3 생애주기 상태 머신 (FSM):
   상태값: AVAILABLE(창고) ↔ RENTED(대여중) → RETURNING(회수대기) → SANITIZING(소독중) → AVAILABLE
   Logic: SANITIZING 상태에서는 절대로 RENTED로 변경 불가 (소독 일지 작성 필수).
   FR-2.4 모바일 스캔: 모바일 웹에서 카메라로 QR 스캔 시, 해당 자산의 상태 변경 팝업 노출.
   3.3 모듈 3: WeGuard (청구 방어 엔진) - 핵심(Key Feature)
   FR-3.1 수급자 DB 구축: 성명, L번호, 등급, 인정 유효기간, 감경율(0/6/9/15%) 필수 저장.
   FR-3.2 연간 한도액 실시간 계산:
   Formula: 1,600,000원 - (금년도 기 청구액 합계) = 잔여 한도.
   Validation: 주문 금액 > 잔여 한도 시, Save 버튼 비활성화 및 Toast 에러 메시지 출력.
   FR-3.3 내구연한 체크 로직:
   제품 카테고리별 내구연한(예: 욕창매트 3년) DB화.
   주문 시 해당 수급자의 과거 구매 이력을 조회.
   Logic: (현재 날짜 - 마지막 구매일) < 내구연한 이면 구매 차단.
   FR-3.4 본인부담금 자동 산출:
   Formula: Math.floor((제품가 _ 본인부담율) / 10) _ 10 (10원 미만 절사 규정 준수).
   3.4 모듈 4: WePaper (행정 자동화)
   FR-4.1 서류 생성: 주문(Contract) 데이터 기반 PDF 생성.
   대상: 복지용구 공급계약서, 본인부담금 수납대장, 급여제공기록지.
   FR-4.2 전자 서명: 모바일 화면(Canvas)에 수급자 서명 입력 → 이미지로 저장 → 계약서 PDF에 합성.
4. 데이터 요구사항 (Data Logic & Schema)
   Neon(Postgres)에서 구현할 핵심 엔티티 관계도(ERD) 로직입니다.
   Organizations (1) : Users (N) - 하나의 사업소에 여러 직원이 있음.
   Organizations (1) : Recipients (N) - 사업소별 고객 명단.
   Products (1) : Assets (N) - '전동침대 WS-8830' 모델(1)에 실물 침대(N)가 존재.
   Recipients (1) : Orders (N) - 한 명의 어르신이 여러 번 주문.
   Orders (1) : OrderItems (N) : Assets (1) - 주문서 안에 구체적으로 '어떤 시리얼 넘버의 침대'가 나갔는지 매핑.
5. UI/UX 요구사항 (Design Guidelines)
   5.1 공통 가이드 (Look & Feel)
   Design System: shadcn/ui 컴포넌트 라이브러리 사용.
   Color Theme:
   Primary: Blue-600 (신뢰)
   Success: Teal-600 (검증 통과, 재고 충분)
   Destructive: Rose-600 (한도 초과, 내구연한 위반)
   Font: Pretendard (가독성 최적화).
   5.2 주요 화면 구성
   대시보드: 오늘의 할 일(반납 예정, 계약 만료 임박)을 '카드' 형태로 최상단 배치.
   주문 입력창 (The Guard):
   좌측: 수급자 정보 & 잔여 한도 그래프.
   우측: 상품 검색 & 장바구니.
   하단: 실시간 금액 계산기 (공단부담금 / 본인부담금).
   모바일 스캐너: 카메라 뷰파인더 중앙 배치, 스캔 성공 시 햅틱 피드백.
6. 기술적 제약사항 및 비기능 요구사항 (Non-Functional)
   NFR-1 (성능): 수급자 검색 및 한도 계산은 200ms 이내에 완료되어야 함 (Next.js Server Actions 최적화).
   NFR-2 (보안): 어르신 개인정보(L번호, 주소)는 DB 저장 시 암호화 권장. HTTPS 필수.
   NFR-3 (데이터 무결성): 주문 생성 시 트랜잭션(Transaction) 처리 필수. (재고 차감과 주문 생성이 동시에 이루어져야 함).
   NFR-4 (확장성): 추후 건강보험공단 API 연동을 고려하여 데이터 필드명을 공단 표준 용어와 일치시킬 것.
7. 개발 로드맵 (Sprint Plan)
   Sprint 1 (W1): 프로젝트 세팅, DB 설계, Auth(로그인), 수급자 CRUD.
   Sprint 2 (W2): 제품/자산 관리(WeStock), QR 생성 로직.
   Sprint 3 (W3): 주문 및 청구 방어 로직(WeGuard) 구현 - 가장 중요.
   Sprint 4 (W4): UI 폴리싱, 모바일 뷰 최적화, PDF 생성 기능.
