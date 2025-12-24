export default function HomePage() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-h1 text-gray-100">환영합니다!</h1>
        <p className="text-body-2 text-gray-70">
          Next.js 15 boilerplate가 성공적으로 설정되었습니다.
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="text-h2 text-gray-100">설정된 기능</h2>
          <ul className="flex flex-col gap-2 text-body-2 text-gray-70">
            <li>✅ Next.js 15 (App Router)</li>
            <li>✅ TypeScript</li>
            <li>✅ Tailwind CSS</li>
            <li>✅ React Query</li>
            <li>✅ next-themes (다크모드)</li>
            <li>✅ Supabase 클라이언트</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
