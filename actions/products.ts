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
import { eq, like, or, desc } from "drizzle-orm";
import type { Product, NewProduct } from "@/src/db/schema";

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
    let query = db.select().from(products);

    // 검색 필터 (제품명, 코드, 카테고리)
    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      query = query.where(
        or(
          like(products.name, searchPattern),
          like(products.code, searchPattern),
          like(products.category || "", searchPattern)
        )
      );
    }

    // 카테고리 필터
    if (options?.category) {
      query = query.where(like(products.category || "", `%${options.category}%`));
    }

    // 정렬 및 제한
    query = query.orderBy(desc(products.name));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const result = await query;
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

