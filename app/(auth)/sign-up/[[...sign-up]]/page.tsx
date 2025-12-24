import { SignUp } from "@clerk/nextjs";

/**
 * @file page.tsx
 * @description 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용하여 회원가입 페이지를 제공합니다.
 * Next.js 16 App Router의 동적 라우팅을 사용하여 Clerk의 인증 플로우를 지원합니다.
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-up} - Clerk SignUp 컴포넌트 문서
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
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

