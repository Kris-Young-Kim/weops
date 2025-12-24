/**
 * @file products.ts
 * @description Server Actions - 제품(Products) 마스터 관리
 *
 * Neon DB의 products 테이블과 연동하여 제품 조회 기능을 제공합니다.
 * products는 전역 마스터 데이터이므로 org_id 필터링이 필요 없습니다.
 *
 * @dependencies
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

"use server";

import { db, products } from "@/src/db";
import { eq, like, or, desc, and } from "drizzle-orm";
/**
 * 모든 제품을 조회합니다.
 * @param options 검색 옵션
 * @returns 제품 목록
 */
export async function getProducts(options?: {
  search?: string;
  category?: string;
  limit?: number;
}) {
  console.group("[Server Action] getProducts");
  console.log("Options:", options);
  
  try {
    // 조건 배열 구성
    const conditions: ReturnType<typeof like>[] = [];
    
    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          like(products.name, searchPattern),
          like(products.code, searchPattern),
          like(products.category || "", searchPattern)
        )!
      );
    }
    
    if (options?.category) {
      conditions.push(like(products.category || "", `%${options.category}%`)!);
    }

    const baseQuery = db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.name));
    
    const result = options?.limit 
      ? await baseQuery.limit(options.limit)
      : await baseQuery;
    console.log(`Found ${result.length} products`);
    console.groupEnd();
    
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 특정 제품을 ID로 조회합니다.
 * @param productId 제품 ID
 * @returns 제품 정보 또는 null
 */
export async function getProductById(productId: string) {
  console.group("[Server Action] getProductById");
  console.log("Product ID:", productId);
  
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    console.log("Product found:", product ? "Yes" : "No");
    console.groupEnd();
    
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 제품 코드로 제품을 조회합니다.
 * @param code 제품 코드
 * @returns 제품 정보 또는 null
 */
export async function getProductByCode(code: string) {
  console.group("[Server Action] getProductByCode");
  console.log("Product code:", code);
  
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.code, code))
      .limit(1);

    console.log("Product found:", product ? "Yes" : "No");
    console.groupEnd();
    
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    console.groupEnd();
    throw error;
  }
}

