"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function PetitionComments({
  petitionId,
  comments,
}: {
  petitionId: string;
  comments: Comment[];
}) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/petitions/${petitionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["petition", petitionId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">의견 {comments.length}개</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? "의견을 작성해주세요..." : "로그인 후 작성 가능합니다"}
            disabled={!session || commentMutation.isPending}
          />
          <Button type="submit" disabled={!session || commentMutation.isPending}>
            작성
          </Button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              아직 등록된 의견이 없습니다. 첫 의견을 남겨보세요!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 border-b pb-4 last:border-0">
                <div className="flex-shrink-0">
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || ""}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.user.name || "익명"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
