import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@politics/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Heart, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

async function getBadgeBySessionId(sessionId: string, userId: string) {
  return prisma.supporterBadge.findFirst({
    where: {
      stripeSessionId: sessionId,
      userId,
    },
    include: {
      politician: {
        select: { name: true, party: true },
      },
    },
  });
}

export default async function BadgeSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { session_id } = searchParams;

  if (!session_id) {
    redirect("/badge");
  }

  // Webhook이 처리될 때까지 약간의 지연이 있을 수 있음
  // 최대 5초간 폴링
  let badge = null;
  for (let i = 0; i < 5; i++) {
    badge = await getBadgeBySessionId(session_id, session.user.id);
    if (badge) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return (
    <div className="max-w-2xl mx-auto py-16">
      <Card className="text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">결제가 완료되었습니다!</CardTitle>
          <CardDescription>
            뱃지가 성공적으로 활성화되었습니다
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {badge ? (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center gap-3">
                {badge.badgeType === "SUPPORTER" ? (
                  <Badge variant="outline" className="px-4 py-2 text-lg gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    서포터 뱃지
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-4 py-2 text-lg gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    {badge.politician?.name} 팬 뱃지
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground">
                유효기간: {new Date(badge.expiresAt).toLocaleDateString("ko-KR")}까지
              </p>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p>이제 닉네임 옆에 뱃지가 표시됩니다.</p>
                <p>커뮤니티 활동을 통해 뱃지를 자랑해보세요!</p>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <p className="text-muted-foreground">
                결제 처리 중입니다. 잠시 후 뱃지가 활성화됩니다.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild>
              <Link href="/community">
                커뮤니티 가기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/badge">뱃지 더보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

