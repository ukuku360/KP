
import { SeatDistributionChart } from "@/components/SeatDistribution";

export default async function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 min-h-[calc(100vh-10rem)]">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
          대한민국 국회 의석수
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          제21대 국회 정당별 의석 현황 및 비율을 한눈에 확인하세요
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <SeatDistributionChart />
      </div>
    </div>
  );
}


