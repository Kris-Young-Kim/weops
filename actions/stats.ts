/**
 * @file stats.ts
 * @description Server Actions - 통계 데이터 조회
 *
 * 대시보드에 표시할 통계 데이터를 Neon DB에서 조회합니다.
 * 모든 통계는 현재 사용자의 org_id로 필터링됩니다.
 *
 * @dependencies
 * - actions/auth: 사용자 인증 헬퍼
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

"use server";

import { db, orders, assets, recipients } from "@/src/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireOrgId } from "./auth";

/**
 * 대시보드 통계 데이터를 조회합니다.
 * @returns 통계 데이터 객체
 */
export async function getDashboardStats() {
  console.group("[Server Action] getDashboardStats");
  
  try {
    const orgId = await requireOrgId();

    // 이번 달 시작일
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 이번 달 청구 예정액 (주문의 claimAmount 합계)
    const monthlyClaimResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.claimAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.orgId, orgId),
          gte(orders.orderDate, startOfMonth.toISOString().split("T")[0])
        )
      );

    const monthlyClaimAmount = Number(monthlyClaimResult[0]?.total || 0);

    // 소독 대기 중인 장비 수
    const sanitizingCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(assets)
      .where(
        and(
          eq(assets.orgId, orgId),
          eq(assets.status, "SANITIZING")
        )
      );

    const sanitizingCount = Number(sanitizingCountResult[0]?.count || 0);

    // 이번 주 만료 예정 수급자 수 (7일 이내 만료)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const expiringRecipientsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(recipients)
      .where(
        and(
          eq(recipients.orgId, orgId),
          sql`${recipients.expiryDate} IS NOT NULL`,
          sql`${recipients.expiryDate} <= ${expiryDate.toISOString().split("T")[0]}`
        )
      );

    const expiringRecipientsCount = Number(
      expiringRecipientsResult[0]?.count || 0
    );

    const stats = {
      monthlyClaimAmount,
      sanitizingCount,
      expiringRecipientsCount,
    };

    console.log("Stats:", stats);
    console.groupEnd();
    
    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    console.groupEnd();
    throw error;
  }
}

