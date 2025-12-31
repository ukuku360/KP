"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSEMBLY_DATA, PARTY_COLORS, type RegionData, type DistrictData, type PoliticianInfo } from "@/lib/assembly-data";
import { generatePoliticianId } from "@/lib/politician-utils";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RegionItem {
  key: string;
  name: string;
  count: number;
  districts: DistrictData[];
}

// ASSEMBLY_DATA를 RegionItem 배열로 변환
function buildRegionList(): RegionItem[] {
  return Object.entries(ASSEMBLY_DATA).map(([key, data]) => ({
    key,
    name: data.name,
    count: data.count,
    districts: data.districts,
  }));
}

export default function PoliticiansPage() {
  const regionList = React.useMemo(() => buildRegionList(), []);

  // Navigation state: null = 지역 목록, RegionItem = 지역구 목록
  const [selectedRegion, setSelectedRegion] = React.useState<RegionItem | null>(null);
  
  // Politician popup state
  const [selectedPolitician, setSelectedPolitician] = React.useState<{
    info: PoliticianInfo & { image?: string };
    district: string;
    regionKey: string;
    id: string;
  } | null>(null);

  const handleRegionClick = (region: RegionItem) => {
    setSelectedRegion(region);
  };

  const handleDistrictClick = (district: DistrictData, regionKey: string, districtIndex: number) => {
    const politicianId = generatePoliticianId(regionKey, districtIndex);
    setSelectedPolitician({
      info: {
        name: district.politician.name,
        party: district.politician.party,
        term: district.politician.term,
        note: district.politician.note,
      },
      district: district.district,
      regionKey,
      id: politicianId,
    });
  };

  const handleBack = () => {
    setSelectedRegion(null);
  };

  const getPartyColor = (party: string) => {
    return PARTY_COLORS[party] || "#808080";
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        {selectedRegion ? (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {selectedRegion.name}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                지역구 {selectedRegion.count}석 · 선거구를 선택하세요
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">정치인</h1>
            <p className="text-muted-foreground">
              지역을 선택하여 22대 국회의원을 확인하세요.
            </p>
          </>
        )}
      </div>

      {!selectedRegion ? (
        // 지역 목록 (17개 시도)
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {regionList.map((region) => (
            <div
              key={region.key}
              onClick={() => handleRegionClick(region)}
              className={cn(
                "group relative p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                    {region.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {region.count}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">석</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min((region.count / 60) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 지역구 목록
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedRegion.districts.map((district, index) => {
            const partyColor = getPartyColor(district.politician.party);
            return (
              <div
                key={index}
                onClick={() => handleDistrictClick(district, selectedRegion.key, index)}
                className={cn(
                  "group relative p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-xl transition-colors"
                      style={{ backgroundColor: `${partyColor}15` }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: partyColor }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {district.district}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {district.politician.name} ({district.politician.term})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: partyColor }}
                    >
                      {district.politician.party.length > 5 
                        ? district.politician.party.slice(0, 5) + "…" 
                        : district.politician.party}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: '100%',
                      backgroundColor: partyColor,
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Politician Dialog - reused from PartyDistrictDetail */}
      <Dialog open={!!selectedPolitician} onOpenChange={(open) => !open && setSelectedPolitician(null)}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {selectedPolitician?.district}
            </DialogTitle>
            <p className="text-muted-foreground font-medium text-sm">
              22대 국회의원 선출 당선인
            </p>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative">
              <Avatar 
                className="w-32 h-32 border-4 bg-muted" 
                style={{ borderColor: selectedPolitician ? getPartyColor(selectedPolitician.info.party) : "#808080" }}
              >
                <AvatarImage src={selectedPolitician?.info.image} className="object-cover" />
                <AvatarFallback className="text-4xl font-black text-muted-foreground/30">
                  {selectedPolitician?.info.name[0]}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-white font-bold text-xs shadow-lg" 
                style={{ backgroundColor: selectedPolitician ? getPartyColor(selectedPolitician.info.party) : "#808080" }}
              >
                {selectedPolitician?.info.party}
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-foreground">
                {selectedPolitician?.info.name}
              </h3>
              <p className="text-muted-foreground">{selectedPolitician?.info.term}</p>
            </div>

            {selectedPolitician?.info.note && (
              <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  비고
                </h4>
                <p className="text-sm font-medium flex items-center gap-2">
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: selectedPolitician ? getPartyColor(selectedPolitician.info.party) : "#808080" }} 
                  />
                  {selectedPolitician.info.note}
                </p>
              </div>
            )}

            {/* 상세보기 버튼 */}
            <Button asChild className="w-full mt-2" variant="default">
              <Link href={`/politicians/${selectedPolitician?.id}`}>
                상세보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
