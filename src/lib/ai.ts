import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AIContext = {
  contactName: string;
  businessName?: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  channel: "sms" | "email" | "chat";
  triggerType: "missed_call" | "inquiry" | "follow_up";
};

const SYSTEM_PROMPTS: Record<string, string> = {
  missed_call: `You are a helpful business assistant responding to a missed call. Be professional, friendly, and concise. Acknowledge you missed their call, ask how you can help, and offer to schedule a callback or answer their question via text. Keep SMS responses under 160 characters when the channel is SMS.`,
  inquiry: `You are a helpful business assistant responding to a customer inquiry. Be professional, knowledgeable, and helpful. Answer their questions, provide relevant information, and guide them toward booking an appointment or making a purchase if appropriate.`,
  follow_up: `You are a helpful business assistant following up with a lead. Be warm but not pushy. Reference any previous interactions and check if they have any questions or need assistance.`,
};

export async function generateAIResponse(context: AIContext): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[context.triggerType] || SYSTEM_PROMPTS.inquiry;
  
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${systemPrompt}\n\nYou are responding to: ${context.contactName}${context.businessName ? ` on behalf of ${context.businessName}` : ""}. Channel: ${context.channel}.`,
    },
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: context.channel === "sms" ? 100 : 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Thank you for reaching out. How can I help you today?";
  } catch (error) {
    console.error("AI response generation failed:", error);
    return getFallbackResponse(context.triggerType, context.channel);
  }
}

function getFallbackResponse(triggerType: string, channel: string): string {
  const responses: Record<string, Record<string, string>> = {
    missed_call: {
      sms: "Sorry we missed your call! How can we help you today? Reply here or we'll call you back shortly.",
      email: "We're sorry we missed your call. Please let us know how we can assist you, and we'll get back to you as soon as possible.",
      chat: "Sorry we missed your call! How can I help you today?",
    },
    inquiry: {
      sms: "Thanks for reaching out! How can we help you today?",
      email: "Thank you for your inquiry. We'd be happy to help. Could you provide more details about what you're looking for?",
      chat: "Thanks for reaching out! How can I help you today?",
    },
    follow_up: {
      sms: "Hi! Just checking in. Do you have any questions we can help with?",
      email: "Hi! I wanted to follow up and see if you had any questions. We're here to help whenever you're ready.",
      chat: "Hi! Just following up. Is there anything I can help you with?",
    },
  };

  return responses[triggerType]?.[channel] || "Thank you for reaching out. How can we help you today?";
}

export async function generateMissedCallReply(
  callerName: string,
  phone: string,
  businessName: string
): Promise<{ smsReply: string; emailReply: string }> {
  const smsReply = await generateAIResponse({
    contactName: callerName || "there",
    businessName,
    conversationHistory: [
      { role: "user", content: `Missed call from ${phone}` },
    ],
    channel: "sms",
    triggerType: "missed_call",
  });

  const emailReply = await generateAIResponse({
    contactName: callerName || "Valued Customer",
    businessName,
    conversationHistory: [
      { role: "user", content: `Missed call from ${callerName || phone}` },
    ],
    channel: "email",
    triggerType: "missed_call",
  });

  return { smsReply, emailReply };
}
