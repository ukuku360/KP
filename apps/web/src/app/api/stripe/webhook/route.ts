import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, BADGE_DURATION_DAYS } from "@/lib/stripe";
import { prisma, BadgeType } from "@politics/database";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // 이벤트 처리
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, badgeType, politicianId } = session.metadata || {};

  if (!userId || !badgeType) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // 멱등성: 이미 처리된 세션인지 확인
  const existingBadge = await prisma.supporterBadge.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingBadge) {
    console.log(`Badge already created for session: ${session.id}`);
    return;
  }

  // 만료일 계산 (30일 후)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + BADGE_DURATION_DAYS);

  // 뱃지 생성
  try {
    await prisma.supporterBadge.create({
      data: {
        userId,
        badgeType: badgeType as BadgeType,
        politicianId: politicianId || null,
        stripeSessionId: session.id,
        amount: session.amount_total || 0,
        expiresAt,
      },
    });

    console.log(`Badge created for user ${userId}, type: ${badgeType}`);
  } catch (error) {
    console.error("Error creating badge:", error);
    throw error;
  }
}

