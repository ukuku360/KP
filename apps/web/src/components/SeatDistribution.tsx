"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Party {
  id: string;
  name: string;
  count: number;
  color: string;
}

// Approximate current distribution (User asked for rough numbers initially)
const SAMPLE_DATA: Party[] = [
  { id: "minjoo", name: "더불어민주당", count: 169, color: "#004EA2" }, // Blue
  { id: "justice", name: "정의당", count: 6, color: "#FFED00" }, // Yellow
  { id: "basic", name: "기본소득당", count: 1, color: "#00BCD4" }, 
  { id: "transition", name: "시대전환", count: 1, color: "#5D2C89" },
  { id: "independent", name: "무소속", count: 7, color: "#808080" },
  { id: "peoplepower", name: "국민의힘", count: 116, color: "#E61E2B" }, // Red
].sort((a, b) => {
    // Custom sort to make sure left-wing is on left (Minjoo) and right-wing on right (People Power) often used in KR
    // Or just simple order in the array.
    // Let's keep array order for rendering:
    // We want Minjoo on Left, People Power on Right.
    return 0; 
});

// Calculate dot positions
// Standard Hemicycle: Rows of dots.
// We need ~300 dots.
// A simple algorithm is to have concentric semi-circles.
// We can pre-calculate capacity per row roughly.
// Row 1 (inner): ~10
// ...
// Row N (outer): ~...

const TOTAL_SEATS = 300;

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

    React.useEffect(() => {
        const updateDots = () => {
            if (containerRef.current) {
                const { offsetWidth } = containerRef.current;
                const width = offsetWidth;
                const height = width / 1.8; 
                setDimensions({ width, height });
                
                const newDots = generateHemicycleDots(width, height, SAMPLE_DATA);
                setDots(newDots);
            }
        };

        updateDots();
        window.addEventListener('resize', updateDots);
        return () => window.removeEventListener('resize', updateDots);
    }, []);

    const total = SAMPLE_DATA.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 md:p-8">
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

            {/* Legend - Stacked Bar Graph */}
            <div className="mt-6 sm:mt-8 md:mt-12 w-full max-w-4xl mx-auto">
                <div className="flex w-full h-10 sm:h-12 md:h-14 lg:h-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5 isolate">
                    {SAMPLE_DATA.map((party) => {
                        const percentage = (party.count / total) * 100;
                        const isHovered = hoveredParty === party.id;
                        const isMuted = hoveredParty && !isHovered;
                        const showLabel = percentage > 15;

                        return (
                            <div
                                key={party.id}
                                className={cn(
                                    "relative h-full transition-all duration-300 ease-out cursor-pointer flex items-center justify-center group overflow-hidden",
                                    isMuted ? "opacity-30" : "opacity-100 z-10"
                                )}
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: party.color,
                                }}
                                onMouseEnter={() => setHoveredParty(party.id)}
                                onMouseLeave={() => setHoveredParty(null)}
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />

                                {(showLabel || isHovered) && (
                                    <div className={cn(
                                        "flex flex-col items-center justify-center text-white drop-shadow-md whitespace-nowrap",
                                        party.color === "#FFED00" ? "text-black drop-shadow-none font-bold" : ""
                                    )}>
                                        <span className="font-bold text-[10px] sm:text-xs md:text-sm tracking-tight px-0.5 sm:px-1">{party.name}</span>
                                        <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs font-medium opacity-90">
                                            <span className={cn(isHovered ? "inline" : "hidden sm:inline")}>{party.count}석</span>
                                            <span>{Math.round(percentage)}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 px-1">
                    <span>전체 {total}석</span>
                    <span>과반 {Math.floor(total/2) + 1}석</span>
                </div>
            </div>
        </div>
    );
}

// Default export for dynamic import if needed
export default SeatDistributionChart;
