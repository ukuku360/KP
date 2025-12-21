"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MessageSquare, Users } from "lucide-react";

interface Bill {
  id: string;
  billNumber: string;
  billName: string;
  proposerType: string;
  committee: string;
  noticeEnd: string;
  opinionCount: number;
  status: string;
  _count: {
    votes: number;
    comments: number;
  };
}

async function fetchBills(params: URLSearchParams): Promise<Bill[]> {
  const response = await fetch(`/api/bills?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch bills");
  return response.json();
}

export function BillList() {
  const searchParams = useSearchParams();

  const { data: bills, isLoading, error } = useQuery({
    queryKey: ["bills", searchParams.toString()],
    queryFn: () => fetchBills(searchParams),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">등록된 법안이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bills.map((bill) => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  const daysLeft = Math.ceil(
    (new Date(bill.noticeEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysLeft < 0;

  return (
    <Link href={`/bills/${bill.id}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={isExpired ? "secondary" : "default"}>
              {isExpired ? "종료" : `D-${daysLeft}`}
            </Badge>
            <Badge variant="outline">{bill.committee}</Badge>
          </div>
          <CardTitle className="line-clamp-2 text-base">{bill.billName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {bill._count?.votes || 0} 투표
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {bill._count?.comments || 0} 댓글
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(bill.noticeEnd).toLocaleDateString("ko-KR")} 마감
            </div>
            <p className="text-xs">
              {bill.proposerType} | {bill.billNumber}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
