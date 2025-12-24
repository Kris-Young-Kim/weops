/**
 * @file logo.tsx
 * @description WeOps 브랜드 로고 컴포넌트
 *
 * 브랜드 아이덴티티 가이드에 따라 설계된 로고입니다.
 * 'W'와 박스(재고) 또는 체크마크(검증)를 결합한 미니멀한 디자인.
 *
 * @see {@link docs/BI_LOGO.md} - 브랜드 아이덴티티 가이드
 */

import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * 로고 크기 (기본: "md")
   * - sm: 작은 크기 (24px)
   * - md: 중간 크기 (32px)
   * - lg: 큰 크기 (48px)
   * - xl: 매우 큰 크기 (64px)
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * 다크 모드 여부
   */
  dark?: boolean;
  /**
   * 텍스트 표시 여부
   */
  showText?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 48, text: "text-2xl" },
  xl: { icon: 64, text: "text-4xl" },
};

export function Logo({
  size = "md",
  dark = false,
  showText = true,
  className,
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];
  const primaryColor = dark ? "#3B82F6" : "#2563EB"; // blue-500/blue-600
  const secondaryColor = dark ? "#14B8A6" : "#0D9488"; // teal-500/teal-600

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 로고 아이콘: W와 박스 결합 */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="WeOps 로고"
      >
        {/* 그라데이션 정의 */}
        <defs>
          <linearGradient
            id="logoGradient"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* 박스 (재고 상징) */}
        <rect
          x="12"
          y="20"
          width="40"
          height="32"
          rx="4"
          fill="url(#logoGradient)"
          opacity="0.2"
        />
        <rect
          x="12"
          y="20"
          width="40"
          height="32"
          rx="4"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
        />

        {/* W 문자 (스타일화된) */}
        <path
          d="M 20 44 L 24 28 L 28 36 L 32 28 L 36 36 L 40 28 L 44 44"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 체크마크 (검증 상징) */}
        <path
          d="M 48 32 L 50 34 L 54 30"
          stroke={secondaryColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* 로고 텍스트 */}
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            textSize,
            dark ? "text-white" : "text-foreground"
          )}
        >
          WeOps
        </span>
      )}
    </div>
  );
}

/**
 * 로고 아이콘만 표시하는 컴포넌트 (파비콘용)
 */
export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  const primaryColor = "#2563EB";
  const secondaryColor = "#0D9488";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WeOps"
    >
      <defs>
        <linearGradient
          id="iconGradient"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      <rect
        x="12"
        y="20"
        width="40"
        height="32"
        rx="4"
        fill="url(#iconGradient)"
        opacity="0.2"
      />
      <rect
        x="12"
        y="20"
        width="40"
        height="32"
        rx="4"
        stroke="url(#iconGradient)"
        strokeWidth="2.5"
      />
      <path
        d="M 20 44 L 24 28 L 28 36 L 32 28 L 36 36 L 40 28 L 44 44"
        stroke="url(#iconGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 48 32 L 50 34 L 54 30"
        stroke={secondaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

