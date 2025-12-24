/**
 * @file org-isolation.ts
 * @description Organization(사업소) 격리 로직 유틸리티 함수
 *
 * 멀티테넌시 환경에서 데이터를 사업소별로 격리하기 위한 공통 헬퍼 함수들입니다.
 * 모든 Server Action과 API Route에서 이 함수들을 사용하여 org_id 필터링을 일관되게 적용합니다.
 *
 * @see {@link actions/auth.ts} - requireOrgId() 함수
 * @see {@link docs/WeOps-데이터베이스-관리-가이드.md} - 데이터베이스 관리 가이드
 *
 * @dependencies
 * - actions/auth: requireOrgId, getCurrentOrgId
 * - drizzle-orm: eq, and
 */

import { eq, and, type SQL } from "drizzle-orm";
import { requireOrgId, getCurrentOrgId } from "@/actions/auth";

/**
 * org_id 필터 조건을 생성합니다.
 * 
 * @param orgId Organization ID (선택사항, 없으면 현재 사용자의 orgId 사용)
 * @returns Drizzle ORM 조건 객체
 * 
 * @example
 * ```typescript
 * import { withOrgFilter } from '@/lib/utils/org-isolation';
 * import { recipients } from '@/src/db';
 * 
 * const conditions = withOrgFilter(recipients.orgId);
 * const result = await db.select().from(recipients).where(conditions);
 * ```
 */
export async function withOrgFilter<T>(
  orgIdColumn: T,
  orgId?: string
): Promise<ReturnType<typeof eq>> {
  const targetOrgId = orgId || (await requireOrgId());
  return eq(orgIdColumn as any, targetOrgId);
}

/**
 * org_id 필터를 기존 조건에 추가합니다.
 * 
 * @param orgIdColumn Organization ID 컬럼
 * @param existingConditions 기존 조건들 (선택사항)
 * @param orgId Organization ID (선택사항, 없으면 현재 사용자의 orgId 사용)
 * @returns AND 조건 객체
 * 
 * @example
 * ```typescript
 * import { addOrgFilter } from '@/lib/utils/org-isolation';
 * import { recipients } from '@/src/db';
 * import { like } from 'drizzle-orm';
 * 
 * const conditions = addOrgFilter(
 *   recipients.orgId,
 *   [like(recipients.name, '%검색어%')]
 * );
 * const result = await db.select().from(recipients).where(conditions);
 * ```
 */
export async function addOrgFilter(
  orgIdColumn: any,
  existingConditions: SQL[] = [],
  orgId?: string
): Promise<ReturnType<typeof and>> {
  const targetOrgId = orgId || (await requireOrgId());
  const orgCondition = eq(orgIdColumn, targetOrgId);
  
  if (existingConditions.length === 0) {
    return orgCondition as any;
  }
  
  return and(orgCondition, ...existingConditions) as any;
}

/**
 * 특정 리소스가 현재 사용자의 사업소에 속하는지 확인합니다.
 * 
 * @param resourceOrgId 확인할 리소스의 org_id
 * @returns true면 현재 사업소에 속함, false면 다른 사업소에 속함
 * 
 * @example
 * ```typescript
 * import { isResourceOwnedByCurrentOrg } from '@/lib/utils/org-isolation';
 * 
 * const recipient = await getRecipientById(id);
 * if (!isResourceOwnedByCurrentOrg(recipient.orgId)) {
 *   throw new Error('접근 권한이 없습니다.');
 * }
 * ```
 */
export async function isResourceOwnedByCurrentOrg(
  resourceOrgId: string
): Promise<boolean> {
  const currentOrgId = await getCurrentOrgId();
  if (!currentOrgId) {
    return false;
  }
  return resourceOrgId === currentOrgId;
}

/**
 * 리소스가 현재 사업소에 속하는지 확인하고, 아니면 에러를 던집니다.
 * 
 * @param resourceOrgId 확인할 리소스의 org_id
 * @throws Error 리소스가 현재 사업소에 속하지 않는 경우
 * 
 * @example
 * ```typescript
 * import { requireResourceOwnership } from '@/lib/utils/org-isolation';
 * 
 * const recipient = await getRecipientById(id);
 * requireResourceOwnership(recipient.orgId); // 에러 발생 시 예외 던짐
 * ```
 */
export async function requireResourceOwnership(
  resourceOrgId: string
): Promise<void> {
  const isOwned = await isResourceOwnedByCurrentOrg(resourceOrgId);
  if (!isOwned) {
    throw new Error("접근 권한이 없습니다. 다른 사업소의 데이터에 접근할 수 없습니다.");
  }
}

