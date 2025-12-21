"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users, ThumbsUp, ThumbsDown } from "lucide-react";

interface Petition {
  id: string;
  petitionId: string;
  category: string;
  title: string;
  agreeCount: number;
  agreeGoal: number;
  progressRate: number;
  endDate: string;
  status: string;
  _count: {
    votes: number;
    comments: number;
  };
}

async function fetchPetitions(params: URLSearchParams): Promise<Petition[]> {
  const response = await fetch(`/api/petitions?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch petitions");
  return response.json();
}

export function PetitionList() {
  const searchParams = useSearchParams();

  const { data: petitions, isLoading, error } = useQuery({
    queryKey: ["petitions", searchParams.toString()],
    queryFn: () => fetchPetitions(searchParams),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-lg border bg-muted"
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

  if (!petitions || petitions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">등록된 청원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {petitions.map((petition) => (
        <PetitionCard key={petition.id} petition={petition} />
      ))}
    </div>
  );
}

function PetitionCard({ petition }: { petition: Petition }) {
  const daysLeft = Math.ceil(
    (new Date(petition.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysLeft < 0;
  const progressPercent = Math.min(
    (petition.agreeCount / petition.agreeGoal) * 100,
    100
  );

  return (
    <Link href={`/petitions/${petition.id}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={isExpired ? "secondary" : "default"}>
              {isExpired ? "종료" : `D-${daysLeft}`}
            </Badge>
            <Badge variant="outline">{petition.category}</Badge>
          </div>
          <CardTitle className="line-clamp-2 text-base">{petition.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">동의 진행률</span>
              <span className="font-medium">
                {petition.agreeCount.toLocaleString()} / {petition.agreeGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {progressPercent.toFixed(1)}%
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-blue-500" />
                {petition._count?.votes || 0}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(petition.endDate).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
