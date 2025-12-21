"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STANCE_LABELS = [
  { value: 1, label: "강력 반대", color: "bg-red-600" },
  { value: 2, label: "반대", color: "bg-red-400" },
  { value: 3, label: "중립", color: "bg-gray-400" },
  { value: 4, label: "찬성", color: "bg-blue-400" },
  { value: 5, label: "강력 찬성", color: "bg-blue-600" },
];

interface VoteStats {
  total: number;
  distribution: number[];
}

export function BillVoting({
  billId,
  voteStats,
}: {
  billId: string;
  voteStats: VoteStats;
}) {
  const { data: session } = useSession();
  const [selectedStance, setSelectedStance] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (stance: number) => {
      const response = await fetch(`/api/bills/${billId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stance }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill", billId] });
    },
  });

  const handleVote = (stance: number) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    setSelectedStance(stance);
    voteMutation.mutate(stance);
  };

  const maxVotes = Math.max(...voteStats.distribution, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">의견 투표</CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {voteStats.total}명이 투표했습니다
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {STANCE_LABELS.map((stance, index) => (
            <div key={stance.value} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{stance.label}</span>
                <span className="text-muted-foreground">
                  {voteStats.distribution[index]}표
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", stance.color)}
                  style={{
                    width: `${(voteStats.distribution[index] / maxVotes) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium">투표하기</p>
          <div className="flex flex-wrap gap-2">
            {STANCE_LABELS.map((stance) => (
              <Button
                key={stance.value}
                variant={selectedStance === stance.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(stance.value)}
                disabled={voteMutation.isPending}
                className={cn(
                  selectedStance === stance.value && stance.color,
                  "text-xs"
                )}
              >
                {stance.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
