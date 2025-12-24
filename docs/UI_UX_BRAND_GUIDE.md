# WeOps UI/UX 브랜드 가이드

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-21  
**대상**: 개발자, 디자이너  
**적용 범위**: WeOps 프로젝트 전체 UI/UX

---

## 📋 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [컬러 시스템](#2-컬러-시스템)
3. [컴포넌트 스타일 가이드](#3-컴포넌트-스타일-가이드)
4. [상태별 컬러 매핑](#4-상태별-컬러-매핑)
5. [타이포그래피](#5-타이포그래피)
6. [간격 및 레이아웃](#6-간격-및-레이아웃)

---

## 1. 디자인 원칙

### 1.1 핵심 가치

- **신뢰성 (Reliability)**: 전문적이고 일관된 디자인
- **명확성 (Clarity)**: 정보가 명확하게 전달되는 UI
- **효율성 (Efficiency)**: 사용자가 빠르게 작업할 수 있는 UX
- **접근성 (Accessibility)**: 모든 사용자가 접근 가능한 디자인

### 1.2 디자인 철학

- **미니멀리즘**: 불필요한 요소 제거, 핵심에 집중
- **일관성**: 브랜드 컬러와 스타일을 일관되게 적용
- **피드백**: 사용자 액션에 대한 명확한 시각적 피드백

---

## 2. 컬러 시스템

### 2.1 브랜드 컬러

#### Primary (신뢰/메인): Blue-600
- **Hex**: `#2563EB`
- **용도**: 메인 액션 버튼, 링크, 강조 요소
- **Tailwind**: `bg-blue-600`, `text-blue-600`

#### Secondary (안전/강조): Teal-600
- **Hex**: `#0D9488`
- **용도**: 성공 상태, 긍정적인 피드백, 보조 액션
- **Tailwind**: `bg-teal-600`, `text-teal-600`

#### Destructive (경고/위험): Rose-600
- **Hex**: `#E11D48`
- **용도**: 에러 메시지, 경고, 삭제 액션
- **Tailwind**: `bg-rose-600`, `text-rose-600`

### 2.2 상태별 컬러

| 상태 | 컬러 | 용도 |
|------|------|------|
| 성공 | Teal-600 | 작업 완료, 정상 상태 |
| 경고 | Amber-600 | 주의 필요, 대기 상태 |
| 에러 | Rose-600 | 오류, 위험 상태 |
| 정보 | Blue-600 | 정보 제공, 기본 상태 |

---

## 3. 컴포넌트 스타일 가이드

### 3.1 버튼 (Button)

```tsx
// Primary 버튼 (메인 액션)
<Button className="bg-blue-600 hover:bg-blue-700">
  저장
</Button>

// Secondary 버튼 (보조 액션)
<Button variant="secondary" className="bg-teal-600 hover:bg-teal-700">
  확인
</Button>

// Destructive 버튼 (삭제/취소)
<Button variant="destructive" className="bg-rose-600 hover:bg-rose-700">
  삭제
</Button>
```

### 3.2 배지 (Badge)

```tsx
// 성공 상태
<Badge className="bg-teal-600 text-white">완료</Badge>

// 진행 중
<Badge className="bg-blue-600 text-white">처리 중</Badge>

// 경고 상태
<Badge className="border-amber-500 text-amber-700 dark:text-amber-400">
  소독 대기
</Badge>

// 에러 상태
<Badge className="bg-rose-600 text-white">오류</Badge>
```

### 3.3 카드 (Card)

```tsx
// 기본 카드
<Card className="transition-shadow hover:shadow-md">
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

### 3.4 통계 카드 (Stats Card)

```tsx
// 아이콘 배경색과 텍스트 컬러 매칭
<div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-950">
  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
</div>
<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
  {value}
</div>
```

---

## 4. 상태별 컬러 매핑

### 4.1 자산 상태

| 상태 | 컬러 | Badge 스타일 |
|------|------|--------------|
| 대여 가능 (AVAILABLE) | Teal-600 | `bg-teal-600 text-white` |
| 대여 중 (RENTED) | Blue-600 | `bg-blue-600 text-white` |
| 소독 대기 (SANITIZING) | Amber-500 | `border-amber-500 text-amber-700` |
| 폐기 (DISCARDED) | Rose-600 | `bg-rose-600 text-white` |

### 4.2 주문 상태

| 상태 | 컬러 | Badge 스타일 |
|------|------|--------------|
| 완료 (completed) | Teal-600 | `bg-teal-600 text-white` |
| 처리 중 (pending) | Blue-600 | `bg-blue-600 text-white` |
| 취소됨 (cancelled) | Rose-600 | `bg-rose-600 text-white` |

### 4.3 금액 표시

```tsx
// 총액/본인부담금
<span className="text-blue-600 dark:text-blue-400">
  {amount.toLocaleString()}원
</span>

// 잔여 한도 (긍정적)
<span className="text-teal-600 dark:text-teal-400">
  {remainingLimit.toLocaleString()}원
</span>

// 한도 초과 (경고)
<span className="text-rose-600 dark:text-rose-400">
  {exceededAmount.toLocaleString()}원 초과
</span>
```

---

## 5. 타이포그래피

### 5.1 폰트

- **메인 폰트**: Pretendard (한국어 최적화)
- **모노스페이스**: Geist Mono (코드, 시리얼 번호)

### 5.2 폰트 크기

```tsx
// 제목
<h1 className="text-2xl font-bold">대시보드</h1>

// 부제목
<h2 className="text-lg font-semibold">재고 관리</h2>

// 본문
<p className="text-sm">일반 텍스트</p>

// 작은 텍스트
<p className="text-xs text-muted-foreground">보조 정보</p>
```

### 5.3 폰트 굵기

- **Bold**: 중요한 숫자, 금액
- **Semibold**: 제목, 강조 텍스트
- **Medium**: 일반 텍스트
- **Regular**: 보조 정보

---

## 6. 간격 및 레이아웃

### 6.1 간격 시스템

```tsx
// 카드 간격
<div className="grid gap-4 md:grid-cols-3">

// 섹션 간격
<div className="space-y-6">

// 요소 간격
<div className="flex items-center gap-4">
```

### 6.2 패딩

```tsx
// 카드 내부
<CardContent className="space-y-4 p-6">

// 섹션 헤더
<CardHeader className="pb-4">
```

### 6.3 반응형 디자인

```tsx
// 그리드 레이아웃
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// 텍스트 크기
<p className="text-sm md:text-base">
```

---

## 7. 인터랙션 패턴

### 7.1 호버 효과

```tsx
// 카드 호버
<Card className="transition-shadow hover:shadow-md">

// 버튼 호버
<Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
```

### 7.2 포커스 상태

```tsx
// Input 포커스
<Input className="focus-visible:ring-blue-600 focus-visible:ring-2">
```

### 7.3 로딩 상태

```tsx
// 로딩 스피너
<div className="flex items-center justify-center">
  <Spinner className="text-blue-600" />
</div>
```

---

## 8. 접근성 (Accessibility)

### 8.1 색상 대비

- 모든 텍스트는 WCAG AA 기준 충족
- 다크 모드 지원 필수

### 8.2 키보드 네비게이션

- 모든 인터랙티브 요소는 키보드로 접근 가능
- 포커스 인디케이터 명확히 표시

### 8.3 스크린 리더

```tsx
// 아이콘 버튼
<Button aria-label="삭제">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 9. 체크리스트

새로운 컴포넌트를 만들 때 확인하세요:

- [ ] 브랜드 컬러가 올바르게 적용되었는가?
- [ ] 상태별 컬러가 일관되게 사용되었는가?
- [ ] 호버 및 포커스 상태가 명확한가?
- [ ] 다크 모드가 올바르게 작동하는가?
- [ ] 접근성 기준을 충족하는가?
- [ ] 반응형 디자인이 적용되었는가?

---

## 10. 참고 자료

- [브랜드 아이덴티티 가이드](./BRAND_IDENTITY.md)
- [BI_LOGO.md](./BI_LOGO.md) - 브랜드 컬러 정의
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com)

---

**문서 정보**

**작성자**: WeOps Development Team  
**최종 수정일**: 2025-01-21  
**버전**: 1.0

