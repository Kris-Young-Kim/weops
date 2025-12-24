import { auth } from "@clerk/nextjs/server";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";

/**
 * @file get-user-org.ts
 * @description Clerk user ID로 Organization ID를 조회하는 유틸리티 함수
 *
 * 이 함수는 현재 로그인한 사용자의 clerk_user_id를 사용하여
 * Neon 데이터베이스의 users 테이블에서 해당 사용자의 org_id를 조회합니다.
 *
 * @returns 사용자의 org_id (UUID) 또는 null (사용자를 찾을 수 없는 경우)
 *
 * @example
 * ```typescript
 * import { getUserOrg } from '@/lib/utils/get-user-org';
 *
 * export default async function MyPage() {
 *   const orgId = await getUserOrg();
 *   if (!orgId) {
 *     return <div>Organization not found</div>;
 *   }
 *   // orgId를 사용하여 데이터 조회
 * }
 * ```
 */
export async function getUserOrg(): Promise<string | null> {
  try {
    console.group("[Utils] getUserOrg");
    
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.log("No userId found");
      console.groupEnd();
      return null;
    }

    console.log("Clerk User ID:", userId);

    // Neon DB에서 사용자 조회
    const [user] = await db
      .select({ orgId: users.orgId })
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    if (!user) {
      console.log("User not found in database");
      console.groupEnd();
      return null;
    }

    console.log("Organization ID:", user.orgId);
    console.groupEnd();

    return user.orgId;
  } catch (error) {
    console.error("Error getting user org:", error);
    console.groupEnd();
    return null;
  }
}

