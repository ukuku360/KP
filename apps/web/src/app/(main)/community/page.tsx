import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@politics/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Heart, Plus } from "lucide-react";

const CATEGORIES = [
  { id: "free", name: "자유게시판", description: "자유롭게 의견을 나눠보세요" },
  { id: "policy", name: "정책제안", description: "정책에 대한 제안을 작성하세요" },
  { id: "factcheck", name: "팩트체크", description: "사실관계를 검증해보세요" },
  { id: "discussion", name: "토론", description: "열린 토론에 참여하세요" },
];

async function getRecentPosts() {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return posts;
}

export default async function CommunityPage() {
  const posts = await getRecentPosts();

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8">
      <div className="flex flex-col items-center text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">커뮤니티</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            정치 이슈에 대해 자유롭게 토론하세요
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
          <Link href="/community/new">
            <Plus className="mr-2 h-5 w-5" />
            글쓰기
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link key={category.id} href={`/community?category=${category.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 게시글</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              아직 등록된 게시글이 없습니다.
            </p>
          ) : (
            <div className="divide-y">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block py-4 transition-colors hover:bg-accent/50 -mx-4 px-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIES.find((c) => c.id === post.category)?.name ||
                            post.category}
                        </Badge>
                        <h3 className="font-medium truncate">{post.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.user.name || "익명"}</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
