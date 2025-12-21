
"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_POLITICIANS, MOCK_COMMUNITY_POSTS } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, ThumbsUp, PenSquare, Search } from "lucide-react";

export default function PoliticianCommunityPage({ params }: { params: { id: string } }) {
  const politician = MOCK_POLITICIANS.find((p) => p.id === params.id);

  if (!politician) {
    notFound();
  }

  const posts = MOCK_COMMUNITY_POSTS.filter((p) => p.politicianId === params.id);

  return (
    <div className="container py-8 max-w-4xl">
      {/* HeaderNav */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
            <Link href={`/politicians/${params.id}`}>
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border border-background">
                <AvatarImage src={politician.image} alt={politician.name} />
                <AvatarFallback>{politician.name[0]}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    {politician.name} 
                    <span className="text-muted-foreground font-normal text-sm">지지자 커뮤니티</span>
                </h1>
            </div>
        </div>
        <div className="ml-auto">
             <Button className="gap-2 bg-primary/90 hover:bg-primary text-white shadow-sm">
                <PenSquare className="h-4 w-4" /> 글쓰기
            </Button>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="검색어를 입력하세요..." className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
             <Button variant="secondary" size="sm" className="rounded-full px-4">전체</Button>
             <Button variant="outline" size="sm" className="rounded-full px-4">응원해요</Button>
             <Button variant="outline" size="sm" className="rounded-full px-4">궁금해요</Button>
             <Button variant="outline" size="sm" className="rounded-full px-4">제안해요</Button>
             <Button variant="outline" size="sm" className="rounded-full px-4">토론해요</Button>
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                 <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`
                        ${post.category === "응원" ? "border-pink-200 bg-pink-50 text-pink-700" : ""}
                        ${post.category === "제안" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                        ${post.category === "질문" ? "border-orange-200 bg-orange-50 text-orange-700" : ""}
                        ${post.category === "토론" ? "border-purple-200 bg-purple-50 text-purple-700" : ""}
                    `}>
                        {post.category}
                    </Badge>
                    <span className="font-semibold">{post.author}</span>
                     {post.authorBadge && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {post.authorBadge}
                        </span>
                    )}
                    <span className="text-sm text-muted-foreground ml-auto">{post.date}</span>
                 </div>
                 <h3 className="text-lg font-medium mb-2 hidden">제목이 있다면 여기에</h3>
                 <p className="text-base text-foreground leading-relaxed mb-4">{post.content}</p>
                 
                 <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-3">
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <ThumbsUp className="h-4 w-4" /> 
                      <span>좋아요 {post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <MessageSquare className="h-4 w-4" /> 
                      <span>댓글 {post.comments}</span>
                    </button>
                 </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-lg">
            <p>등록된 게시글이 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 글을 작성해보세요!</p>
          </div>
        )}
      </div>

      {/* Pagination Mockup */}
      <div className="flex justify-center mt-8 gap-2">
         <Button variant="outline" size="sm" disabled>이전</Button>
         <Button variant="outline" size="sm" className="bg-secondary">1</Button>
         <Button variant="outline" size="sm">2</Button>
         <Button variant="outline" size="sm">3</Button>
         <Button variant="outline" size="sm">다음</Button>
      </div>
    </div>
  );
}
