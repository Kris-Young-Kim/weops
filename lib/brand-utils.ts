/**
 * @file brand-utils.ts
 * @description 브랜드 아이덴티티 유틸리티 함수
 *
 * 브랜드 컬러와 스타일을 일관되게 적용하기 위한 헬퍼 함수들
 */

import { brandColors } from "@/components/brand";

/**
 * 상태별 브랜드 컬러 매핑
 */
export const statusColors = {
  success: {
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    badge: "bg-teal-600 text-white",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-600 text-white",
  },
  error: {
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-600 text-white",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-600 text-white",
  },
  default: {
    bg: "bg-gray-50 dark:bg-gray-950",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-600 text-white",
  },
} as const;

/**
 * 자산 상태별 브랜드 컬러
 */
export const assetStatusColors = {
  AVAILABLE: {
    variant: "default" as const,
    className: "bg-teal-600 text-white hover:bg-teal-700",
    label: "대여 가능",
  },
  RENTED: {
    variant: "secondary" as const,
    className: "bg-blue-600 text-white hover:bg-blue-700",
    label: "대여 중",
  },
  SANITIZING: {
    variant: "outline" as const,
    className: "border-amber-500 text-amber-700 dark:text-amber-400",
    label: "소독 대기",
  },
  DISCARDED: {
    variant: "destructive" as const,
    className: "bg-rose-600 text-white hover:bg-rose-700",
    label: "폐기",
  },
} as const;

/**
 * 주문 상태별 브랜드 컬러
 */
export const orderStatusColors = {
  completed: {
    variant: "default" as const,
    className: "bg-teal-600 text-white",
    label: "완료",
  },
  pending: {
    variant: "secondary" as const,
    className: "bg-blue-600 text-white",
    label: "처리 중",
  },
  cancelled: {
    variant: "destructive" as const,
    className: "bg-rose-600 text-white",
    label: "취소됨",
  },
} as const;

