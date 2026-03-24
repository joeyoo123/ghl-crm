import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";

export async function GET() {
  const user = await getDefaultUser();

  const [totalContacts, totalDeals, openDeals, activeConversations, missedCalls] =
    await Promise.all([
      prisma.contact.count({ where: { userId: user.id } }),
      prisma.deal.count({ where: { userId: user.id } }),
      prisma.deal.count({ where: { userId: user.id, status: "open" } }),
      prisma.conversation.count({ where: { userId: user.id, status: "open" } }),
      prisma.missedCall.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

  const revenue = await prisma.deal.aggregate({
    where: { userId: user.id, status: "won" },
    _sum: { value: true },
  });

  const pipelineValue = await prisma.deal.aggregate({
    where: { userId: user.id, status: "open" },
    _sum: { value: true },
  });

  return NextResponse.json({
    totalContacts,
    totalDeals,
    openDeals,
    totalRevenue: revenue._sum.value || 0,
    pipelineValue: pipelineValue._sum.value || 0,
    activeConversations,
    missedCalls,
  });
}
