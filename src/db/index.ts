/**
 * @file index.ts
 * @description Drizzle ORM 데이터베이스 연결 설정
 *
 * Neon Serverless PostgreSQL과의 연결을 설정합니다.
 * 프로덕션 환경에서는 Connection Pooling을 사용하여 성능을 최적화합니다.
 *
 * @dependencies
 * - drizzle-orm/postgres-js: PostgreSQL 드라이버
 * - postgres: PostgreSQL 클라이언트
 * - @neondatabase/serverless: Neon 최적화 클라이언트 (선택사항)
 *
 * @see {@link docs/NEON_GUIDE.md} - Neon 사용 가이드
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection Pooling 사용 (프로덕션)
// 개발 환경에서는 직접 연결, 프로덕션에서는 Pooling URL 사용
const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_POOL_URL || process.env.DATABASE_URL!
    : process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
}

// PostgreSQL 클라이언트 생성
// Serverless 환경에서는 max: 1로 설정 (연결 수 제한)
const client = postgres(connectionString, {
  max: 1, // Serverless 환경에서는 1로 설정
  idle_timeout: 20, // 20초 후 연결 종료
  connect_timeout: 10, // 10초 연결 타임아웃
});

// Drizzle ORM 인스턴스 생성
export const db = drizzle(client, { schema });

// 스키마 export (다른 파일에서 사용 가능)
export * from "./schema";

