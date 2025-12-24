"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  stance: "PRO" | "CON" | "NEUTRAL";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface LiveChatProps {
  roomId: string;
  roomStatus: string;
  initialMessages: Message[];
  userStance: "PRO" | "CON" | "NEUTRAL" | null;
  onStanceChange: (stance: "PRO" | "CON" | "NEUTRAL") => void;
}

const STANCE_CONFIG = {
  PRO: {
    label: "찬성",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-500",
    icon: ThumbsUp,
  },
  CON: {
    label: "반대",
    color: "bg-red-500",
    textColor: "text-red-600",
    borderColor: "border-red-500",
    icon: ThumbsDown,
  },
  NEUTRAL: {
    label: "중립",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    borderColor: "border-gray-500",
    icon: Minus,
  },
};

export function LiveChat({
  roomId,
  roomStatus,
  initialMessages,
  userStance,
  onStanceChange,
}: LiveChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedStance, setSelectedStance] = useState<"PRO" | "CON" | "NEUTRAL">(
    userStance || "NEUTRAL"
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastCursorRef = useRef<string | null>(null);

  // 스크롤을 맨 아래로
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 새 메시지 폴링 (2초마다)
  useEffect(() => {
    if (roomStatus === "ENDED") return;

    const pollMessages = async () => {
      try {
        const cursor = messages.length > 0
          ? messages[messages.length - 1].createdAt
          : null;

        const url = cursor
          ? `/api/live/${roomId}/messages?cursor=${encodeURIComponent(cursor)}`
          : `/api/live/${roomId}/messages`;

        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = data.messages.filter(
              (m: Message) => !existingIds.has(m.id)
            );
            return [...prev, ...newMessages];
          });
        }
      } catch (err) {
        console.error("메시지 폴링 오류:", err);
      }
    };

    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [roomId, roomStatus, messages]);

  const handleSendMessage = async () => {
    if (!session) {
      setError("로그인이 필요합니다");
      return;
    }

    if (!newMessage.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/live/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          stance: selectedStance,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "메시지 전송 실패");
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStanceSelect = (stance: "PRO" | "CON" | "NEUTRAL") => {
    setSelectedStance(stance);
    if (session) {
      onStanceChange(stance);
    }
  };

  const isEnded = roomStatus === "ENDED";

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* 입장 선택 */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium mr-2">내 입장:</span>
          {(["PRO", "CON", "NEUTRAL"] as const).map((stance) => {
            const config = STANCE_CONFIG[stance];
            const Icon = config.icon;
            const isSelected = selectedStance === stance;
            return (
              <Button
                key={stance}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-1",
                  isSelected && config.color,
                  !isSelected && config.textColor
                )}
                onClick={() => handleStanceSelect(stance)}
                disabled={isEnded}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            첫 번째 메시지를 남겨보세요!
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={session?.user?.id === message.user.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      {isEnded ? (
        <div className="p-4 border-t bg-muted/50 text-center text-muted-foreground">
          이 토론은 종료되었습니다
        </div>
      ) : (
        <div className="p-4 border-t">
          {error && (
            <p className="text-sm text-destructive mb-2">{error}</p>
          )}
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={cn("shrink-0", STANCE_CONFIG[selectedStance].borderColor)}
            >
              {STANCE_CONFIG[selectedStance].label}
            </Badge>
            <Input
              placeholder={
                session
                  ? "메시지를 입력하세요..."
                  : "로그인 후 참여할 수 있습니다"
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!session || isSending}
              maxLength={500}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!session || !newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const config = STANCE_CONFIG[message.stance];

  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.user.image || undefined} />
        <AvatarFallback>
          {message.user.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[70%]", isOwn && "text-right")}>
        <div
          className={cn(
            "flex items-center gap-2 mb-1",
            isOwn && "flex-row-reverse"
          )}
        >
          <span className="text-xs font-medium">
            {message.user.name || "익명"}
          </span>
          <Badge variant="outline" className={cn("text-xs", config.borderColor)}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div
          className={cn(
            "inline-block px-3 py-2 rounded-lg",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
