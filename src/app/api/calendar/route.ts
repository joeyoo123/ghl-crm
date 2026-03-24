import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";

export async function GET() {
  const user = await getDefaultUser();
  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    include: { contact: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  const appointment = await prisma.appointment.create({
    data: {
      title: body.title,
      description: body.description || null,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      location: body.location || null,
      contactId: body.contactId || null,
      userId: user.id,
    },
    include: { contact: { select: { id: true, firstName: true, lastName: true } } },
  });

  await prisma.activity.create({
    data: {
      type: "appointment_created",
      description: `Appointment scheduled: ${body.title}`,
      contactId: body.contactId || null,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const appointment = await prisma.appointment.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json(appointment);
}
