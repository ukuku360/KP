"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">정치 커뮤니티 플랫폼</CardTitle>
        <CardDescription>
          로그인하여 입법 과정에 참여하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
          className="w-full bg-[#FEE500] text-[#000000] hover:bg-[#FEE500]/90"
          size="lg"
        >
          <KakaoIcon className="mr-2 h-5 w-5" />
          카카오로 시작하기
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          소셜 로그인으로 간편하게 가입하세요
        </p>
      </CardContent>
    </Card>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.67 1.74 5.02 4.35 6.35L5 21l4.88-3.24c.7.16 1.41.24 2.12.24 5.52 0 10-3.48 10-8.5S17.52 3 12 3z" />
    </svg>
  );
}
