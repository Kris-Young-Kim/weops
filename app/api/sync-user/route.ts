import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, users, organizations } from "@/src/db";
import { eq } from "drizzle-orm";

/**
 * Clerk 사용자를 Neon users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Neon DB에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 * 
 * 주의: 사용자가 속한 Organization이 없으면 기본 Organization을 생성합니다.
 */
export async function POST() {
  try {
    console.group("[API] /api/sync-user");
    
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.log("Unauthorized: No userId");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Clerk User ID:", userId);

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.log("User not found in Clerk");
      console.groupEnd();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    console.log("Email:", email);

    // 기존 사용자 조회
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    let orgId = existingUser?.orgId;

    // Organization이 없으면 기본 Organization 생성
    if (!orgId) {
      console.log("Creating default organization");
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: email.split("@")[0] || "Default Organization",
        })
        .returning();
      orgId = newOrg.id;
      console.log("Organization created:", orgId);
    }

    // 사용자 정보 동기화 (upsert)
    if (existingUser) {
      // 업데이트
      const [updatedUser] = await db
        .update(users)
        .set({
          email,
          orgId,
        })
        .where(eq(users.clerkUserId, userId))
        .returning();

      console.log("User updated:", updatedUser?.id);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        user: updatedUser,
      });
    } else {
      // 생성
      const [newUser] = await db
        .insert(users)
        .values({
          clerkUserId: userId,
          email,
          orgId: orgId!,
          role: "STAFF",
        })
        .returning();

      console.log("User created:", newUser.id);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Sync user error:", error);
    console.groupEnd();
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
