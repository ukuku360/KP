import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, LiveRoomStatus } from "@politics/database";

// GET: 토론방 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as LiveRoomStatus | null;
    const topicType = searchParams.get("topicType");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    } else {
      // 기본: 활성 토론방만
      where.status = { in: ["WAITING", "ACTIVE"] };
    }

    if (topicType) {
      where.topicType = topicType;
    }

    const [rooms, total] = await Promise.all([
      prisma.liveRoom.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { messages: true, votes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.liveRoom.count({ where }),
    ]);

    // 각 토론방의 찬반 투표 수 계산
    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const voteStats = await prisma.liveVote.groupBy({
          by: ["stance"],
          where: { roomId: room.id },
          _count: true,
        });

        const proCount = voteStats.find((v) => v.stance === "PRO")?._count || 0;
        const conCount = voteStats.find((v) => v.stance === "CON")?._count || 0;

        return {
          ...room,
          stats: {
            messageCount: room._count.messages,
            voteCount: room._count.votes,
            proCount,
            conCount,
          },
        };
      })
    );

    return NextResponse.json({
      rooms: roomsWithStats,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("토론방 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "토론방 목록 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST: 토론방 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, topicType, topicId } = body;

    if (!title || !topicType) {
      return NextResponse.json(
        { error: "제목과 주제 유형은 필수입니다" },
        { status: 400 }
      );
    }

    // 유효한 topicType 확인
    if (!["BILL", "PETITION", "FREE"].includes(topicType)) {
      return NextResponse.json(
        { error: "올바른 주제 유형을 선택해주세요" },
        { status: 400 }
      );
    }

    // BILL 또는 PETITION인 경우 topicId 필수
    if ((topicType === "BILL" || topicType === "PETITION") && !topicId) {
      return NextResponse.json(
        { error: "법안 또는 청원 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const room = await prisma.liveRoom.create({
      data: {
        title,
        description,
        topicType,
        topicId: topicId || null,
        status: "ACTIVE",
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("토론방 생성 오류:", error);
    return NextResponse.json(
      { error: "토론방 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
