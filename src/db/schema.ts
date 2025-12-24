/**
 * @file schema.ts
 * @description WeOps 데이터베이스 스키마 정의 (Drizzle ORM)
 *
 * 이 파일은 Neon 데이터베이스의 실제 구조를 Drizzle ORM으로 정의합니다.
 * 모든 테이블, 관계, 제약조건, 인덱스가 실제 DB 구조와 일치하도록 작성되었습니다.
 *
 * 주요 특징:
 * - 멀티테넌시: 모든 테이블에 org_id로 사업소별 데이터 격리
 * - Clerk 연동: users.clerk_user_id로 인증 시스템 연동
 * - WeGuard: orders 테이블의 금액 계산 필드 (total_amount, copay_amount, claim_amount)
 * - WeStock: assets 테이블의 상태 머신 (AVAILABLE → RENTED → RETURNING → SANITIZING)
 *
 * @dependencies
 * - drizzle-orm: Type-safe ORM
 * - drizzle-orm/pg-core: PostgreSQL 타입 정의
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
  date,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// 1. Organizations (사업소) - 멀티테넌시의 최상위 엔티티
// ============================================================================

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bizNumber: varchar("biz_number", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================================================
// 2. Users (사용자) - Clerk 인증 연동
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 })
      .default("STAFF")
      .$type<"OWNER" | "STAFF" | "DRIVER">(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    clerkUserIdIdx: uniqueIndex("users_clerk_user_id_key").on(
      table.clerkUserId,
    ),
    orgIdIdx: index("idx_users_org").on(table.orgId),
    clerkUserIdIdx2: index("idx_users_clerk").on(table.clerkUserId),
  }),
);

// ============================================================================
// 3. Recipients (수급자) - 어르신 정보
// ============================================================================

export const recipients = pgTable(
  "recipients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    ltcNumber: varchar("ltc_number", { length: 50 }).notNull(), // 장기요양인정번호
    copayRate: numeric("copay_rate", { precision: 3, scale: 1 }).notNull(), // 본인부담율 (15, 9, 6, 0)
    limitBalance: integer("limit_balance").default(1600000), // 연간 한도 잔액 (초기 160만원)
    expiryDate: date("expiry_date"), // 인정 유효기간 만료일
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    orgIdIdx: index("idx_recipients_org").on(table.orgId),
  }),
);

// ============================================================================
// 4. Products (제품 마스터) - 공단 고시 정보
// ============================================================================

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(), // 복지용구 코드 (예: WS-1234)
    name: varchar("name", { length: 255 }).notNull(),
    price: integer("price").notNull(), // 공단 고시가
    category: varchar("category", { length: 100 }), // 품목명 (전동침대 등)
    durabilityYears: integer("durability_years").default(0), // 내구연한 (년)
  },
  (table) => ({
    codeIdx: uniqueIndex("products_code_key").on(table.code),
    priceCheck: check("products_price_check", sql`${table.price} >= 0`),
  }),
);

// ============================================================================
// 5. Assets (자산) - WeStock 핵심, QR 기반 자산 관리
// ============================================================================

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "restrict",
    }),
    serialNumber: varchar("serial_number", { length: 100 }), // 제조사 시리얼
    qrCode: varchar("qr_code", { length: 255 }).unique(), // 고유 QR 코드
    status: varchar("status", { length: 20 })
      .default("AVAILABLE")
      .$type<"AVAILABLE" | "RENTED" | "SANITIZING" | "DISCARDED">(),
    currentRecipientId: uuid("current_recipient_id").references(
      () => recipients.id,
      { onDelete: "set null" },
    ), // 현재 누구 집에 있는지 (NULL이면 창고)
    lastSanitizedAt: timestamp("last_sanitized_at", { withTimezone: true }), // 마지막 소독일
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    qrCodeIdx: uniqueIndex("assets_qr_code_key").on(table.qrCode),
    orgIdIdx: index("idx_assets_org").on(table.orgId),
    qrCodeIdx2: index("idx_assets_qr").on(table.qrCode),
    statusIdx: index("idx_assets_status").on(table.status),
  }),
);

// ============================================================================
// 6. Orders (주문) - WeGuard 청구 방어 로직이 적용된 결과물
// ============================================================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => recipients.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }), // 주문을 처리한 직원
    totalAmount: integer("total_amount").notNull(), // 총액
    copayAmount: integer("copay_amount").notNull(), // 본인부담금 (10원 절사 적용됨)
    claimAmount: integer("claim_amount").notNull(), // 공단 청구액
    orderDate: date("order_date").defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    orgIdIdx: index("idx_orders_org").on(table.orgId),
    recipientIdIdx: index("idx_orders_recipient").on(table.recipientId),
    totalAmountCheck: check(
      "orders_total_amount_check",
      sql`${table.totalAmount} >= 0`,
    ),
    copayAmountCheck: check(
      "orders_copay_amount_check",
      sql`${table.copayAmount} >= 0`,
    ),
    claimAmountCheck: check(
      "orders_claim_amount_check",
      sql`${table.claimAmount} >= 0`,
    ),
  }),
);

// ============================================================================
// 7. Order Items (주문 상세) - 주문에 포함된 자산들
// ============================================================================

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").references(() => assets.id, {
      onDelete: "set null",
    }), // 대여 나간 자산
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "restrict",
    }), // 판매 품목일 경우 자산 ID 대신 코드 사용
    price: integer("price").notNull(), // 당시 단가
  },
  (table) => ({
    priceCheck: check("order_items_price_check", sql`${table.price} >= 0`),
  }),
);

// ============================================================================
// Relations (관계 정의) - Drizzle ORM의 관계 추론을 위한 정의
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  recipients: many(recipients),
  assets: many(assets),
  orders: many(orders),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  orders: many(orders),
}));

export const recipientsRelations = relations(recipients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [recipients.orgId],
    references: [organizations.id],
  }),
  assets: many(assets),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  assets: many(assets),
  orderItems: many(orderItems),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [assets.orgId],
    references: [organizations.id],
  }),
  product: one(products, {
    fields: [assets.productId],
    references: [products.id],
  }),
  currentRecipient: one(recipients, {
    fields: [assets.currentRecipientId],
    references: [recipients.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [orders.orgId],
    references: [organizations.id],
  }),
  recipient: one(recipients, {
    fields: [orders.recipientId],
    references: [recipients.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  asset: one(assets, {
    fields: [orderItems.assetId],
    references: [assets.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// Type Exports (타입 추출)
// ============================================================================

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Recipient = typeof recipients.$inferSelect;
export type NewRecipient = typeof recipients.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetStatus = Asset["status"];

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
