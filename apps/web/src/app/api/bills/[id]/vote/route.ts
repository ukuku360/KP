import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@politics/database";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stance } = await request.json();

    if (!stance || stance < 1 || stance > 5) {
      return NextResponse.json(
        { error: "Invalid stance value" },
        { status: 400 }
      );
    }

    const vote = await prisma.billVote.upsert({
      where: {
        billId_userId: {
          billId: params.id,
          userId: session.user.id,
        },
      },
      update: { stance },
      create: {
        billId: params.id,
        userId: session.user.id,
        stance,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Error voting on bill:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
