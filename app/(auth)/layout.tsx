/**
 * @file layout.tsx
 * @description 인증 페이지 레이아웃
 *
 * 로그인 및 회원가입 페이지를 위한 공통 레이아웃입니다.
 * 인증이 필요한 페이지는 이 레이아웃을 사용합니다.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

