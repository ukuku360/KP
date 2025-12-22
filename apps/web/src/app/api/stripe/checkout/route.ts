import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, BADGE_PRICES } from "@/lib/stripe";
import { prisma, BadgeType } from "@politics/database";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await request.json();
    const { badgeType, politicianId } = body as {
      badgeType: BadgeType;
      politicianId?: string;
    };

    // 유효성 검사
    if (!badgeType || !Object.values(BadgeType).includes(badgeType)) {
      return NextResponse.json(
        { error: "올바른 뱃지 타입을 선택해주세요" },
        { status: 400 }
      );
    }

    // 정치인 팬 뱃지인 경우 politicianId 필수
    if (badgeType === BadgeType.POLITICIAN_FAN && !politicianId) {
      return NextResponse.json(
        { error: "정치인을 선택해주세요" },
        { status: 400 }
      );
    }

    // 정치인 존재 확인
    let politicianName = "";
    if (politicianId) {
      const politician = await prisma.politician.findUnique({
        where: { id: politicianId },
        select: { name: true },
      });
      if (!politician) {
        return NextResponse.json(
          { error: "존재하지 않는 정치인입니다" },
          { status: 400 }
        );
      }
      politicianName = politician.name;
    }

    // 가격 설정
    const price = badgeType === BadgeType.SUPPORTER 
      ? BADGE_PRICES.SUPPORTER 
      : BADGE_PRICES.POLITICIAN_FAN;

    // 상품명 설정
    const productName = badgeType === BadgeType.SUPPORTER
      ? "서포터 뱃지 (1개월)"
      : `${politicianName} 팬 뱃지 (1개월)`;

    // Stripe Checkout 세션 생성
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "krw",
            product_data: {
              name: productName,
              description: badgeType === BadgeType.SUPPORTER
                ? "닉네임 옆에 서포터 뱃지가 표시됩니다"
                : `${politicianName}님을 응원하는 팬 뱃지가 표시됩니다`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/badge/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/badge`,
      metadata: {
        userId: session.user.id,
        badgeType,
        politicianId: politicianId || "",
      },
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "결제 세션 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

