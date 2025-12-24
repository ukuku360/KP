"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radio,
  Users,
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";

interface LiveRoom {
  id: string;
  title: string;
  description: string | null;
  topicType: string;
  status: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  stats: {
    messageCount: number;
    voteCount: number;
    proCount: number;
    conCount: number;
  };
}

interface LiveRoomsResponse {
  rooms: LiveRoom[];
  total: number;
  hasMore: boolean;
}

const TOPIC_TYPES = [
  { id: "FREE", name: "자유토론", description: "자유 주제로 토론" },
  { id: "BILL", name: "법안토론", description: "입법예고 법안 관련" },
  { id: "PETITION", name: "청원토론", description: "국민동의청원 관련" },
];

async function fetchLiveRooms(): Promise<LiveRoomsResponse> {
  const response = await fetch("/api/live");
  if (!response.ok) throw new Error("Failed to fetch rooms");
  return response.json();
}

export default function LivePage() {
  const { data: session } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({
    title: "",
    description: "",
    topicType: "FREE",
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["liveRooms"],
    queryFn: fetchLiveRooms,
    refetchInterval: 10000, // 10초마다 자동 새로고침
  });

  const handleCreateRoom = async () => {
    if (!newRoom.title.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "토론방 생성 실패");
      }

      setNewRoom({ title: "", description: "", topicType: "FREE" });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      console.error("토론방 생성 오류:", error);
      alert(error instanceof Error ? error.message : "토론방 생성에 실패했습니다");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8">
      <div className="flex flex-col items-center text-center space-y-6">
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            <span className="text-red-500 font-semibold">LIVE</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">실시간 토론방</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            지금 바로 참여하여 실시간으로 의견을 나눠보세요
          </p>
        </div>

        {session ? (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                토론방 만들기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 토론방 만들기</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">토론 주제</label>
                  <Input
                    placeholder="토론 주제를 입력하세요"
                    value={newRoom.title}
                    onChange={(e) =>
                      setNewRoom((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">설명 (선택)</label>
                  <Textarea
                    placeholder="토론에 대한 간단한 설명을 입력하세요"
                    value={newRoom.description}
                    onChange={(e) =>
                      setNewRoom((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">토론 유형</label>
                  <Select
                    value={newRoom.topicType}
                    onValueChange={(value) =>
                      setNewRoom((prev) => ({ ...prev, topicType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPIC_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateRoom}
                  disabled={!newRoom.title.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "토론방 만들기"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <p className="text-sm text-muted-foreground">
            토론방을 만들려면 로그인이 필요합니다
          </p>
        )}
      </div>

      {/* 토론 유형 필터 */}
      <div className="grid gap-4 md:grid-cols-3">
        {TOPIC_TYPES.map((type) => (
          <Card
            key={type.id}
            className="transition-colors hover:bg-accent/50 cursor-pointer"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{type.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 토론방 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            진행 중인 토론
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              토론방 목록을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : !data?.rooms || data.rooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              현재 진행 중인 토론이 없습니다. 첫 번째 토론을 시작해보세요!
            </p>
          ) : (
            <div className="divide-y">
              {data.rooms.map((room) => (
                <LiveRoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LiveRoomCard({ room }: { room: LiveRoom }) {
  const totalVotes = room.stats.proCount + room.stats.conCount;
  const proPercent =
    totalVotes > 0 ? Math.round((room.stats.proCount / totalVotes) * 100) : 50;
  const conPercent = 100 - proPercent;

  const topicLabel =
    TOPIC_TYPES.find((t) => t.id === room.topicType)?.name || room.topicType;

  return (
    <Link
      href={`/live/${room.id}`}
      className="block py-4 transition-colors hover:bg-accent/50 -mx-4 px-4 first:pt-0 last:pb-0"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={room.status === "ACTIVE" ? "default" : "secondary"}
                className="text-xs"
              >
                {room.status === "ACTIVE" ? "진행중" : "대기중"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {topicLabel}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg">{room.title}</h3>
            {room.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {room.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {room.stats.voteCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {room.stats.messageCount}
            </span>
          </div>
        </div>

        {/* 찬반 비율 바 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-blue-600">
              <ThumbsUp className="h-3 w-3" />
              찬성 {proPercent}%
            </span>
            <span className="flex items-center gap-1 text-red-600">
              반대 {conPercent}%
              <ThumbsDown className="h-3 w-3" />
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-muted flex">
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${proPercent}%` }}
            />
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${conPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{room.createdBy.name || "익명"}</span>
          <span>|</span>
          <span>{new Date(room.createdAt).toLocaleString("ko-KR")}</span>
        </div>
      </div>
    </Link>
  );
}
