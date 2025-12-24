🧜‍♀️ WeOps System Diagrams (Mermaid.md)
이 문서는 **WeOps (Welfare Operations System)**의 데이터베이스 설계(ERD), 시스템 아키텍처, 핵심 비즈니스 로직, 그리고 자산 상태 머신을 정의합니다.

1.  Entity Relationship Diagram (ERD)
    DBA Note: Neon(Postgres) 환경에 최적화된 스키마입니다. Organizations를 최상위 Tenant로 하여 모든 데이터가 격리됩니다. Orders 테이블의 금액 계산 필드와 Assets의 상태 관리에 주목하십시오.
    code
    Mermaid
    erDiagram
    %% ---------------------------------------------------------
    %% 1. TENANT / AUTH
    %% ---------------------------------------------------------
    ORGANIZATIONS {
    uuid id PK "Primary Key (UUID v7)"
    string clerk_org_id UK "Clerk Organization ID"
    string name "사업소명"
    string biz_number "사업자등록번호"
    timestamp created_at
    }

        USERS {
            uuid id PK
            uuid org_id FK "소속 사업소"
            string clerk_user_id UK
            string email
            enum role "OWNER, STAFF, DRIVER"
        }

        %% ---------------------------------------------------------
        %% 2. CUSTOMER (RECIPIENT)
        %% ---------------------------------------------------------
        RECIPIENTS {
            uuid id PK
            uuid org_id FK
            string name "수급자명"
            string ltc_number "L번호 (장기요양인정번호)"
            decimal copay_rate "본인부담율 (15, 9, 6, 0)"
            int limit_balance "잔여 한도액 (초기 160만원)"
            date expiry_date "인정 유효기간 만료일"
            timestamp created_at
        }

        %% ---------------------------------------------------------
        %% 3. PRODUCT & INVENTORY (WeStock)
        %% ---------------------------------------------------------
        PRODUCTS {
            string code PK "공단 고시 코드 (예: WS-1234)"
            string name "품명"
            string category "품목 (침대, 휠체어)"
            int price "고시가"
            int durability_years "내구연한 (년)"
            boolean is_rental "대여 가능 여부"
        }

        ASSETS {
            uuid id PK
            uuid org_id FK
            string product_code FK
            string serial_number "시리얼 넘버"
            string qr_code UK "고유 QR 코드"
            enum status "AVAILABLE, RENTED, RETURNING, SANITIZING, DISCARDED"
            uuid current_recipient_id FK "현재 위치 (Nullable)"
            int location_lat "위도 (Google Maps)"
            int location_lng "경도"
            timestamp last_sanitized_at "마지막 소독일"
        }

        %% ---------------------------------------------------------
        %% 4. ORDER & BILLING (WeGuard)
        %% ---------------------------------------------------------
        ORDERS {
            uuid id PK
            uuid org_id FK
            uuid recipient_id FK
            int total_amt "총액"
            int copay_amt "본인부담금 (10원 절사)"
            int claim_amt "청구액 (Total - Copay)"
            boolean is_verified "WeGuard 검증 통과 여부"
            date order_date
            timestamp created_at
        }

        ORDER_ITEMS {
            uuid id PK
            uuid order_id FK
            uuid asset_id FK "출고된 자산 ID (대여 시 필수)"
            string product_code FK
            int price "당시 단가"
            enum type "PURCHASE, RENTAL"
        }

        %% ---------------------------------------------------------
        %% RELATIONSHIPS
        %% ---------------------------------------------------------
        ORGANIZATIONS ||--o{ USERS : "has"
        ORGANIZATIONS ||--o{ RECIPIENTS : "manages"
        ORGANIZATIONS ||--o{ ASSETS : "owns"
        ORGANIZATIONS ||--o{ ORDERS : "processes"

        RECIPIENTS ||--o{ ORDERS : "places"
        PRODUCTS ||--o{ ASSETS : "catalog"
        PRODUCTS ||--o{ ORDER_ITEMS : "defines"

        ORDERS ||--|{ ORDER_ITEMS : "contains"
        RECIPIENTS |o--o{ ASSETS : "currently_holding"
        ASSETS ||--o{ ORDER_ITEMS : "history"

2.  System Architecture Flow
    Next.js 16과 Serverless 인프라의 데이터 흐름도입니다.
    code
    Mermaid
    flowchart TD
    subgraph Client [Client Side]
    PC[Desktop Browser<br/>(Admin Dashboard)]
    Mobile[Mobile Web/PWA<br/>(QR Scanner)]
    end

        subgraph Edge [Vercel Edge Network]
            Auth[Clerk Middleware<br/>(Authentication)]
            Next[Next.js 16 App Router<br/>(Server Actions & UI)]
        end

        subgraph DataLayer [Serverless Infrastructure]
            Neon[(Neon DB<br/>Serverless Postgres)]
            Storage[(Vercel Blob Storage<br/>Images/PDFs)]
        end

        subgraph External [External Services]
            Maps[Google Maps API]
            N8N[n8n Workflow<br/>(Daily Batch/Alerts)]
        end

        PC -->|HTTPS| Auth
        Mobile -->|HTTPS| Auth
        Auth --> Next

        Next -->|Query/Mutation (Drizzle)| Neon
        Next -->|Upload/Download| Storage
        Next -->|Geocoding| Maps

        N8N -->|Webhook Trigger| Next
        N8N -->|Cron Job| Neon

3.  WeGuard Validation Sequence (청구 방어 로직)
    주문 버튼 클릭 시 실행되는 WeGuard 엔진의 동작 순서입니다. 이 로직이 우리 서비스의 핵심(Moat)입니다.
    code
    Mermaid
    sequenceDiagram
    autonumber
    actor User as 사업소장 (User)
    participant UI as 주문 화면 (Client)
    participant SA as Server Action (Backend)
    participant DB as Neon DB (Database)

        Note over User, UI: 제품 선택 후 [저장] 클릭

        User->>UI: 주문 데이터 전송
        UI->>SA: createOrder(recipientId, items) 호출

        rect rgb(240, 248, 255)
            Note right of SA: 🛡️ WeGuard Engine Start

            SA->>DB: 수급자 정보 조회 (등급, 잔여한도)
            DB-->>SA: { limit_balance: 500000, ... }

            SA->>DB: 해당 품목 과거 구매이력 조회
            DB-->>SA: [List of Histories...]

            SA->>SA: 1. 한도 초과 계산 Check
            alt 한도 초과 발생
                SA-->>UI: Error: "잔여 한도가 부족합니다."
            end

            SA->>SA: 2. 내구연한 중복 Check
            alt 내구연한 내 재구매
                SA-->>UI: Error: "아직 구매할 수 없는 품목입니다."
            end

            SA->>SA: 3. 본인부담금 계산 (10원 절사)
        end

        SA->>DB: Transaction Begin (Order + Item + Asset Update)
        DB-->>SA: Success

        SA-->>UI: 주문 완료 및 PDF 생성 URL 반환
        UI->>User: 성공 메시지 & 계약서 출력 버튼 활성화

4.  Asset Lifecycle State Machine (자산 상태도)
    WeStock 모듈에서 관리하는 QR 기반 자산의 생애주기입니다. 소독(Sanitizing) 과정이 강제되는 것이 특징입니다.
    code
    Mermaid
    stateDiagram-v2
    [*] --> AVAILABLE: 신규 입고 (QR 생성)

        state "AVAILABLE (대여 가능)" as AVAILABLE
        state "RENTED (대여 중)" as RENTED
        state "RETURNING (회수 대기)" as RETURNING
        state "SANITIZING (소독 중)" as SANITIZING
        state "DISCARDED (폐기)" as DISCARDED

        AVAILABLE --> RENTED: 주문 출고 (Scan)
        RENTED --> RETURNING: 반납 요청 접수
        RETURNING --> SANITIZING: 입고 및 세척 시작 (Scan)

        state SANITIZING {
            [*] --> Washing: 세척
            Washing --> UV_Sterilizing: 자외선 소독
            UV_Sterilizing --> Wrapping: 비닐 포장
            Wrapping --> [*]
        }

        SANITIZING --> AVAILABLE: 소독 일지 작성 완료

        AVAILABLE --> DISCARDED: 내구연한 경과/파손
        RETURNING --> DISCARDED: 회수 시 파손 확인
        RENTED --> [*]: 장기요양 계약 종료
