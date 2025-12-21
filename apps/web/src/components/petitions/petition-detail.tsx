"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, CalendarDays, Hash } from "lucide-react";

interface Petition {
  id: string;
  petitionId: string;
  category: string;
  title: string;
  content: string;
  hashtags: string[];
  agreeCount: number;
  agreeGoal: number;
  progressRate: number;
  startDate: Date;
  endDate: Date;
  status: string;
  sourceUrl: string | null;
}

export function PetitionDetail({ petition }: { petition: Petition }) {
  const daysLeft = Math.ceil(
    (new Date(petition.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysLeft < 0;
  const progressPercent = Math.min(
    (petition.agreeCount / petition.agreeGoal) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={isExpired ? "secondary" : "default"} className="text-sm">
              {isExpired ? "종료됨" : `D-${daysLeft}`}
            </Badge>
            <Badge variant="outline">{petition.category}</Badge>
            <Badge variant="secondary">{petition.status}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{petition.title}</h1>
          <p className="text-muted-foreground mt-1">
            청원번호: {petition.petitionId}
          </p>
        </div>
        {petition.sourceUrl && (
          <Button variant="outline" asChild>
            <a href={petition.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              원문 보기
            </a>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">동의 현황</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>현재 동의자 수</span>
            <span className="font-bold text-primary">
              {petition.agreeCount.toLocaleString()}명
            </span>
          </div>
          <Progress value={progressPercent} className="h-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>목표: {petition.agreeGoal.toLocaleString()}명</span>
            <span>{progressPercent.toFixed(1)}% 달성</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          청원 기간: {new Date(petition.startDate).toLocaleDateString("ko-KR")} ~{" "}
          {new Date(petition.endDate).toLocaleDateString("ko-KR")}
        </span>
      </div>

      {petition.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {petition.hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              <Hash className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>청원 내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {petition.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
