import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma, PetitionStatus } from "@politics/database";
import { PAGINATION, DEFAULT_PETITION_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const statusParam = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));

    const where: Prisma.PetitionWhereInput = {};

    // status 파라미터가 유효한 PetitionStatus인 경우에만 사용
    if (statusParam && Object.values(PetitionStatus).includes(statusParam as PetitionStatus)) {
      where.status = statusParam as PetitionStatus;
    } else {
      where.status = DEFAULT_PETITION_STATUS;
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
