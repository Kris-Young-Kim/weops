/**
 * @file drizzle.config.ts
 * @description Drizzle Kit 설정 파일
 *
 * 마이그레이션 생성 및 스키마 관리를 위한 설정입니다.
 *
 * @see {@link docs/NEON_GUIDE.md} - Neon 사용 가이드
 */

import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// .env.local 파일에서 환경 변수 로드
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
