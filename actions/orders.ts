/**
 * @file orders.ts
 * @description Server Actions - 주문(Orders) 관리
 *
 * Neon DB의 orders 테이블과 연동하여 주문 조회, 생성 기능을 제공합니다.
 * WeGuard 청구 방어 로직이 포함되어 있습니다.
 *
 * @dependencies
 * - actions/auth: 사용자 인증 헬퍼
 * - src/db: Drizzle ORM 데이터베이스 연결
 */

"use server";

import { db, orders, orderItems, recipients, users } from "@/src/db";
import { eq, and, desc } from "drizzle-orm";
import { requireOrgId, getCurrentUser } from "./auth";
import type { NewOrder, NewOrderItem } from "@/src/db/schema";

/**
 * 현재 사업소의 최근 주문 목록을 조회합니다.
 * @param limit 조회할 최대 개수
 * @returns 주문 목록 (수급자 정보 포함)
 */
export async function getRecentOrders(limit: number = 10) {
  console.group("[Server Action] getRecentOrders");
  console.log("Limit:", limit);
  
  try {
    const orgId = await requireOrgId();

    const result = await db
      .select({
        id: orders.id,
        recipientId: orders.recipientId,
        userId: orders.userId,
        totalAmount: orders.totalAmount,
        copayAmount: orders.copayAmount,
        claimAmount: orders.claimAmount,
        orderDate: orders.orderDate,
        createdAt: orders.createdAt,
        recipient: recipients,
        user: users,
      })
      .from(orders)
      .leftJoin(recipients, eq(orders.recipientId, recipients.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.orgId, orgId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    console.log(`Found ${result.length} orders`);
    console.groupEnd();
    
    return result;
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 특정 주문을 ID로 조회합니다.
 * @param orderId 주문 ID
 * @returns 주문 정보 (주문 상세 포함) 또는 null
 */
export async function getOrderById(orderId: string) {
  console.group("[Server Action] getOrderById");
  console.log("Order ID:", orderId);
  
  try {
    const orgId = await requireOrgId();

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.orgId, orgId)))
      .limit(1);

    if (!order) {
      console.log("Order not found");
      console.groupEnd();
      return null;
    }

    // 주문 상세 조회
    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    console.log(`Found order with ${orderItemsList.length} items`);
    console.groupEnd();
    
    return {
      ...order,
      items: orderItemsList,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 새 주문을 생성합니다.
 * WeGuard 청구 방어 로직이 포함되어 있습니다.
 * @param orderData 주문 데이터
 * @param items 주문 상세 항목들
 * @returns 생성된 주문 정보
 */
export async function createOrder(
  orderData: Omit<NewOrder, "orgId" | "userId">,
  items: Omit<NewOrderItem, "orderId">[]
) {
  console.group("[Server Action] createOrder");
  console.log("Order data:", orderData);
  console.log("Items count:", items.length);
  
  try {
    const orgId = await requireOrgId();
    const currentUser = await getCurrentUser();

    // 수급자 정보 조회 (한도 확인용)
    const [recipient] = await db
      .select()
      .from(recipients)
      .where(and(
        eq(recipients.id, orderData.recipientId),
        eq(recipients.orgId, orgId)
      ))
      .limit(1);

    if (!recipient) {
      throw new Error("수급자를 찾을 수 없습니다.");
    }

    // WeGuard: 한도 초과 확인
    const totalAmount = orderData.totalAmount;
    const copayAmount = orderData.copayAmount;
    
    if (recipient.limitBalance < copayAmount) {
      throw new Error(
        `한도 초과: 잔여 한도 ${recipient.limitBalance.toLocaleString()}원, 필요 금액 ${copayAmount.toLocaleString()}원`
      );
    }

    console.log("WeGuard check passed");
    console.log(`Remaining limit: ${recipient.limitBalance - copayAmount}`);

    // 트랜잭션으로 주문 생성 및 한도 차감
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...orderData,
        orgId,
        userId: currentUser?.id || null,
      })
      .returning();

    // 주문 상세 생성
    await db.insert(orderItems).values(
      items.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }))
    );

    // 수급자 한도 차감
    await db
      .update(recipients)
      .set({
        limitBalance: recipient.limitBalance - copayAmount,
      })
      .where(eq(recipients.id, recipient.id));

    console.log("Order created successfully:", newOrder.id);
    console.groupEnd();
    
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    console.groupEnd();
    throw error;
  }
}

