import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_STAGES = [
  { id: "1", name: "New Lead", order: 0, color: "blue" },
  { id: "2", name: "Contacted", order: 1, color: "yellow" },
  { id: "3", name: "Qualified", order: 2, color: "purple" },
  { id: "4", name: "Proposal Sent", order: 3, color: "orange" },
  { id: "5", name: "Negotiation", order: 4, color: "cyan" },
  { id: "6", name: "Closed Won", order: 5, color: "green" },
  { id: "7", name: "Closed Lost", order: 6, color: "red" },
];

export async function GET() {
  const pipelines = await prisma.pipeline.findMany({
    include: { deals: { include: { contact: true } } },
  });
  return NextResponse.json(pipelines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pipeline = await prisma.pipeline.create({
    data: {
      name: body.name,
      stages: JSON.stringify(body.stages || DEFAULT_STAGES),
    },
  });

  return NextResponse.json(pipeline, { status: 201 });
}
