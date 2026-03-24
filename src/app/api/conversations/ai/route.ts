import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const reply = await generateAIResponse({
    contactName: body.contactName,
    businessName: body.businessName || "Our Business",
    conversationHistory: body.messages || [],
    channel: body.channel || "chat",
    triggerType: body.triggerType || "inquiry",
  });

  return NextResponse.json({ reply });
}
