/**
 * @file recipients.ts
 * @description Server Actions - 수급자(Recipients) 관리
 *
 * Neon DB의 recipients 테이블과 연동하여 수급자 조회, 생성, 수정 기능을 제공합니다.
 * 모든 쿼리는 현재 사용자의 org_id로 자동 필터링됩니다.
 *
 * @dependencies
 * - actions/auth: 사용자 인증 헬퍼
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

"use server";

import { db, recipients } from "@/src/db";
import { eq, and, like, or, desc } from "drizzle-orm";
import { requireOrgId } from "./auth";
import type { NewRecipient } from "@/src/db/schema";

/**
 * 현재 사업소의 모든 수급자를 조회합니다.
 * @param options 검색 옵션
 * @returns 수급자 목록
 */
export async function getRecipients(options?: {
  search?: string;
  limit?: number;
}) {
  console.group("[Server Action] getRecipients");
  console.log("Options:", options);
  
  try {
    const orgId = await requireOrgId();

    // 조건 배열 구성
    const conditions = [eq(recipients.orgId, orgId)];
    
    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          like(recipients.name, searchPattern),
          like(recipients.ltcNumber, searchPattern)
        )!
      );
    }

    const baseQuery = db
      .select()
      .from(recipients)
      .where(and(...conditions))
      .orderBy(desc(recipients.createdAt));
    
    const result = options?.limit 
      ? await baseQuery.limit(options.limit)
      : await baseQuery;
    console.log(`Found ${result.length} recipients`);
    console.groupEnd();
    
    return result;
  } catch (error) {
    console.error("Error fetching recipients:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 특정 수급자를 ID로 조회합니다.
 * @param recipientId 수급자 ID
 * @returns 수급자 정보 또는 null
 */
export async function getRecipientById(recipientId: string) {
  console.group("[Server Action] getRecipientById");
  console.log("Recipient ID:", recipientId);
  
  try {
    const orgId = await requireOrgId();

    const [recipient] = await db
      .select()
      .from(recipients)
      .where(and(eq(recipients.id, recipientId), eq(recipients.orgId, orgId)))
      .limit(1);

    console.log("Recipient found:", recipient ? "Yes" : "No");
    console.groupEnd();
    
    return recipient || null;
  } catch (error) {
    console.error("Error fetching recipient:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 새 수급자를 생성합니다.
 * @param data 수급자 데이터
 * @returns 생성된 수급자 정보
 */
export async function createRecipient(data: Omit<NewRecipient, "orgId">) {
  console.group("[Server Action] createRecipient");
  console.log("Recipient data:", data);
  
  try {
    const orgId = await requireOrgId();

    const [newRecipient] = await db
      .insert(recipients)
      .values({
        ...data,
        orgId, // 현재 사업소 ID로 자동 설정
      })
      .returning();

    console.log("Recipient created:", newRecipient.id);
    console.groupEnd();
    
    return newRecipient;
  } catch (error) {
    console.error("Error creating recipient:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 수급자 정보를 업데이트합니다.
 * @param recipientId 수급자 ID
 * @param data 업데이트할 데이터
 * @returns 업데이트된 수급자 정보
 */
export async function updateRecipient(
  recipientId: string,
  data: Partial<Omit<NewRecipient, "orgId" | "id">>
) {
  console.group("[Server Action] updateRecipient");
  console.log("Recipient ID:", recipientId);
  console.log("Update data:", data);
  
  try {
    const orgId = await requireOrgId();

    const [updatedRecipient] = await db
      .update(recipients)
      .set(data)
      .where(and(eq(recipients.id, recipientId), eq(recipients.orgId, orgId)))
      .returning();

    if (!updatedRecipient) {
      throw new Error("수급자를 찾을 수 없습니다.");
    }

    console.log("Recipient updated");
    console.groupEnd();
    
    return updatedRecipient;
  } catch (error) {
    console.error("Error updating recipient:", error);
    console.groupEnd();
    throw error;
  }
}

