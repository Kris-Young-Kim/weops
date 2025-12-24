/**
 * @file brand-colors.ts
 * @description WeOps 브랜드 컬러 시스템
 *
 * BI_LOGO.md에 정의된 브랜드 컬러를 TypeScript로 export합니다.
 * Tailwind CSS와 함께 사용할 수 있도록 구성되었습니다.
 *
 * @see {@link docs/BI_LOGO.md} - 브랜드 아이덴티티 가이드
 */

/**
 * 브랜드 컬러 팔레트
 */
export const brandColors = {
  /**
   * Primary (신뢰/메인): Slate Blue
   * 무게감 있는 전문적인 파란색
   */
  primary: {
    hex: "#2563EB",
    tailwind: "blue-600",
    rgb: "rgb(37, 99, 235)",
    description: "신뢰감을 주는 메인 컬러",
  },
  /**
   * Secondary (안전/강조): Teal
   * 재고가 맞거나 청구가 완벽할 때 사용
   */
  secondary: {
    hex: "#0D9488",
    tailwind: "teal-600",
    rgb: "rgb(13, 148, 136)",
    description: "긍정적인 상태를 나타내는 강조 컬러",
  },
  /**
   * Destructive (경고/위험): Rose Red
   * 한도 초과, 재고 부족 시 사용
   */
  destructive: {
    hex: "#E11D48",
    tailwind: "rose-600",
    rgb: "rgb(225, 29, 72)",
    description: "경고 및 위험 상태를 나타내는 컬러",
  },
} as const;

/**
 * 브랜드 슬로건
 */
export const brandSlogan = {
  ko: "복지용구 운영의 표준, WeOps",
  en: "The Standard of Welfare Operations",
} as const;

