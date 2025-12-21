import { Suspense } from "react";
import { BillList } from "@/components/bills/bill-list";
import { BillFilters } from "@/components/bills/bill-filters";

export const dynamic = "force-dynamic";

export default function BillsPage() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">입법예정법안</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          국회에서 진행 중인 입법예고 법안을 확인하고 의견을 나눠보세요
        </p>
      </div>

      <BillFilters />

      <Suspense fallback={<BillListSkeleton />}>
        <BillList />
      </Suspense>
    </div>
  );
}

function BillListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}
