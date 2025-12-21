import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@politics/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const status = searchParams.get("status") || "IN_PROGRESS";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category && category !== "전체") {
      where.category = category;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    const petitions = await prisma.petition.findMany({
      where,
      orderBy: { agreeCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(petitions);
  } catch (error) {
    console.error("Error fetching petitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch petitions" },
      { status: 500 }
    );
  }
}
