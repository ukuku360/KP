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

    if (!stance || !["agree", "disagree"].includes(stance)) {
      return NextResponse.json(
        { error: "Invalid stance value" },
        { status: 400 }
      );
    }

    const vote = await prisma.petitionVote.upsert({
      where: {
        petitionId_userId: {
          petitionId: params.id,
          userId: session.user.id,
        },
      },
      update: { stance },
      create: {
        petitionId: params.id,
        userId: session.user.id,
        stance,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Error voting on petition:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
