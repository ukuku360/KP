import { notFound } from "next/navigation";
import { prisma } from "@politics/database";
import { PetitionDetail } from "@/components/petitions/petition-detail";
import { PetitionVoting } from "@/components/petitions/petition-voting";
import { PetitionComments } from "@/components/petitions/petition-comments";
import { PetitionHistory } from "@/components/petitions/petition-history";

interface PetitionDetailPageProps {
  params: { id: string };
}

async function getPetition(id: string) {
  const petition = await prisma.petition.findUnique({
    where: { id },
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

  return petition;
}

export default async function PetitionDetailPage({
  params,
}: PetitionDetailPageProps) {
  const petition = await getPetition(params.id);

  if (!petition) {
    notFound();
  }

  const voteStats = {
    total: petition.votes.length,
    agree: petition.votes.filter((v) => v.stance === "agree").length,
    disagree: petition.votes.filter((v) => v.stance === "disagree").length,
  };

  return (
    <div className="space-y-8">
      <PetitionDetail petition={petition} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <PetitionHistory history={petition.history} />
          <PetitionComments petitionId={petition.id} comments={petition.comments} />
        </div>
        <div>
          <PetitionVoting petitionId={petition.id} voteStats={voteStats} />
        </div>
      </div>
    </div>
  );
}
