import { notFound } from "next/navigation";
import { prisma } from "@politics/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostComments } from "@/components/community/post-comments";
import { Eye, Heart, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

interface PostDetailPageProps {
  params: { id: string };
}

async function getPost(id: string) {
  const post = await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return post;
}

const CATEGORIES: Record<string, string> = {
  free: "자유게시판",
  policy: "정책제안",
  factcheck: "팩트체크",
  discussion: "토론",
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const post = await getPost(params.id).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community">
            <ArrowLeft className="h-4 w-4 mr-1" />
            목록으로
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {CATEGORIES[post.category] || post.category}
              </Badge>
              <CardTitle className="text-xl">{post.title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t mt-4">
            <div className="flex items-center gap-2">
              {post.user.image ? (
                <img
                  src={post.user.image}
                  alt={post.user.name || ""}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <span>{post.user.name || "익명"}</span>
              <span>|</span>
              <span>{new Date(post.createdAt).toLocaleString("ko-KR")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed min-h-[200px]">
            {post.content}
          </div>
        </CardContent>
      </Card>

      <PostComments postId={post.id} comments={post.comments} />
    </div>
  );
}
