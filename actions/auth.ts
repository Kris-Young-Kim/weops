/**
 * @file auth.ts
 * @description Server Actions - 사용자 인증 및 권한 관련 헬퍼 함수
 *
 * Clerk 인증을 통해 현재 사용자의 정보를 가져오고,
 * Neon DB에서 사용자의 org_id를 조회하는 함수들을 제공합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 서버 사이드 인증
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

import { auth } from "@clerk/nextjs/server";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";

/**
 * 현재 로그인한 사용자의 Clerk User ID를 가져옵니다.
 * @returns Clerk User ID 또는 null (인증되지 않은 경우)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * 현재 로그인한 사용자의 Neon DB User 정보를 가져옵니다.
 * @returns User 객체 또는 null
 */
export async function getCurrentUser() {
  const clerkUserId = await getCurrentUserId();
  
  if (!clerkUserId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return user || null;
}

/**
 * 현재 로그인한 사용자의 Organization ID를 가져옵니다.
 * @returns Organization ID 또는 null
 */
export async function getCurrentOrgId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.orgId || null;
}

/**
 * 인증된 사용자인지 확인합니다.
 * @throws Error 인증되지 않은 경우
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  
  return userId;
}

/**
 * 인증된 사용자의 Organization ID를 가져옵니다.
 * @throws Error 인증되지 않았거나 org_id가 없는 경우
 */
export async function requireOrgId(): Promise<string> {
  const orgId = await getCurrentOrgId();
  
  if (!orgId) {
    throw new Error("사업소 정보를 찾을 수 없습니다. 관리자에게 문의하세요.");
  }
  
  return orgId;
}

