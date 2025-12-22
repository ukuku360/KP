import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@politics/database";
import { BadgePurchaseCard } from "@/components/badge/badge-purchase-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Star, Heart, LogIn, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

async function getUserBadges(userId: string) {
  return prisma.supporterBadge.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    include: {
      politician: {
        select: { id: true, name: true, party: true },
      },
    },
  });
}

async function getPopularPoliticians() {
  return prisma.politician.findMany({
    take: 6,
    orderBy: { name: "asc" },
  });
}

export default async function BadgePage() {
  const session = await auth();
  const [userBadges, politicians] = await Promise.all([
    session?.user?.id ? getUserBadges(session.user.id) : [],
    getPopularPoliticians(),
  ]);

  const hasSupporter = userBadges.some((b) => b.badgeType === "SUPPORTER");
  const ownedPoliticianIds = new Set(
    userBadges.filter((b) => b.badgeType === "POLITICIAN_FAN").map((b) => b.politicianId)
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">서포터 뱃지</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          뱃지를 구매하면 닉네임 옆에 특별한 뱃지가 표시됩니다.<br />
          정치에 관심 있는 사용자임을 나타내보세요!
        </p>
      </div>

      {/* 로그인 필요 안내 */}
      {!session && (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground mb-4">
              뱃지를 구매하려면 먼저 로그인해주세요
            </p>
            <Button asChild>
              <Link href="/login">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 내 뱃지 현황 */}
      {session && userBadges.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">내 뱃지</h2>
          <div className="flex flex-wrap gap-3">
            {userBadges.map((badge) => (
              <Badge
                key={badge.id}
                variant="outline"
                className="px-4 py-2 text-base gap-2"
              >
                {badge.badgeType === "SUPPORTER" ? (
                  <Star className="h-4 w-4 text-blue-500" />
                ) : (
                  <Heart className="h-4 w-4 text-pink-500" />
                )}
                {badge.badgeType === "SUPPORTER"
                  ? "서포터"
                  : `${badge.politician?.name} 팬`}
                <span className="text-xs text-muted-foreground">
                  (~{new Date(badge.expiresAt).toLocaleDateString("ko-KR")})
                </span>
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* 뱃지 구매 섹션 */}
      {session && (
        <>
          {/* 서포터 뱃지 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">플랫폼 서포터 뱃지</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BadgePurchaseCard type="SUPPORTER" isOwned={hasSupporter} />
            </div>
          </section>

          {/* 정치인 팬 뱃지 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">정치인 팬 뱃지</h2>
            <p className="text-muted-foreground mb-6">
              응원하는 정치인의 팬 뱃지를 구매하세요
            </p>
            {politicians.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    등록된 정치인이 없습니다
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {politicians.map((politician) => (
                  <BadgePurchaseCard
                    key={politician.id}
                    type="POLITICIAN_FAN"
                    politicianId={politician.id}
                    politicianName={politician.name}
                    politicianParty={politician.party}
                    isOwned={ownedPoliticianIds.has(politician.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* 안내사항 */}
      <section className="bg-muted/30 rounded-lg p-6">
        <h3 className="font-semibold mb-3">안내사항</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• 뱃지는 구매일로부터 30일간 유효합니다.</li>
          <li>• 결제 완료 후 즉시 뱃지가 활성화됩니다.</li>
          <li>• 환불은 구매 후 7일 이내에만 가능합니다.</li>
          <li>• 문의사항은 고객센터로 연락해주세요.</li>
        </ul>
      </section>
    </div>
  );
}

