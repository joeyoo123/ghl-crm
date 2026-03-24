import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";

export async function GET() {
  const user = await getDefaultUser();
  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  const contact = await prisma.contact.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      status: body.status || "lead",
      source: body.source || null,
      userId: user.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "contact_created",
      description: `New contact added: ${body.firstName} ${body.lastName}`,
      contactId: contact.id,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
