import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";

export async function GET() {
  const user = await getDefaultUser();
  const automations = await prisma.automation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(automations);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  const automation = await prisma.automation.create({
    data: {
      name: body.name,
      trigger: body.trigger,
      actions: JSON.stringify(body.actions || []),
      userId: user.id,
    },
  });

  return NextResponse.json(automation, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const automation = await prisma.automation.update({
    where: { id: body.id },
    data: { isActive: body.isActive },
  });

  return NextResponse.json(automation);
}
