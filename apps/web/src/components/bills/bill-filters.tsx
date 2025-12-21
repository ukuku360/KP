"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const COMMITTEES = [
  "전체",
  "법제사법위원회",
  "정무위원회",
  "기획재정위원회",
  "교육위원회",
  "과학기술정보방송통신위원회",
  "외교통일위원회",
  "국방위원회",
  "행정안전위원회",
  "문화체육관광위원회",
  "농림축산식품해양수산위원회",
  "산업통상자원중소벤처기업위원회",
  "보건복지위원회",
  "환경노동위원회",
  "국토교통위원회",
];

export function BillFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCommittee = searchParams.get("committee") || "전체";
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
    router.push(`/bills?${params.toString()}`);
  };

  const handleCommitteeChange = (committee: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (committee === "전체") {
      params.delete("committee");
    } else {
      params.set("committee", committee);
    }
    router.push(`/bills?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="법안명 또는 내용 검색..."
            defaultValue={currentSearch}
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        {COMMITTEES.map((committee) => (
          <Button
            key={committee}
            variant={currentCommittee === committee ? "default" : "outline"}
            size="sm"
            onClick={() => handleCommitteeChange(committee)}
          >
            {committee}
          </Button>
        ))}
      </div>
    </div>
  );
}
