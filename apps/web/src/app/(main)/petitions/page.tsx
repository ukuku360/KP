import { Suspense } from "react";
import { PetitionList } from "@/components/petitions/petition-list";
import { PetitionFilters } from "@/components/petitions/petition-filters";

export const dynamic = "force-dynamic";

export default function PetitionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">국민동의청원</h1>
        <p className="text-muted-foreground mt-2">
          국민동의청원 현황을 확인하고 찬반 의견을 표명하세요
        </p>
      </div>

      <PetitionFilters />

      <Suspense fallback={<PetitionListSkeleton />}>
        <PetitionList />
      </Suspense>
    </div>
  );
}

function PetitionListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}
