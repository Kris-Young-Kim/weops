📑 WeOps Detailed Market Requirements Document (MRD)
프로젝트명	WeOps (위옵스)	문서 등급	Confidential
버전	V2.0 (Detailed)	작성일	2025년 12월 24일
작성자	PM (보조공학 16년 차)	시장 단계	Series A 준비 단계 수준의 기획
1. Executive Summary (요약)
WeOps는 대한민국 장기요양보험 복지용구 시장의 낙후된 운영 방식을 디지털로 혁신하는 **Vertical SaaS(특화형 서비스형 소프트웨어)**입니다.
기존의 요양원 중심 ERP가 해결하지 못하는 **'복지용구 물류(Logistics)'**와 **'청구 방어(Audit Defense)'**에 집중하여, 연 매출 5억 원 이상 '헤비 유저' 사업소의 운영 리스크를 제거하고 이익률을 극대화하는 것을 목표로 합니다.
2. Market Analysis (시장 심층 분석)
2.1 거시적 환경 (Macro Trends 2025)
Super-Aged Society: 2025년 노인 인구 20% 돌파. '시설 입소'에서 **'Aging in Place(재가 요양)'**로 정부 정책 대전환. 이에 따라 가정 내 복지용구(전동침대, 휠체어 등) 수요 폭증.
Regulatory Risk (규제 위험): 건강보험공단의 재정 누수 방지 대책 강화.
현황: 단순 서류 미비나 내구연한 착오도 '부당 청구'로 간주하여, 과거 3년 치 급여 환수 및 영업 정지 처분.
Pain Point: 사업소장들은 "매출을 올리는 것"보다 **"지키는 것(환수 방어)"**에 더 큰 니즈를 느낌.
2.2 시장 규모 (TAM/SAM/SOM)
TAM (Total Addressable Market): 전국 2,173개 복지용구 사업소 전체 (시장 규모 약 6,000억 원).
SAM (Serviceable Available Market): 연 매출 3억 원 이상, 직원 2인 이상의 유효 운영 사업소 (약 800개소).
SOM (Serviceable Obtainable Market): 수도권/광역시 소재, 재고 관리의 고통이 큰 상위 20% '헤비 유저' (약 400개소, 초기 목표).
3. Customer Segments (타겟 고객 세분화)
우리는 '모든' 사업소를 노리지 않습니다. '잃을 게 많은' 상위 사업소에 집중합니다.
👤 Persona A: "성장통 겪는 김 대표" (The Scaler)
프로필: 운영 7년 차, 월 청구액 8,000만 원, 직원 5명, 배송 차량 3대.
상황: 엑셀로 버티다 한계에 봉착. 재고가 200개가 넘어가면서 어디에 뭐가 있는지 모름.
Needs: "제발 우리 창고에 있는 물건이랑 장부랑 좀 맞춰줘. 직원들이 횡령하는 건지 모르겠어."
👤 Persona B: "깐깐한 박 센터장" (The Risk Manager)
프로필: 작업치료사 출신, 규정 준수 강박 있음.
상황: 직원이 실수로 한도 초과 제품을 팔아서 삭감당한 트라우마 있음.
Needs: "신입 직원이 와서 막 눌러도 사고 안 나는 '안전장치'가 필요해."
4. Problem & Solution (문제와 해결책 - 디테일)
구분	현장의 깊은 문제 (Deep Pain)	WeOps의 기술적 해결책 (Tech Solution)
재고 (Inventory)	"자산의 상태를 모른다" <br> 단순 수량이 아님. 반납 후 '소독 대기' 상태인지, *'수리 중'*인지, *'폐기 대상'*인지 추적 불가.	QR Lifecycle Management <br> 모든 제품에 고유 QR 부착. <br> 입고→대여→반납→소독→검수→재입고 프로세스를 모바일로 강제화.
청구 (Billing)	"사람의 기억력에 의존한다" <br> "이 어르신 2년 전에 지팡이 샀던가?"를 엑셀 뒤져서 확인. 실수하면 100% 환수.	Real-time Validation Engine (WeGuard) <br> 주문 시 DB의 구매 이력을 조회하여 내구연한/한도액 위반 시 '경고'가 아니라 '입력 차단'.
운영 (Ops)	"마감이 곧 지옥이다" <br> 매월 말일, 공단 전산(롱텀케어)과 엑셀을 듀얼 모니터에 띄우고 수기 대조. 야근 필수.	Data Sync & Auto-Paperwork <br> 마감 버튼 한 번으로 급여제공기록지, 본인부담금 수납대장 PDF 일괄 생성 및 알림톡 발송.
5. Competitive Landscape (경쟁사 분석 및 승리 전략)
5.1 기존 플레이어의 약점
C사/E사 (요양원 ERP 강자): 요양원 인력 배치 기준에 맞춰져 있어, 복지용구의 핵심인 '물류/재고' 기능은 구색 맞추기 수준임.
S사 (플랫폼): 보호자와 기관 매칭(B2C)에 집중. 기관 내부의 **'백오피스 행정'**을 처리해주진 않음.
엑셀/수기: 가장 강력한 경쟁자. 유연하지만 **데이터 무결성(Integrity)**이 없음.
5.2 WeOps의 차별화 (The Moat)
Domain Expertise: 16년 차 전문가가 설계한 '현미경 심사 로직' 탑재. (개발자는 절대 모르는 예외 케이스 처리)
Tech Stack: Next.js + Neon 기반의 Serverless Architecture. 설치 불필요, 언제 어디서나 접속, 경쟁사 대비 10배 빠른 속도.
Mobile First: 책상 앞이 아니라 **'현관문 앞'**에서 QR 찍고 전자서명 받는 워크플로우.
6. Business Model & Pricing (수익 모델)
단순 월정액을 넘어, 사업소의 성장에 기여하는 파트너십 모델.
1. SaaS Subscription (구독료)
Starter: 월 5만 원 (수급자 30명 미만)
Growth: 월 15만 원 (수급자 100명 미만, 주력 상품)
Scale: 월 30만 원 (수급자 무제한, API 연동)
2. Implementation Fee (도입비)
초기 데이터 이관(엑셀 업로드) 및 QR 코드 세팅 교육비: 50만 원 (1회).
3. Upselling (부가 서비스)
알림톡 발송 건당 과금.
전용 소독 일지 및 라벨 프린터기 하드웨어 판매.
7. Go-to-Market Strategy (시장 진입 전략)
Phase 1: The "Inner Circle" (M0 ~ M3)
Target: 팀장님 네트워크 내 상위 1% 사업소 5곳.
Tactics: "돈 안 받습니다. 대신 3개월간 빡세게 써보고 욕해주세요."
Goal: WeGuard 엔진의 청구 오류 검출률 100% 달성.
Phase 2: Community Viral (M4 ~ M6)
Target: 네이버 카페 '보조공학사 모임', 밴드 '전국복지용구사업소협회'.
Tactics: "환수 예방 자가 진단 키트(무료 툴)" 배포 -> WeOps 가입 유도.
Content: "저, 16년 차 팀장입니다. 엑셀 지옥에서 탈출한 썰 풉니다." (스토리텔링 마케팅)
Phase 3: Market Standard (M7 ~ )
Target: 프랜차이즈 본사 및 협회 제휴.
Goal: 시장 점유율 10% (200개소) 확보 -> BEP(손익분기) 달성.
8. Functional Requirements (개발 요구사항 요약)
팀장님, 이 부분은 제가 Cursor에게 바로 던질 수 있게 정리했습니다.
Auth & Tenant: Clerk Organization 기능 필수. (사업소 간 데이터 절대 격리)
Database: Neon (Postgres). 복잡한 관계형 데이터(수급자-계약-제품-재고) 처리에 최적화.
UI/UX: shadcn/ui의 Data Table 적극 활용. (필터링, 정렬, 엑셀 다운로드 기능 기본 탑재)
Batch: n8n 또는 Cron Job으로 매일 밤 12시 "내일 반납 예정 건", "내구연한 만료 건" 체크 및 알림 생성.