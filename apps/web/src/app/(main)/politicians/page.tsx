
import { MOCK_POLITICIANS } from "@/lib/mock-data";
import { PoliticianCard } from "@/components/politician/PoliticianCard";

export default function PoliticiansPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">정치인</h1>
        <p className="text-muted-foreground">
          대한민국의 미래를 이끌어가는 정치인들의 활동을 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_POLITICIANS.map((politician) => (
          <PoliticianCard key={politician.id} politician={politician} />
        ))}
      </div>
    </div>
  );
}
