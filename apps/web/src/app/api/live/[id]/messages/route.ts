import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, Stance } from "@politics/database";

interface RouteParams {
  params: { id: string };
}

// 욕설 필터링 (간단한 키워드 기반)
const BANNED_WORDS = [
  "시발", "씨발", "ㅅㅂ", "병신", "ㅂㅅ", "지랄", "ㅈㄹ",
  "개새끼", "ㄱㅅㄲ", "죽어", "뒤져", "꺼져"
];

function containsBannedWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word));
}

// GET: 메시지 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: roomId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await prisma.liveMessage.findMany({
      where: {
        roomId,
        isHidden: false,
        ...(cursor ? { createdAt: { gt: new Date(cursor) } } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    return NextResponse.json({
      messages,
      nextCursor: messages.length > 0
        ? messages[messages.length - 1].createdAt.toISOString()
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "메시지 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST: 메시지 작성
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
    const { content, stance } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "메시지 내용을 입력해주세요" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "메시지는 500자를 초과할 수 없습니다" },
        { status: 400 }
      );
    }

    // stance 유효성 검사
    if (!stance || !["PRO", "CON", "NEUTRAL"].includes(stance)) {
      return NextResponse.json(
        { error: "입장을 선택해주세요" },
        { status: 400 }
      );
    }

    // 욕설 필터링
    if (containsBannedWords(content)) {
      return NextResponse.json(
        { error: "부적절한 표현이 포함되어 있습니다" },
        { status: 400 }
      );
    }

    // 토론방 존재 및 상태 확인
    const room = await prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "토론방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (room.status === "ENDED") {
      return NextResponse.json(
        { error: "종료된 토론방에는 메시지를 작성할 수 없습니다" },
        { status: 400 }
      );
    }

    // 도배 방지: 최근 1초 내 메시지 확인
    const recentMessage = await prisma.liveMessage.findFirst({
      where: {
        roomId,
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 1000) },
      },
    });

    if (recentMessage) {
      return NextResponse.json(
        { error: "메시지는 1초에 한 번만 보낼 수 있습니다" },
        { status: 429 }
      );
    }

    const message = await prisma.liveMessage.create({
      data: {
        roomId,
        userId: session.user.id,
        content: content.trim(),
        stance: stance as Stance,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "메시지 작성에 실패했습니다" },
      { status: 500 }
    );
  }
}
