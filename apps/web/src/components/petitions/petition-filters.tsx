"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const CATEGORIES = [
  "전체",
  "정치/선거",
  "수사/법무",
  "재정/세제",
  "외교/통일",
  "국방",
  "경제/산업",
  "교육",
  "환경/기후",
  "노동",
  "교통/통신",
  "복지/보건",
  "문화/체육",
  "안전/재해",
  "농어업",
  "국토/해양",
  "인권/여성",
  "행정",
  "기타",
];

export function PetitionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "전체";
  const currentSearch = searchParams.get("q") || "";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/petitions?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "전체") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/petitions?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="청원 제목 또는 내용 검색..."
            defaultValue={currentSearch}
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={currentCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
