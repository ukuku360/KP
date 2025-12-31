import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma, BillStatus } from "@politics/database";
import { PAGINATION, DEFAULT_BILL_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const committee = searchParams.get("committee");
    const q = searchParams.get("q");
    const statusParam = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT)),
      PAGINATION.MAX_LIMIT || 100
    );

    const where: Prisma.BillWhereInput = {};

    // status 파라미터가 유효한 BillStatus인 경우에만 사용
    if (statusParam && Object.values(BillStatus).includes(statusParam as BillStatus)) {
      where.status = statusParam as BillStatus;
    } else {
      where.status = DEFAULT_BILL_STATUS;
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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}
