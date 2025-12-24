# WeOps 브랜드 아이덴티티 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**대상**: 개발자, 디자이너  
**적용 범위**: WeOps 프로젝트 전체

---

## 📋 목차

1. [브랜드 개요](#1-브랜드-개요)
2. [로고](#2-로고)
3. [컬러 시스템](#3-컬러-시스템)
4. [타이포그래피](#4-타이포그래피)
5. [컴포넌트 사용법](#5-컴포넌트-사용법)
6. [파비콘 및 메타데이터](#6-파비콘-및-메타데이터)

---

## 1. 브랜드 개요

### 1.1 브랜드 컨셉

WeOps는 **복지용구 운영의 표준**을 제시하는 SaaS 플랫폼입니다.

**핵심 가치**:
- 연결 (Connection)
- 순환 (Circulation)
- 보호 (Protection)
- 전문성 (Professionalism)

### 1.2 슬로건

- **한국어**: "복지용구 운영의 표준, WeOps"
- **영어**: "The Standard of Welfare Operations"

---

## 2. 로고

### 2.1 로고 디자인

로고는 다음 요소를 결합합니다:

- **W 문자**: WeOps의 첫 글자
- **박스**: 재고(Inventory)를 상징
- **체크마크**: 검증(Verification)을 상징
- **그라데이션**: Primary Blue → Secondary Teal

### 2.2 로고 사용법

```tsx
import { Logo } from "@/components/brand";

// 기본 사용
<Logo />

// 크기 조절
<Logo size="sm" />   // 24px
<Logo size="md" />   // 32px (기본)
<Logo size="lg" />   // 48px
<Logo size="xl" />   // 64px

// 텍스트 없이 아이콘만
<Logo showText={false} />

// 다크 모드
<Logo dark={true} />
```

### 2.3 로고 아이콘 (파비콘용)

```tsx
import { LogoIcon } from "@/components/brand";

<LogoIcon size={32} />
```

### 2.4 로고 사용 규칙

- ✅ 최소 크기: 24px (아이콘만)
- ✅ 최소 여백: 로고 높이의 50%
- ✅ 배경: 단색 또는 그라데이션 배경 사용 가능
- ❌ 로고 변형 금지 (회전, 왜곡, 색상 변경)
- ❌ 로고 위에 텍스트나 그래픽 오버레이 금지

---

## 3. 컬러 시스템

### 3.1 메인 컬러

#### Primary (신뢰/메인): Slate Blue
- **Hex**: `#2563EB`
- **Tailwind**: `blue-600`
- **용도**: 메인 액션 버튼, 링크, 강조 요소

#### Secondary (안전/강조): Teal
- **Hex**: `#0D9488`
- **Tailwind**: `teal-600`
- **용도**: 성공 상태, 긍정적인 피드백, 보조 액션

#### Destructive (경고/위험): Rose Red
- **Hex**: `#E11D48`
- **Tailwind**: `rose-600`
- **용도**: 에러 메시지, 경고, 삭제 액션

### 3.2 컬러 사용 예시

```tsx
import { brandColors } from "@/components/brand";

// 컬러 값 직접 사용
const primaryColor = brandColors.primary.hex; // "#2563EB"
const secondaryColor = brandColors.secondary.tailwind; // "teal-600"
```

### 3.3 Tailwind CSS 클래스

```tsx
// Primary 컬러
<button className="bg-blue-600 text-white">Primary Button</button>

// Secondary 컬러
<div className="text-teal-600">Success Message</div>

// Destructive 컬러
<button className="bg-rose-600 text-white">Delete</button>
```

---

## 4. 타이포그래피

### 4.1 폰트

- **메인 폰트**: Pretendard (한국어 최적화)
- **모노스페이스**: Geist Mono

### 4.2 폰트 크기

- **로고 텍스트**: `font-bold` + 크기에 따라 `text-sm` ~ `text-4xl`
- **슬로건**: `text-sm md:text-base` + `text-muted-foreground`

---

## 5. 컴포넌트 사용법

### 5.1 브랜드 헤더 (로그인 화면용)

```tsx
import { BrandHeader } from "@/components/brand";

<BrandHeader 
  showSlogan={true}  // 슬로건 표시 여부
  logoSize="lg"      // 로고 크기
/>
```

### 5.2 사이드바에 로고 추가

```tsx
import { SidebarHeader } from "@/components/ui/sidebar";
import { Logo } from "@/components/brand";

<SidebarHeader className="border-b px-4 py-4">
  <Logo size="md" showText={true} />
</SidebarHeader>
```

### 5.3 네비게이션 바에 로고 추가

```tsx
import Link from "next/link";
import { Logo } from "@/components/brand";

<Link href="/" className="flex items-center">
  <Logo size="md" showText={true} />
</Link>
```

---

## 6. 파비콘 및 메타데이터

### 6.1 파비콘 파일

- **SVG**: `/public/icon.svg` (기본 파비콘)
- **PNG**: `/public/icon-light-32x32.png`, `/public/icon-dark-32x32.png`
- **Apple Touch Icon**: `/public/apple-icon.png`

### 6.2 PWA 아이콘

다음 크기의 아이콘이 `/public/icons/` 디렉토리에 필요합니다:

- `icon-192x192.png`
- `icon-256x256.png`
- `icon-384x384.png`
- `icon-512x512.png`

### 6.3 메타데이터 설정

`app/layout.tsx`에서 메타데이터가 자동으로 설정됩니다:

```typescript
export const metadata: Metadata = {
  title: "WeOps - 복지용구 운영의 표준",
  description: "복지용구 대여 및 재고 관리를 위한 통합 관리 시스템",
  // ... 기타 설정
};
```

### 6.4 Open Graph 이미지

- **파일**: `/public/og-image.png`
- **권장 크기**: 1200x630px
- **용도**: 소셜 미디어 공유 시 표시되는 이미지

---

## 7. 파일 구조

```
components/brand/
├── logo.tsx              # 로고 컴포넌트
├── brand-colors.ts       # 브랜드 컬러 정의
├── brand-header.tsx      # 브랜드 헤더 컴포넌트
└── index.ts              # Export 파일

public/
├── icon.svg              # 파비콘 SVG
├── icon-light-32x32.png # 라이트 모드 파비콘
├── icon-dark-32x32.png  # 다크 모드 파비콘
├── apple-icon.png       # Apple Touch Icon
├── og-image.png         # Open Graph 이미지
└── manifest.json         # PWA 매니페스트

docs/
├── BI_LOGO.md           # 브랜드 아이덴티티 원본 가이드
└── BRAND_IDENTITY.md    # 이 문서
```

---

## 8. 체크리스트

새로운 페이지나 컴포넌트를 만들 때 다음을 확인하세요:

- [ ] 로고가 올바른 크기와 위치에 있는가?
- [ ] 브랜드 컬러가 일관되게 사용되고 있는가?
- [ ] 슬로건이 적절한 위치에 표시되는가?
- [ ] 파비콘이 올바르게 설정되어 있는가?
- [ ] 메타데이터가 업데이트되었는가?

---

## 9. 참고 자료

- [BI_LOGO.md](./BI_LOGO.md) - 원본 브랜드 가이드
- [shadcn/ui 문서](https://ui.shadcn.com) - UI 컴포넌트 가이드
- [Tailwind CSS 문서](https://tailwindcss.com) - 스타일링 가이드

---

**문서 정보**

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21  
**버전**: 1.0

