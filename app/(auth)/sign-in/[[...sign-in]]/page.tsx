import { SignIn } from "@clerk/nextjs";

/**
 * @file page.tsx
 * @description 로그인 페이지
 *
 * Clerk의 SignIn 컴포넌트를 사용하여 로그인 페이지를 제공합니다.
 * Next.js 16 App Router의 동적 라우팅을 사용하여 Clerk의 인증 플로우를 지원합니다.
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-in} - Clerk SignIn 컴포넌트 문서
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}

