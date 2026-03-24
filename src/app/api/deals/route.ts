import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  const deal = await prisma.deal.create({
    data: {
      title: body.title,
      value: body.value || 0,
      stage: body.stage,
      pipelineId: body.pipelineId,
      contactId: body.contactId,
      userId: user.id,
    },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true, company: true },
      },
    },
  });

  await prisma.activity.create({
    data: {
      type: "deal_created",
      description: `New deal created: ${body.title} ($${body.value})`,
      contactId: body.contactId,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const deal = await prisma.deal.update({
    where: { id: body.id },
    data: {
      stage: body.stage,
      status: body.status,
    },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true, company: true },
      },
    },
  });

  await prisma.activity.create({
    data: {
      type: "deal_stage_changed",
      description: `Deal "${deal.title}" moved to ${body.stage}`,
      contactId: deal.contactId,
    },
  });

  return NextResponse.json(deal);
}
