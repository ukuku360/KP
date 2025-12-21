import { notFound } from "next/navigation";
import { prisma } from "@politics/database";
import { BillDetail } from "@/components/bills/bill-detail";
import { BillVoting } from "@/components/bills/bill-voting";
import { BillComments } from "@/components/bills/bill-comments";

interface BillDetailPageProps {
  params: { id: string };
}

async function getBill(id: string) {
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      files: true,
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
    },
  });

  return bill;
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const bill = await getBill(params.id);

  if (!bill) {
    notFound();
  }

  const voteStats = {
    total: bill.votes.length,
    distribution: [1, 2, 3, 4, 5].map(
      (stance) => bill.votes.filter((v) => v.stance === stance).length
    ),
  };

  return (
    <div className="space-y-8">
      <BillDetail bill={bill} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BillComments billId={bill.id} comments={bill.comments} />
        </div>
        <div>
          <BillVoting billId={bill.id} voteStats={voteStats} />
        </div>
      </div>
    </div>
  );
}
