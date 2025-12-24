import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@politics/database";

interface RouteParams {
  params: { id: string };
}

// GET: 토론방 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const room = await prisma.liveRoom.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "토론방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 투표 통계
    const voteStats = await prisma.liveVote.groupBy({
      by: ["stance"],
      where: { roomId: id },
      _count: true,
    });

    const proCount = voteStats.find((v) => v.stance === "PRO")?._count || 0;
    const conCount = voteStats.find((v) => v.stance === "CON")?._count || 0;
    const neutralCount = voteStats.find((v) => v.stance === "NEUTRAL")?._count || 0;

    // 최근 메시지 50개
    const messages = await prisma.liveMessage.findMany({
      where: { roomId: id, isHidden: false },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 현재 사용자의 투표 상태
    const session = await auth();
    let userVote = null;
    if (session?.user?.id) {
      userVote = await prisma.liveVote.findUnique({
        where: {
          roomId_userId: { roomId: id, userId: session.user.id },
        },
      });
    }

    return NextResponse.json({
      room,
      stats: {
        proCount,
        conCount,
        neutralCount,
        totalVotes: proCount + conCount + neutralCount,
      },
      messages: messages.reverse(), // 오래된 순으로 정렬
      userVote: userVote?.stance || null,
    });
  } catch (error) {
    console.error("토론방 조회 오류:", error);
    return NextResponse.json(
      { error: "토론방 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 토론방 상태 변경 (생성자만)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // 토론방 확인
    const room = await prisma.liveRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { error: "토론방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 생성자만 상태 변경 가능
    if (room.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const updatedRoom = await prisma.liveRoom.update({
      where: { id },
      data: {
        status,
        endsAt: status === "ENDED" ? new Date() : null,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("토론방 상태 변경 오류:", error);
    return NextResponse.json(
      { error: "토론방 상태 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}
