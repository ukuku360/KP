"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-4xl font-bold text-destructive">
              오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground">
              예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
