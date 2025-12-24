/**
 * @file brand-header.tsx
 * @description 브랜드 헤더 컴포넌트 (로그인 화면 등에서 사용)
 *
 * 로고와 슬로건을 함께 표시하는 헤더 컴포넌트입니다.
 */

import { Logo } from "./logo";
import { brandSlogan } from "./brand-colors";

interface BrandHeaderProps {
  /**
   * 슬로건 표시 여부
   */
  showSlogan?: boolean;
  /**
   * 로고 크기
   */
  logoSize?: "sm" | "md" | "lg" | "xl";
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function BrandHeader({
  showSlogan = true,
  logoSize = "lg",
  className,
}: BrandHeaderProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className || ""}`}>
      <Logo size={logoSize} showText={true} />
      {showSlogan && (
        <p className="text-center text-muted-foreground text-sm md:text-base">
          {brandSlogan.ko}
        </p>
      )}
    </div>
  );
}

