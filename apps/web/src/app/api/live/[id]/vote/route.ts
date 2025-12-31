import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, Stance } from "@politics/database";

interface RouteParams {
  params: { id: string };
}

// POST: 투표 (찬성/반대/중립)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const { id: roomId } = params;
    const body = await request.json();
    const { stance } = body;

    // stance 유효성 검사
    if (!stance || !["PRO", "CON", "NEUTRAL"].includes(stance)) {
      return NextResponse.json(
        { error: "올바른 입장을 선택해주세요 (PRO, CON, NEUTRAL)" },
        { status: 400 }
      );
    }

    // 토론방 존재 확인
    const room = await prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "토론방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 종료된 토론방에는 투표 불가
    if (room.status === "ENDED") {
      return NextResponse.json(
        { error: "종료된 토론방에는 투표할 수 없습니다" },
        { status: 400 }
      );
    }

    // 투표 생성 또는 업데이트
    const vote = await prisma.liveVote.upsert({
      where: {
        roomId_userId: { roomId, userId: session.user.id },
      },
      update: {
        stance: stance as Stance,
      },
      create: {
        roomId,
        userId: session.user.id,
        stance: stance as Stance,
      },
    });

    // 업데이트된 투표 통계 반환
    const voteStats = await prisma.liveVote.groupBy({
      by: ["stance"],
      where: { roomId },
      _count: true,
    });

    const proCount = voteStats.find((v) => v.stance === "PRO")?._count || 0;
    const conCount = voteStats.find((v) => v.stance === "CON")?._count || 0;
    const neutralCount = voteStats.find((v) => v.stance === "NEUTRAL")?._count || 0;

    return NextResponse.json({
      vote,
      stats: {
        proCount,
        conCount,
        neutralCount,
        totalVotes: proCount + conCount + neutralCount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "투표에 실패했습니다" },
      { status: 500 }
    );
  }
}
