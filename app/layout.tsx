import type { Metadata } from "next";
import type React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeOps - 복지용구 운영의 표준",
  description: "복지용구 대여 및 재고 관리를 위한 통합 관리 시스템. 복지용구 운영의 표준, WeOps",
  generator: "WeOps",
  keywords: ["복지용구", "재고관리", "WeOps", "의료용품", "대여관리"],
  authors: [{ name: "WeOps Team" }],
  creator: "WeOps",
  publisher: "WeOps",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "WeOps - 복지용구 운영의 표준",
    description: "복지용구 대여 및 재고 관리를 위한 통합 관리 시스템",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "WeOps",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WeOps",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeOps - 복지용구 운영의 표준",
    description: "복지용구 대여 및 재고 관리를 위한 통합 관리 시스템",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body className="font-sans antialiased">
          <SyncUserProvider>{children}</SyncUserProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
