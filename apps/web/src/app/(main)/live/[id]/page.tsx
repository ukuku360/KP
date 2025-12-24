"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Radio,
  ArrowLeft,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
  Square,
} from "lucide-react";
import { LiveChat } from "@/components/live/live-chat";

interface LiveRoomDetail {
  room: {
    id: string;
    title: string;
    description: string | null;
    topicType: string;
    topicId: string | null;
    status: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  stats: {
    proCount: number;
    conCount: number;
    neutralCount: number;
    totalVotes: number;
  };
  messages: Array<{
    id: string;
    content: string;
    stance: "PRO" | "CON" | "NEUTRAL";
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  userVote: "PRO" | "CON" | "NEUTRAL" | null;
}

const TOPIC_TYPE_LABELS: Record<string, string> = {
  FREE: "자유토론",
  BILL: "법안토론",
  PETITION: "청원토론",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  WAITING: { label: "대기중", variant: "secondary" },
  ACTIVE: { label: "진행중", variant: "default" },
  ENDED: { label: "종료", variant: "destructive" },
};

async function fetchRoomDetail(id: string): Promise<LiveRoomDetail> {
  const response = await fetch(`/api/live/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("토론방을 찾을 수 없습니다");
    }
    throw new Error("토론방 정보를 불러오는데 실패했습니다");
  }
  return response.json();
}

export default function LiveRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const roomId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["liveRoom", roomId],
    queryFn: () => fetchRoomDetail(roomId),
    refetchInterval: 5000, // 5초마다 통계 갱신
  });

  const voteMutation = useMutation({
    mutationFn: async (stance: "PRO" | "CON" | "NEUTRAL") => {
      const response = await fetch(`/api/live/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stance }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "투표 실패");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["liveRoom", roomId], (old: LiveRoomDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          stats: data.stats,
          userVote: data.vote.stance,
        };
      });
    },
  });

  const endRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/live/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "토론 종료 실패");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveRoom", roomId] });
    },
  });

  const handleStanceChange = (stance: "PRO" | "CON" | "NEUTRAL") => {
    if (!session) return;
    voteMutation.mutate(stance);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive mb-4">
            {error instanceof Error ? error.message : "오류가 발생했습니다"}
          </p>
          <Button variant="outline" onClick={() => router.push("/live")}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const { room, stats, messages, userVote } = data;
  const statusConfig = STATUS_LABELS[room.status] || STATUS_LABELS.WAITING;
  const isCreator = session?.user?.id === room.createdBy.id;
  const canEnd = isCreator && room.status !== "ENDED";

  const totalVotes = stats.proCount + stats.conCount + stats.neutralCount;
  const proPercent = totalVotes > 0 ? Math.round((stats.proCount / totalVotes) * 100) : 0;
  const conPercent = totalVotes > 0 ? Math.round((stats.conCount / totalVotes) * 100) : 0;
  const neutralPercent = totalVotes > 0 ? Math.round((stats.neutralCount / totalVotes) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Link
          href="/live"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
        {canEnd && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("토론을 종료하시겠습니까? 종료된 토론은 다시 시작할 수 없습니다.")) {
                endRoomMutation.mutate();
              }
            }}
            disabled={endRoomMutation.isPending}
          >
            {endRoomMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Square className="h-4 w-4 mr-1" />
            )}
            토론 종료
          </Button>
        )}
      </div>

      {/* 토론 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {room.status === "ACTIVE" && (
                  <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                )}
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                <Badge variant="outline">
                  {TOPIC_TYPE_LABELS[room.topicType] || room.topicType}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{room.title}</CardTitle>
              {room.description && (
                <p className="text-muted-foreground">{room.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={room.createdBy.image || undefined} />
                <AvatarFallback>
                  {room.createdBy.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {room.createdBy.name || "익명"}
              </span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                {new Date(room.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              참여 {totalVotes}명
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 투표 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">실시간 여론</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <ThumbsUp className="h-5 w-5" />
                <span className="font-bold text-xl">{proPercent}%</span>
              </div>
              <p className="text-sm text-muted-foreground">찬성 {stats.proCount}명</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Minus className="h-5 w-5" />
                <span className="font-bold text-xl">{neutralPercent}%</span>
              </div>
              <p className="text-sm text-muted-foreground">중립 {stats.neutralCount}명</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <ThumbsDown className="h-5 w-5" />
                <span className="font-bold text-xl">{conPercent}%</span>
              </div>
              <p className="text-sm text-muted-foreground">반대 {stats.conCount}명</p>
            </div>
          </div>

          {/* 비율 바 */}
          <div className="h-4 rounded-full overflow-hidden bg-muted flex">
            {stats.proCount > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${proPercent}%` }}
              />
            )}
            {stats.neutralCount > 0 && (
              <div
                className="bg-gray-400 transition-all"
                style={{ width: `${neutralPercent}%` }}
              />
            )}
            {stats.conCount > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${conPercent}%` }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 실시간 채팅 */}
      <LiveChat
        roomId={roomId}
        roomStatus={room.status}
        initialMessages={messages}
        userStance={userVote}
        onStanceChange={handleStanceChange}
      />
    </div>
  );
}
