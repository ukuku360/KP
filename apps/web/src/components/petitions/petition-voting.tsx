"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteStats {
  total: number;
  agree: number;
  disagree: number;
}

export function PetitionVoting({
  petitionId,
  voteStats,
}: {
  petitionId: string;
  voteStats: VoteStats;
}) {
  const { data: session } = useSession();
  const [selectedStance, setSelectedStance] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (stance: string) => {
      const response = await fetch(`/api/petitions/${petitionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stance }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petition", petitionId] });
    },
  });

  const handleVote = (stance: string) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    setSelectedStance(stance);
    voteMutation.mutate(stance);
  };

  const agreePercent = voteStats.total > 0 ? (voteStats.agree / voteStats.total) * 100 : 50;
  const disagreePercent = 100 - agreePercent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">플랫폼 내 의견</CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {voteStats.total}명이 의견을 표명했습니다
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-blue-600">
              <ThumbsUp className="h-4 w-4" />
              찬성
            </span>
            <span className="font-medium">{voteStats.agree}표 ({agreePercent.toFixed(1)}%)</span>
          </div>
          <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${agreePercent}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${disagreePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-red-600">
              <ThumbsDown className="h-4 w-4" />
              반대
            </span>
            <span className="font-medium">{voteStats.disagree}표 ({disagreePercent.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium">의견 표명하기</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedStance === "agree" ? "default" : "outline"}
              onClick={() => handleVote("agree")}
              disabled={voteMutation.isPending}
              className={cn(
                "gap-2",
                selectedStance === "agree" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              찬성
            </Button>
            <Button
              variant={selectedStance === "disagree" ? "default" : "outline"}
              onClick={() => handleVote("disagree")}
              disabled={voteMutation.isPending}
              className={cn(
                "gap-2",
                selectedStance === "disagree" && "bg-red-600 hover:bg-red-700"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              반대
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
