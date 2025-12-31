import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@politics/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petition = await prisma.petition.findUnique({
      where: { id: params.id },
      include: {
        votes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        history: {
          orderBy: { recordedAt: "desc" },
          take: 30,
        },
      },
    });

    if (!petition) {
      return NextResponse.json({ error: "Petition not found" }, { status: 404 });
    }

    return NextResponse.json(petition);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch petition" },
      { status: 500 }
    );
  }
}
