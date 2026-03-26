import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { generateAIResponse } from "@/lib/ai";

export async function GET() {
  const user = await getDefaultUser();
  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    include: {
      contact: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  if (body.type === "simulate_missed_call") {
    const names = ["Sarah Johnson", "Mike Chen", "Emily Davis", "Alex Rodriguez", "Lisa Wang"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const [firstName, lastName] = randomName.split(" ");
    const phone = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let contact = await prisma.contact.findFirst({
      where: { firstName, lastName, userId: user.id },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          firstName,
          lastName,
          phone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          status: "lead",
          source: "Phone Call",
          userId: user.id,
        },
      });
    }

    await prisma.missedCall.create({
      data: { phone, callerName: randomName, autoReplied: true, replyMethod: "sms" },
    });

    const conversation = await prisma.conversation.create({
      data: {
        channel: "sms",
        subject: "Missed Call Follow-up",
        status: "open",
        aiEnabled: true,
        contactId: contact.id,
        userId: user.id,
      },
      include: { contact: true, messages: true },
    });

    const inboundMsg = await prisma.message.create({
      data: {
        body: `Missed call from ${randomName} (${phone})`,
        direction: "inbound",
        channel: "phone",
        conversationId: conversation.id,
      },
    });

    let aiReply: string;
    try {
      aiReply = await generateAIResponse({
        contactName: randomName,
        businessName: "Our Business",
        conversationHistory: [{ role: "user", content: `Missed call from ${phone}` }],
        channel: "sms",
        triggerType: "missed_call",
      });
    } catch {
      aiReply = `Hi ${firstName}! Sorry we missed your call. How can we help you today? Reply here or we'll call you back shortly.`;
    }

    const outboundMsg = await prisma.message.create({
      data: {
        body: aiReply,
        direction: "outbound",
        channel: "sms",
        isAiGenerated: true,
        conversationId: conversation.id,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: aiReply, lastMessageAt: new Date() },
    });

    await prisma.activity.create({
      data: {
        type: "missed_call_auto_reply",
        description: `AI auto-replied to missed call from ${randomName}`,
        contactId: contact.id,
      },
    });

    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ conversation: fullConversation }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const message = await prisma.message.create({
    data: {
      body: body.body,
      direction: body.direction,
      channel: body.channel || "chat",
      conversationId: body.conversationId,
    },
  });

  await prisma.conversation.update({
    where: { id: body.conversationId },
    data: { lastMessage: body.body, lastMessageAt: new Date() },
  });

  if (body.direction === "inbound") {
    const conversation = await prisma.conversation.findUnique({
      where: { id: body.conversationId },
      include: {
        contact: { select: { firstName: true, lastName: true } },
      },
    });

    if (conversation?.aiEnabled) {
      const allMessages = await prisma.message.findMany({
        where: { conversationId: body.conversationId },
        orderBy: { createdAt: "asc" },
      });

      const history = allMessages.map((m) => ({
        role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
        content: m.body,
      }));

      const contactName = `${conversation.contact.firstName} ${conversation.contact.lastName}`;

      const aiReply = await generateAIResponse({
        contactName,
        businessName: "Our Business",
        conversationHistory: history,
        channel: (conversation.channel || "chat") as "sms" | "email" | "chat",
        triggerType: "inquiry",
      });

      const aiMessage = await prisma.message.create({
        data: {
          body: aiReply,
          direction: "outbound",
          channel: conversation.channel || "chat",
          isAiGenerated: true,
          conversationId: body.conversationId,
        },
      });

      await prisma.conversation.update({
        where: { id: body.conversationId },
        data: { lastMessage: aiReply, lastMessageAt: new Date() },
      });

      return NextResponse.json({ message, aiReply: aiMessage });
    }
  }

  return NextResponse.json(message);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const conversation = await prisma.conversation.update({
    where: { id: body.conversationId },
    data: { aiEnabled: body.aiEnabled },
  });

  return NextResponse.json(conversation);
}
