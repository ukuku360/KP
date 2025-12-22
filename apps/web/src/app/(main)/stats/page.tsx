import { prisma } from "@politics/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { BillStatsChart } from "@/components/stats/bill-stats-chart";
import { PetitionStatsChart } from "@/components/stats/petition-stats-chart";
import { CategoryDistribution } from "@/components/stats/category-distribution";
import { FileText, ScrollText, Users, TrendingUp, type LucideIcon } from "lucide-react";

async function getStats() {
  const [
      billCount,
      petitionCount,
      userCount,
      billsByCommittee,
      petitionsByCategory,
    ] = await Promise.all([
      prisma.bill.count(),
      prisma.petition.count(),
      prisma.user.count(),
      prisma.bill.groupBy({
        by: ["committee"],
        _count: { id: true },
      }),
      prisma.petition.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
    ]);

    return {
      billCount,
      petitionCount,
      userCount,
      billsByCommittee: billsByCommittee.map((item) => ({
        name: item.committee,
        count: item._count.id,
      })),
      petitionsByCategory: petitionsByCategory.map((item) => ({
        name: item.category,
        count: item._count.id,
      })),
    };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">정치관련통계</h1>
        <p className="text-muted-foreground mt-2">
          법안과 청원에 대한 다양한 통계를 확인하세요
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="총 법안 수"
          value={stats.billCount}
          icon={FileText}
          description="입법예고 중인 법안"
        />
        <StatCard
          title="총 청원 수"
          value={stats.petitionCount}
          icon={ScrollText}
          description="등록된 국민청원"
        />
        <StatCard
          title="가입자 수"
          value={stats.userCount}
          icon={Users}
          description="플랫폼 이용자"
        />
        <StatCard
          title="참여율"
          value="0%"
          icon={TrendingUp}
          description="전체 참여율"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>소관위원회별 법안 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <BillStatsChart data={stats.billsByCommittee} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>분야별 청원 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <PetitionStatsChart data={stats.petitionsByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistribution
          title="법안 위원회 분포"
          data={stats.billsByCommittee}
        />
        <CategoryDistribution
          title="청원 분야 분포"
          data={stats.petitionsByCategory}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
