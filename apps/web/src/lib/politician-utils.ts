import { ASSEMBLY_DATA, PARTY_COLORS, type DistrictData } from "@/lib/assembly-data";

// Extended politician data for detail pages
export interface PoliticianDetail {
  id: string;
  name: string;
  party: string;
  district: string;
  term: string;
  note?: string;
  image?: string;
  bio: string;
  education: string[];
  career: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
    blog?: string;
  };
}

// Generate unique ID from region and district index (ASCII-only for URL compatibility)
export function generatePoliticianId(regionKey: string, districtIndex: number): string {
  return `${regionKey}-${districtIndex}`;
}

// Get all politicians as a flat list with IDs
export function getAllPoliticians(): Array<DistrictData & { id: string; regionKey: string; regionName: string; districtIndex: number }> {
  const result: Array<DistrictData & { id: string; regionKey: string; regionName: string; districtIndex: number }> = [];
  
  Object.entries(ASSEMBLY_DATA).forEach(([regionKey, regionData]) => {
    regionData.districts.forEach((district, districtIndex) => {
      result.push({
        ...district,
        id: generatePoliticianId(regionKey, districtIndex),
        regionKey,
        regionName: regionData.name,
        districtIndex,
      });
    });
  });
  
  return result;
}

// Find politician by ID (format: "regionKey-districtIndex")
export function findPoliticianById(id: string): (DistrictData & { regionKey: string; regionName: string; districtIndex: number }) | null {
  const parts = id.split('-');
  if (parts.length < 2) return null;
  
  const districtIndex = parseInt(parts[parts.length - 1], 10);
  const regionKey = parts.slice(0, -1).join('-');
  
  if (isNaN(districtIndex)) return null;
  
  const regionData = ASSEMBLY_DATA[regionKey];
  if (!regionData) return null;
  
  const district = regionData.districts[districtIndex];
  if (!district) return null;
  
  return {
    ...district,
    regionKey,
    regionName: regionData.name,
    districtIndex,
  };
}

// Convert to PoliticianDetail with empty placeholder data
export function getPoliticianDetail(id: string): PoliticianDetail | null {
  const politician = findPoliticianById(id);
  if (!politician) return null;
  
  const partyColor = PARTY_COLORS[politician.politician.party] || "#808080";
  
  return {
    id,
    name: politician.politician.name,
    party: politician.politician.party,
    district: `${politician.regionName} ${politician.district}`,
    term: politician.politician.term,
    note: politician.politician.note,
    image: undefined, // Placeholder - no image yet
    bio: "", // Placeholder - empty for now
    education: [], // Placeholder - empty for now
    career: [], // Placeholder - empty for now
    contact: {
      email: "", // Placeholder - empty for now
      phone: "", // Placeholder - empty for now
    },
  };
}
