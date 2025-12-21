
"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_POLITICIANS, MOCK_BILLS, MOCK_NEWS, MOCK_COMMUNITY_POSTS } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, ThumbsUp, PenSquare, ArrowRight } from "lucide-react";

export default function PoliticianDetailPage({ params }: { params: { id: string } }) {
  const politician = MOCK_POLITICIANS.find((p) => p.id === params.id);

  if (!politician) {
    notFound();
  }

  const bills = MOCK_BILLS.filter((b) => b.politicianId === params.id);
  const news = MOCK_NEWS.filter((n) => n.politicianId === params.id);
  const posts = MOCK_COMMUNITY_POSTS.filter((p) => p.politicianId === params.id);

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header Profile Summary (Simplified) */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8 p-6 bg-secondary/20 rounded-xl">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
          <AvatarImage src={politician.image} alt={politician.name} />
          <AvatarFallback className="text-2xl">{politician.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
            <h1 className="text-3xl font-bold">{politician.name}</h1>
            <Badge 
               variant="outline" 
               className={`text-base px-3 py-1
                 ${politician.party === "국민의힘" ? "text-red-600 border-red-200 bg-red-50" : ""}
                 ${politician.party === "더불어민주당" ? "text-blue-600 border-blue-200 bg-blue-50" : ""}
                 ${politician.party === "정의당" ? "text-yellow-600 border-yellow-200 bg-yellow-50" : ""}
               `}
             >
              {politician.party}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{politician.district}</p>
          <p className="max-w-3xl">{politician.bio}</p>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
             {politician.contact.website && (
               <Button variant="outline" size="sm" asChild>
                 <a href={politician.contact.website} target="_blank" rel="noreferrer" className="gap-2">
                   <ExternalLink className="h-4 w-4" /> 공식 홈페이지
                 </a>
               </Button>
             )}
             {politician.contact.blog && (
               <Button variant="outline" size="sm" asChild>
                 <a href={politician.contact.blog} target="_blank" rel="noreferrer" className="gap-2">
                   <ExternalLink className="h-4 w-4" /> 블로그
                 </a>
               </Button>
             )}
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Profile Details Card */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 프로필 상세
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div>
              <h4 className="font-semibold mb-2 text-muted-foreground">학력</h4>
              <ul className="list-disc pl-5 space-y-1">
                {politician.education.map((edu, index) => (
                  <li key={index}>{edu}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-muted-foreground">주요 경력</h4>
              <ul className="list-disc pl-5 space-y-1">
                {politician.career.map((career, index) => (
                  <li key={index}>{career}</li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t">
                 <h4 className="font-semibold mb-2 text-muted-foreground">연락처</h4>
                 <div className="text-sm space-y-1">
                    {politician.contact.email && <div>📧 {politician.contact.email}</div>}
                    {politician.contact.phone && <div>📞 {politician.contact.phone}</div>}
                 </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Legislation Card */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              ⚖️ 대표 발의 법안
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              더보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
             {bills.length > 0 ? (
              bills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold line-clamp-1">{bill.title}</h4>
                      <Badge variant={bill.status === "가결" ? "default" : "secondary"} className="shrink-0 ml-2">
                        {bill.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{bill.summary}</p>
                    <div className="text-xs text-muted-foreground mt-2 text-right">{bill.proposeDate}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">등록된 법안이 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* 3. News Card */}
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📰 관련 뉴스
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              더보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {news.length > 0 ? (
              news.slice(0, 4).map((item) => (
                <a key={item.id} href={item.url} className="group block p-3 rounded-lg border hover:bg-muted/50 transition-all">
                  <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.title}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">
                            {item.press} • {item.date}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">관련 뉴스가 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* 4. Community Card (Enhanced) */}
        <Card className="h-full flex flex-col md:col-span-1 lg:col-span-1">
           <CardHeader>
            <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-2">
                💬 지지자 커뮤니티
                </CardTitle>
                <Button size="sm" className="gap-2 bg-primary/90 hover:bg-primary text-white shadow-sm">
                    <PenSquare className="h-4 w-4" /> 글쓰기
                </Button>
            </div>
            
            {/* Filter Tabs Mockup */}
            <div className="flex gap-2 text-sm overflow-x-auto pb-1 scrollbar-hide">
                <Badge variant="secondary" className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary">전체</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">응원해요</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">궁금해요</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">제안해요</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
             {posts.length > 0 ? (
              posts.slice(0, 4).map((post) => (
                <div key={post.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`
                        ${post.category === "응원" ? "border-pink-200 bg-pink-50 text-pink-700" : ""}
                        ${post.category === "제안" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                        ${post.category === "질문" ? "border-orange-200 bg-orange-50 text-orange-700" : ""}
                        ${post.category === "토론" ? "border-purple-200 bg-purple-50 text-purple-700" : ""}
                    `}>
                        {post.category}
                    </Badge>
                    <span className="text-sm font-semibold">{post.author}</span>
                    {post.authorBadge && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {post.authorBadge}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{post.date}</span>
                  </div>
                  <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {post.comments}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">등록된 글이 없습니다.</div>
            )}
            <Button variant="ghost" className="w-full text-muted-foreground font-normal" asChild>
                <Link href={`/politicians/${params.id}/community`}>
                    커뮤니티 더보기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
