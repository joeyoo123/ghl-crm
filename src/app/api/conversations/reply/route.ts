import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { generateAIResponse } from "@/lib/ai";

export async function PUT(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const body = await req.json();
    const { contactId, channel } = body;

    if (!contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 });
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        channel: channel || "chat",
        subject: "AI Agent Test",
        status: "open",
        aiEnabled: true,
        contactId,
        userId: user.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: "ai_test_started",
        description: `AI agent test conversation started via ${channel || "chat"}`,
        contactId,
      },
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error("Failed to create test conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, message, contactName, channel } = body;

    if (!conversationId || !message) {
      return NextResponse.json({ error: "conversationId and message are required" }, { status: 400 });
    }

    const inboundMsg = await prisma.message.create({
      data: {
        body: message,
        direction: "inbound",
        channel: channel || "chat",
        conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: message, lastMessageAt: new Date() },
    });

    const allMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    const history = allMessages.map((m) => ({
      role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
      content: m.body,
    }));

    const aiReply = await generateAIResponse({
      contactName: contactName || "Customer",
      businessName: "Our Business",
      conversationHistory: history,
      channel: (channel || "chat") as "sms" | "email" | "chat",
      triggerType: "inquiry",
    });

    const outboundMsg = await prisma.message.create({
      data: {
        body: aiReply,
        direction: "outbound",
        channel: channel || "chat",
        isAiGenerated: true,
        conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: aiReply, lastMessageAt: new Date() },
    });

    return NextResponse.json({
      inbound: inboundMsg,
      aiReply: outboundMsg,
    });
  } catch (error) {
    console.error("Failed to process message:", error);
    return NextResponse.json(
      { error: "Failed to process message. Please try again." },
      { status: 500 }
    );
  }
}
