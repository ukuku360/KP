"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TOTAL_SEATS } from "@/lib/constants";
import { PartyDistrictDetail } from "./PartyDistrictDetail";

interface Party {
  id: string;
  name: string;
  count: number;
  color: string;
}

// 22nd National Assembly - Real Data (2025.12 기준)
const SAMPLE_DATA: Party[] = [
  { id: "minjoo", name: "더불어민주당", count: 170, color: "#004EA2" }, // 지역구 157 + 비례 13
  { id: "peoplepower", name: "국민의힘", count: 108, color: "#E61E2B" }, // 지역구 90 + 비례 18
  { id: "chokuk", name: "조국혁신당", count: 13, color: "#0073CF" }, // 비례 13
  { id: "progressive", name: "진보당", count: 6, color: "#D6001C" }, // 지역구 1 + 비례 5
  { id: "reform", name: "개혁신당", count: 3, color: "#FF7920" }, // 지역구 1 + 비례 2
  { id: "basicincome", name: "기본소득당", count: 1, color: "#00C4B3" }, // 용혜인
  { id: "socialdemocratic", name: "사회민주당", count: 1, color: "#E91E63" }, // 한창민
  { id: "independent", name: "무소속", count: 5, color: "#808080" }, // 우원식, 김종민, 이춘석, 임광현, 최혁진
  { id: "vacant", name: "궐원", count: 2, color: "#CCCCCC" }, // 계양을, 아산을
].sort((a, b) => b.count - a.count);


interface Dot {
    x: number;
    y: number;
    partyId: string;
    partyName: string;
    color: string;
}

const generateHemicycleDots = (width: number, height: number, data: Party[]): Dot[] => {
    // Parameters for the arc
    const centerX = width / 2;
    const centerY = height * 0.9; // Push down a bit
    const maxRadius = Math.min(width / 2, height) * 0.9;
    const minRadius = maxRadius * 0.4;
    
    // We try to fit 300 dots.
    // Let's define rows.
    // Circumference of half circle = pi * r
    // We want roughly equal spacing.
    // Let spacing 's'.
    // Row 1 (inner) length = pi * minRadius. Capacity = (pi * minRadius) / s
    // Row k length = pi * r_k.
    // Total capacity = sum(capacities).
    
    // Let's pick '8' rows
    const numRows = 10;
    const rowSpacing = (maxRadius - minRadius) / (numRows - 1);
    
    // Determine 's' (dot spacing) based on total arc lengths sum approx equal to N * s
    // Sum(pi * r_i) = s * N
    // r_i = minRadius + i * rowSpacing
    // Sum(r_i) = 10*minRadius + rowSpacing*(0+..+9)
    
    const sumRadii = (numRows * minRadius) + (rowSpacing * (numRows * (numRows - 1) / 2));
    const totalArcLength = Math.PI * sumRadii;
    // We have TOTAL_SEATS dots.
    // s ~= totalArcLength / TOTAL_SEATS
    // Adjust slightly for gap
    
    // Create flattened list of available slots (r, theta) sorted by angle eventually
    // but usually hemicycle fills from left to right?
    // Actually parliament charts usually fill "wedge by wedge" or "party grouped".
    // If we fill by angle, we can just assign dots to angles.
    
    // Let's generate all slots first, sorted by angle (radiens 0 to PI, or PI to 0).
    // In SVG, 0 is right, PI is left.
    // We want 180 deg (PI) -> 0 deg (0).
    // Actually, usually it's from Left (PI) to Right (0).
    
    // However, to make it look nice, we should probably interleave rows or just fill them.
    // Simple approach: Calculate total "angle-width" each party takes.
    // Total seats = 300.
    // Party A has 100 seats -> takes 100/300 * 180 degrees?
    // This creates "wedges" (like a pie chart).
    // But we want dots.
    // So we assign dots to the "wedge".
    
    /*
      Better Algorithm:
      1. Generate all dot positions (x, y) for a perfect hemicycle of ~300 seats.
      2. Sort them by angle (from left to right).
      3. Assign parties to dots based on the party order in `data`.
    */
    
    const dots: {x: number, y: number, angle: number}[] = [];
    
    for (let r = 0; r < numRows; r++) {
       const radius = minRadius + r * rowSpacing;
       // Calculate number of dots in this row proportional to radius
       // C = pi * radius
       // relative C compared to min C?
       // Let's just solve for exact count to sum to 300?
       // It's tricky to get exactly 300.
       // Let's approximate and then trim/pad?
       // Or, let's fix the number of dots per row to sum to 300?
    }
    
    // Let's try constant spacing approach again
    // We need 300 dots.
    // Let "area" approx 300 * dotSize^2
    // We just iterate rows and add dots until we define the grid.
    // For sorting, we need them to be symmetric?
    
    // Revised approach for exactly 300 dots (or close to the provided list total) matches:
    // We will just generate a list of "Slots".
    // For each row `i` from 0 to `numRows-1`:
    //    radius `R`
    //    We can fit `n_i` dots.
    //    We want total `SUM n_i` = TOTAL_SEATS.
    //    `n_i` proportional to `R`.
    //    `n_i = k * R`
    //    Sum(k*R_i) = Total -> k = Total / Sum(R_i)
    
    let currentRadius = minRadius;
    const slots: {x: number, y: number, angle: number}[] = [];
    
    // Calculate k
    let sumR = 0;
    for (let i = 0; i < numRows; i++) {
        sumR += (minRadius + i * rowSpacing);
    }
    const k = TOTAL_SEATS / sumR;
    
    // Generate slots
    for (let i = 0; i < numRows; i++) {
        const r = minRadius + i * rowSpacing;
        const n = Math.round(k * r); // dots in this row
        
        // We want to distribute `n` dots from PI to 0.
        // Step size = PI / (n - 1) if we go edge to edge.
        // Usually we leave some padding at bottom.
        // Let's say valid angle is PI*0.95 to PI*0.05? Or just PI to 0.
        
        for (let j = 0; j < n; j++) {
            // angle from PI to 0
            const angle = Math.PI - (Math.PI * j / (n - 1 || 1));
            
            // To make it look "staggered", maybe shift alternate rows?
            // For now, linear alignment.
            
            slots.push({
                x: centerX + r * Math.cos(angle),
                y: centerY - r * Math.sin(angle), // SVG y is down
                angle: angle
            });
        }
        currentRadius += rowSpacing;
    }
    
    // We might have slightly more or less than TOTAL_SEATS due to rounding.
    // But we map existing parties to these slots sorted by angle.
    // Sort slots by angle (descending: PI -> 0 which is Left -> Right on screen)
    // Actually cos(PI) = -1 (Left), cos(0) = 1 (Right).
    // So angle PI is left. 0 is right.
    // Sort by angle descending.
    
    slots.sort((a, b) => b.angle - a.angle);
    
    // Flatten data into a list of colors/parties
    const partyDots: {partyId: string, partyName: string, color: string}[] = [];
    data.forEach(p => {
        for(let i=0; i<p.count; i++) {
            partyDots.push({
               partyId: p.id,
               partyName: p.name,
               color: p.color
            });
        }
    });

    // Merge
    const result: Dot[] = [];
    // We'll take min of slots or partyDots to be safe
    const count = Math.min(slots.length, partyDots.length);
    
    for(let i=0; i<count; i++) {
        result.push({
            ...slots[i],
            ...partyDots[i]
        });
    }
    
    return result;
};

export function SeatDistributionChart() {
    const [dots, setDots] = React.useState<Dot[]>([]);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [hoveredParty, setHoveredParty] = React.useState<string | null>(null);
    const [selectedPartyId, setSelectedPartyId] = React.useState<string | null>(null);

    const selectedParty = SAMPLE_DATA.find(p => p.id === selectedPartyId);

    React.useEffect(() => {
        const updateDots = () => {
            if (containerRef.current) {
                const { offsetWidth } = containerRef.current;
                const width = offsetWidth;
                const height = width / 1.8; 
                setDimensions({ width, height });
                
                if (width > 0) {
                    const newDots = generateHemicycleDots(width, height, SAMPLE_DATA);
                    setDots(newDots);
                }
            }
        };

        updateDots();
        const timeoutId = setTimeout(updateDots, 100); // Initial delay to ensure container is ready
        window.addEventListener('resize', updateDots);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateDots);
        };
    }, []);

    const total = SAMPLE_DATA.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 md:p-8">
            {selectedPartyId && selectedParty ? (
                <PartyDistrictDetail 
                    partyId={selectedPartyId}
                    partyName={selectedParty.name}
                    partyColor={selectedParty.color}
                    onBack={() => setSelectedPartyId(null)}
                />
            ) : (
                <>
                    <div className="relative w-full mx-auto" style={{ height: dimensions.height || 'auto', minHeight: 200 }} ref={containerRef}>
                        {dimensions.width > 0 && (
                            <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                {dots.map((dot, i) => (
                                    <circle
                                        key={i}
                                        cx={dot.x}
                                        cy={dot.y}
                                        r={Math.max(dimensions.width / 150, 3)}
                                        fill={hoveredParty && hoveredParty !== dot.partyId ? "#e5e7eb" : dot.color}
                                        className="transition-all duration-300 ease-out cursor-pointer"
                                        style={{
                                            transformOrigin: 'center',
                                            filter: hoveredParty === dot.partyId ? 'url(#glow)' : undefined
                                        }}
                                        onMouseEnter={() => setHoveredParty(dot.partyId)}
                                        onMouseLeave={() => setHoveredParty(null)}
                                        onClick={() => setSelectedPartyId(dot.partyId)}
                                    />
                                ))}
                            </svg>
                        )}
                        {/* Center Info Panel */}
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                            <div className="transition-all duration-300 transform">
                                {hoveredParty ? (
                                    <div className="flex flex-col items-center">
                                        <div className="text-base sm:text-xl md:text-2xl font-bold tracking-tight mb-0.5 sm:mb-1" style={{ color: SAMPLE_DATA.find(p => p.id === hoveredParty)?.color }}>
                                            {SAMPLE_DATA.find(p => p.id === hoveredParty)?.name}
                                        </div>
                                        <div className="flex items-baseline gap-0.5 sm:gap-1">
                                            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
                                                {SAMPLE_DATA.find(p => p.id === hoveredParty)?.count}
                                            </span>
                                            <span className="text-xs sm:text-sm text-muted-foreground font-medium">석</span>
                                        </div>
                                        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                                            {Math.round(((SAMPLE_DATA.find(p => p.id === hoveredParty)?.count || 0) / total) * 100)}%
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Total Seats</span>
                                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
                                            {total}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legend - Refined Individual Party Bars */}
                    <div className="mt-12 sm:mt-16 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-10">
                            {SAMPLE_DATA.map((party) => {
                                const percentage = (party.count / total) * 100;
                                const isHovered = hoveredParty === party.id;
                                const isMuted = hoveredParty && !isHovered;

                                return (
                                    <div
                                        key={party.id}
                                        className={cn(
                                            "flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer group",
                                            isMuted ? "opacity-20 scale-[0.98]" : "opacity-100 scale-100"
                                        )}
                                        onMouseEnter={() => setHoveredParty(party.id)}
                                        onMouseLeave={() => setHoveredParty(null)}
                                        onClick={() => setSelectedPartyId(party.id)}
                                    >
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: party.color }} />
                                                <span className="text-sm sm:text-base font-bold text-foreground/90 tracking-tight">
                                                    {party.name}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full shadow-sm">
                                                <span className="text-sm sm:text-lg font-black text-foreground">
                                                    {party.count}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                                    석
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-primary font-black ml-1">
                                                    {Math.round(percentage)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative h-4 sm:h-5 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/10 isolate">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) group-hover:brightness-110 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                                                style={{
                                                    width: isHovered ? '100%' : `${percentage}%`,
                                                    backgroundColor: party.color,
                                                    opacity: isHovered ? 1 : 0.9,
                                                }}
                                            />
                                            {/* Glass shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 px-2 font-medium tracking-wide">
                            <div className="flex gap-4">
                                <span>전체 <strong className="text-foreground">{total}석</strong></span>
                                <span>과반 <strong className="text-foreground">{Math.floor(total/2) + 1}석</strong></span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Default export for dynamic import if needed
export default SeatDistributionChart;
