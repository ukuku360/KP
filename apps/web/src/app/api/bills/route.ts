import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@politics/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const committee = searchParams.get("committee");
    const q = searchParams.get("q");
    const status = searchParams.get("status") || "IN_PROGRESS";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (committee && committee !== "전체") {
      where.committee = committee;
    }

    if (q) {
      where.OR = [
        { billName: { contains: q, mode: "insensitive" } },
        { proposalReason: { contains: q, mode: "insensitive" } },
        { mainContent: { contains: q, mode: "insensitive" } },
      ];
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { noticeEnd: "asc" },
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

    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}
