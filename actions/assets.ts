/**
 * @file assets.ts
 * @description Server Actions - 자산(Assets) 관리
 *
 * Neon DB의 assets 테이블과 연동하여 자산 조회, 생성, 수정, 삭제 기능을 제공합니다.
 * 모든 쿼리는 현재 사용자의 org_id로 자동 필터링됩니다.
 *
 * @dependencies
 * - actions/auth: 사용자 인증 헬퍼
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

"use server";

import { db, assets, products, recipients } from "@/src/db";
import { eq, and, desc, like, or } from "drizzle-orm";
import { requireOrgId } from "./auth";
import type { Asset, AssetStatus, NewAsset } from "@/src/db/schema";

/**
 * 현재 사업소의 모든 자산을 조회합니다.
 * @param options 검색 옵션
 * @returns 자산 목록 (제품 정보 포함)
 */
export async function getAssets(options?: {
  status?: AssetStatus;
  search?: string;
  limit?: number;
}) {
  console.group("[Server Action] getAssets");
  console.log("Options:", options);
  
  try {
    const orgId = await requireOrgId();
    console.log("Current orgId:", orgId);

    let query = db
      .select({
        id: assets.id,
        orgId: assets.orgId,
        productId: assets.productId,
        serialNumber: assets.serialNumber,
        qrCode: assets.qrCode,
        status: assets.status,
        currentRecipientId: assets.currentRecipientId,
        lastSanitizedAt: assets.lastSanitizedAt,
        updatedAt: assets.updatedAt,
        // 제품 정보
        productName: products.name,
        productCode: products.code,
        productPrice: products.price,
        // 수급자 정보
        recipientName: recipients.name,
      })
      .from(assets)
      .leftJoin(products, eq(assets.productId, products.id))
      .leftJoin(recipients, eq(assets.currentRecipientId, recipients.id))
      .where(eq(assets.orgId, orgId));

    // 상태 필터
    if (options?.status) {
      query = query.where(and(eq(assets.orgId, orgId), eq(assets.status, options.status)));
    }

    // 검색 필터 (제품명, 시리얼번호, QR코드)
    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      query = query.where(
        and(
          eq(assets.orgId, orgId),
          or(
            like(products.name, searchPattern),
            like(assets.serialNumber, searchPattern),
            like(assets.qrCode, searchPattern)
          )
        )
      );
    }

    // 정렬 및 제한
    query = query.orderBy(desc(assets.updatedAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const result = await query;
    console.log(`Found ${result.length} assets`);
    console.groupEnd();
    
    return result;
  } catch (error) {
    console.error("Error fetching assets:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 특정 자산을 ID로 조회합니다.
 * @param assetId 자산 ID
 * @returns 자산 정보 또는 null
 */
export async function getAssetById(assetId: string) {
  console.group("[Server Action] getAssetById");
  console.log("Asset ID:", assetId);
  
  try {
    const orgId = await requireOrgId();

    const [asset] = await db
      .select({
        id: assets.id,
        orgId: assets.orgId,
        productId: assets.productId,
        serialNumber: assets.serialNumber,
        qrCode: assets.qrCode,
        status: assets.status,
        currentRecipientId: assets.currentRecipientId,
        lastSanitizedAt: assets.lastSanitizedAt,
        updatedAt: assets.updatedAt,
        product: products,
        recipient: recipients,
      })
      .from(assets)
      .leftJoin(products, eq(assets.productId, products.id))
      .leftJoin(recipients, eq(assets.currentRecipientId, recipients.id))
      .where(and(eq(assets.id, assetId), eq(assets.orgId, orgId)))
      .limit(1);

    console.log("Asset found:", asset ? "Yes" : "No");
    console.groupEnd();
    
    return asset || null;
  } catch (error) {
    console.error("Error fetching asset:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 새 자산을 생성합니다.
 * @param data 자산 데이터
 * @returns 생성된 자산 정보
 */
export async function createAsset(data: NewAsset) {
  console.group("[Server Action] createAsset");
  console.log("Asset data:", data);
  
  try {
    const orgId = await requireOrgId();

    const [newAsset] = await db
      .insert(assets)
      .values({
        ...data,
        orgId, // 현재 사업소 ID로 자동 설정
      })
      .returning();

    console.log("Asset created:", newAsset.id);
    console.groupEnd();
    
    return newAsset;
  } catch (error) {
    console.error("Error creating asset:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 자산의 상태를 업데이트합니다.
 * @param assetId 자산 ID
 * @param status 새로운 상태
 * @returns 업데이트된 자산 정보
 */
export async function updateAssetStatus(
  assetId: string,
  status: AssetStatus
) {
  console.group("[Server Action] updateAssetStatus");
  console.log("Asset ID:", assetId, "New status:", status);
  
  try {
    const orgId = await requireOrgId();

    const [updatedAsset] = await db
      .update(assets)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(assets.id, assetId), eq(assets.orgId, orgId)))
      .returning();

    if (!updatedAsset) {
      throw new Error("자산을 찾을 수 없습니다.");
    }

    console.log("Asset status updated");
    console.groupEnd();
    
    return updatedAsset;
  } catch (error) {
    console.error("Error updating asset status:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 자산을 삭제합니다.
 * @param assetId 자산 ID
 */
export async function deleteAsset(assetId: string) {
  console.group("[Server Action] deleteAsset");
  console.log("Asset ID:", assetId);
  
  try {
    const orgId = await requireOrgId();

    await db
      .delete(assets)
      .where(and(eq(assets.id, assetId), eq(assets.orgId, orgId)));

    console.log("Asset deleted");
    console.groupEnd();
  } catch (error) {
    console.error("Error deleting asset:", error);
    console.groupEnd();
    throw error;
  }
}

