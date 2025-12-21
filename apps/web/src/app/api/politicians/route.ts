import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@politics/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const party = searchParams.get("party");
    const q = searchParams.get("q");

    const where: any = {};

    if (party) {
      where.party = party;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
      ];
    }

    const politicians = await prisma.politician.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(politicians);
  } catch (error) {
    console.error("Error fetching politicians:", error);
    return NextResponse.json(
      { error: "Failed to fetch politicians" },
      { status: 500 }
    );
  }
}
