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

// PoliticianInfo에 image 필드 추가 (선택적)
type ExtendedPoliticianInfo = PoliticianInfo & { image?: string };

interface DistrictHierarchy {
  name: string;
  count: number;
  children?: DistrictHierarchy[];
  politician?: ExtendedPoliticianInfo;
  politicianId?: string; // ID for detail page navigation
}

// 정당별로 ASSEMBLY_DATA를 필터링하여 DistrictHierarchy 구조로 변환
function buildPartyDistrictData(partyName: string): DistrictHierarchy[] {
  const result: DistrictHierarchy[] = [];
  
  // 정당 이름 매핑 (SAMPLE_DATA의 id -> 정당명)
  const partyNameMap: { [key: string]: string[] } = {
    "minjoo": ["더불어민주당"],
    "peoplepower": ["국민의힘"],
    "chokuk": ["조국혁신당"],
    "progressive": ["진보당"],
    "reform": ["개혁신당"],
    "basicincome": ["기본소득당"],
    "socialdemocratic": ["사회민주당"],
    "independent": ["무소속"],
  };

  const targetParties = partyNameMap[partyName] || [partyName];

  Object.entries(ASSEMBLY_DATA).forEach(([regionKey, regionData]) => {
    // 해당 정당의 의원 필터링
    const partyDistricts = regionData.districts.filter(
      d => targetParties.includes(d.politician.party)
    );

    if (partyDistricts.length > 0) {
      // 지역구별로 그룹화 (갑/을/병 등)
      const districtGroups: { [key: string]: DistrictData[] } = {};
      
      partyDistricts.forEach(d => {
        // 기본 지역명 추출 (예: "강서구 갑" -> "강서구")
        const baseName = d.district.replace(/ (갑|을|병|정|무)$/, '').trim();
        if (!districtGroups[baseName]) {
          districtGroups[baseName] = [];
        }
        districtGroups[baseName].push(d);
      });

      const children: DistrictHierarchy[] = [];
      
      Object.entries(districtGroups).forEach(([baseName, districts]) => {
        if (districts.length === 1) {
          // 단일 지역구
          const d = districts[0];
          // Find original index in regionData.districts
          const originalIndex = regionData.districts.findIndex(orig => orig.district === d.district);
          children.push({
            name: d.district,
            count: 1,
            politician: {
              name: d.politician.name,
              party: d.politician.party,
              term: d.politician.term,
              note: d.politician.note,
            },
            politicianId: generatePoliticianId(regionKey, originalIndex),
          });
        } else {
          // 다중 지역구 (갑/을/병)
          const subChildren: DistrictHierarchy[] = districts.map(d => {
            const originalIndex = regionData.districts.findIndex(orig => orig.district === d.district);
            return {
              name: d.district,
              count: 1,
              politician: {
                name: d.politician.name,
                party: d.politician.party,
                term: d.politician.term,
                note: d.politician.note,
              },
              politicianId: generatePoliticianId(regionKey, originalIndex),
            };
          });
          
          children.push({
            name: baseName,
            count: districts.length,
            children: subChildren,
          });
        }
      });

      result.push({
        name: regionData.name,
        count: partyDistricts.length,
        children: children,
      });
    }
  });

  return result;
}

interface PartyDistrictDetailProps {
  partyId: string;
  partyName: string;
  partyColor: string;
  onBack: () => void;
}

export function PartyDistrictDetail({
  partyId,
  partyName,
  partyColor,
  onBack,
}: PartyDistrictDetailProps) {
  // 동적으로 정당별 데이터 생성
  const partyData = React.useMemo(() => buildPartyDistrictData(partyId), [partyId]);
  
  const [history, setHistory] = React.useState<DistrictHierarchy[][]>([partyData]);
  const [titleHistory, setTitleHistory] = React.useState<string[]>([partyName]);

  const [selectedPolitician, setSelectedPolitician] = React.useState<{ info: ExtendedPoliticianInfo, district: string, id: string } | null>(null);

  // partyData가 변경되면 history 초기화
  React.useEffect(() => {
    setHistory([partyData]);
    setTitleHistory([partyName]);
  }, [partyData, partyName]);

  const currentLevel = history[history.length - 1];
  const currentTitle = titleHistory[titleHistory.length - 1];

  const handleLevelClick = (item: DistrictHierarchy) => {
    if (item.politician && item.politicianId) {
      setSelectedPolitician({ 
        info: item.politician, 
        district: item.name,
        id: item.politicianId,
      });
    } else if (item.children && item.children.length > 0) {
      setHistory([...history, item.children]);
      setTitleHistory([...titleHistory, item.name]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
      setTitleHistory(titleHistory.slice(0, -1));
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group"
        >
          <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: partyColor }}
            />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentTitle}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            지역구 의원 선출 지역 Breakdown
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentLevel && currentLevel.length > 0 ? (
          currentLevel.map((item, index) => (
            <div
              key={index}
              onClick={() => handleLevelClick(item)}
              className={cn(
                "group relative p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 transition-colors">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                    {item.politician && (
                      <span className="text-sm text-muted-foreground">
                        {item.politician.name} ({item.politician.term})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!item.politician && (
                    <>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {item.count}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">석</span>
                    </>
                  )}
                  {(item.children && item.children.length > 0) || item.politician ? (
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  ) : null}
                </div>
              </div>
              
              {/* Progress bar for visualization */}
              <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min((item.count / 20) * 100, 100)}%`,
                    backgroundColor: partyColor,
                    opacity: 0.7
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Users className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-muted-foreground">데이터가 충분하지 않거나 해당 지역에 의원이 없습니다.</p>
          </div>
        )}
      </div>


       <Dialog open={!!selectedPolitician} onOpenChange={(open) => !open && setSelectedPolitician(null)}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight">{selectedPolitician?.district}</DialogTitle>
                <p className="text-muted-foreground font-medium text-sm">22대 국회의원 선출 당선인</p>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative">
                    <Avatar className="w-32 h-32 border-4 bg-muted" style={{ borderColor: partyColor }}>
                        <AvatarImage src={selectedPolitician?.info.image} className="object-cover" />
                        <AvatarFallback className="text-4xl font-black text-muted-foreground/30">
                            {selectedPolitician?.info.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-white font-bold text-xs shadow-lg" style={{ backgroundColor: partyColor }}>
                        {selectedPolitician?.info.party}
                    </div>
                </div>
                
                <div className="text-center space-y-1">
                    <h3 className="text-2xl font-bold text-foreground">{selectedPolitician?.info.name}</h3>
                    <p className="text-muted-foreground">{selectedPolitician?.info.term}</p>
                </div>

                {selectedPolitician?.info.note && (
                  <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">비고</h4>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: partyColor }} />
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
