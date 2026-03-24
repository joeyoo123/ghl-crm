import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@ghlcrm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@ghlcrm.com",
      password: "demo",
      role: "admin",
    },
  });

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1 (555) 234-5678",
        company: "Johnson Marketing Co",
        status: "customer",
        source: "Website",
        userId: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.chen@techstart.io",
        phone: "+1 (555) 345-6789",
        company: "TechStart Inc",
        status: "prospect",
        source: "Referral",
        userId: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.d@designstudio.com",
        phone: "+1 (555) 456-7890",
        company: "Design Studio LLC",
        status: "lead",
        source: "Google Ads",
        userId: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Alex",
        lastName: "Rodriguez",
        email: "alex.r@fitnesshub.com",
        phone: "+1 (555) 567-8901",
        company: "FitnessHub",
        status: "customer",
        source: "Facebook",
        userId: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Lisa",
        lastName: "Wang",
        email: "lisa.wang@cloudnine.co",
        phone: "+1 (555) 678-9012",
        company: "CloudNine Solutions",
        status: "prospect",
        source: "LinkedIn",
        userId: user.id,
      },
    }),
  ]);

  const pipeline = await prisma.pipeline.create({
    data: {
      name: "Sales Pipeline",
      stages: JSON.stringify([
        { id: "1", name: "New Lead", order: 0, color: "blue" },
        { id: "2", name: "Contacted", order: 1, color: "yellow" },
        { id: "3", name: "Qualified", order: 2, color: "purple" },
        { id: "4", name: "Proposal Sent", order: 3, color: "orange" },
        { id: "5", name: "Negotiation", order: 4, color: "cyan" },
        { id: "6", name: "Closed Won", order: 5, color: "green" },
        { id: "7", name: "Closed Lost", order: 6, color: "red" },
      ]),
    },
  });

  await Promise.all([
    prisma.deal.create({
      data: {
        title: "Website Redesign",
        value: 15000,
        stage: "Proposal Sent",
        contactId: contacts[0].id,
        pipelineId: pipeline.id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Marketing Automation Setup",
        value: 8500,
        stage: "Qualified",
        contactId: contacts[1].id,
        pipelineId: pipeline.id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Brand Identity Package",
        value: 5000,
        stage: "New Lead",
        contactId: contacts[2].id,
        pipelineId: pipeline.id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Annual Social Media Management",
        value: 24000,
        stage: "Negotiation",
        contactId: contacts[3].id,
        pipelineId: pipeline.id,
        userId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Cloud Migration",
        value: 35000,
        stage: "Contacted",
        contactId: contacts[4].id,
        pipelineId: pipeline.id,
        userId: user.id,
      },
    }),
  ]);

  const conversation = await prisma.conversation.create({
    data: {
      channel: "sms",
      subject: "Missed Call Follow-up",
      status: "open",
      aiEnabled: true,
      lastMessage: "Hi Sarah! Sorry we missed your call. How can we help you today?",
      lastMessageAt: new Date(),
      contactId: contacts[0].id,
      userId: user.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        body: "Missed call from Sarah Johnson (+1 (555) 234-5678)",
        direction: "inbound",
        channel: "phone",
        conversationId: conversation.id,
      },
      {
        body: "Hi Sarah! Sorry we missed your call. How can we help you today? Reply here or we'll call you back shortly.",
        direction: "outbound",
        channel: "sms",
        isAiGenerated: true,
        conversationId: conversation.id,
      },
      {
        body: "Hi! I was calling about the website redesign proposal. Can you send me the latest version?",
        direction: "inbound",
        channel: "sms",
        conversationId: conversation.id,
      },
      {
        body: "Of course! I'll email you the updated proposal right away. Is there anything specific you'd like us to revise?",
        direction: "outbound",
        channel: "sms",
        isAiGenerated: true,
        conversationId: conversation.id,
      },
    ],
  });

  const emailConversation = await prisma.conversation.create({
    data: {
      channel: "email",
      subject: "Pricing Inquiry",
      status: "open",
      aiEnabled: true,
      lastMessage: "Thanks for your interest! I'd be happy to walk you through our packages.",
      lastMessageAt: new Date(Date.now() - 3600000),
      contactId: contacts[1].id,
      userId: user.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        body: "Hi, I'm interested in your marketing automation services. Could you send me pricing information?",
        direction: "inbound",
        channel: "email",
        conversationId: emailConversation.id,
      },
      {
        body: "Thanks for your interest! I'd be happy to walk you through our packages. We offer three tiers: Starter ($500/mo), Growth ($1,200/mo), and Enterprise (custom pricing). Would you like to schedule a call to discuss which fits your needs?",
        direction: "outbound",
        channel: "email",
        isAiGenerated: true,
        conversationId: emailConversation.id,
      },
    ],
  });

  const now = new Date();
  await Promise.all([
    prisma.appointment.create({
      data: {
        title: "Discovery Call - Website Redesign",
        description: "Discuss requirements for the website redesign project",
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        location: "Zoom",
        contactId: contacts[0].id,
        userId: user.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Marketing Strategy Review",
        description: "Quarterly marketing strategy review",
        startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 27 * 60 * 60 * 1000),
        location: "Office",
        contactId: contacts[1].id,
        userId: user.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Brand Identity Presentation",
        startTime: new Date(now.getTime() + 50 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 51 * 60 * 60 * 1000),
        location: "Google Meet",
        contactId: contacts[2].id,
        userId: user.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.automation.create({
      data: {
        name: "Missed Call Auto-Reply",
        trigger: "missed_call",
        actions: JSON.stringify(["ai_reply", "send_sms"]),
        isActive: true,
        runCount: 12,
        lastRun: new Date(Date.now() - 30 * 60 * 1000),
        userId: user.id,
      },
    }),
    prisma.automation.create({
      data: {
        name: "New Lead Welcome Email",
        trigger: "new_lead",
        actions: JSON.stringify(["send_email", "notify"]),
        isActive: true,
        runCount: 45,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: user.id,
      },
    }),
    prisma.automation.create({
      data: {
        name: "Deal Stage Notification",
        trigger: "deal_stage_change",
        actions: JSON.stringify(["notify", "send_email"]),
        isActive: false,
        runCount: 8,
        userId: user.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.activity.create({
      data: {
        type: "missed_call_auto_reply",
        description: "AI auto-replied to missed call from Sarah Johnson",
        contactId: contacts[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "deal_created",
        description: "New deal created: Website Redesign ($15,000)",
        contactId: contacts[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "contact_created",
        description: "New contact added: Mike Chen from TechStart Inc",
        contactId: contacts[1].id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email_sent",
        description: "AI replied to pricing inquiry from Mike Chen",
        contactId: contacts[1].id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "appointment_created",
        description: "Discovery Call scheduled with Sarah Johnson",
        contactId: contacts[0].id,
      },
    }),
  ]);

  await prisma.missedCall.create({
    data: {
      phone: "+1 (555) 234-5678",
      callerName: "Sarah Johnson",
      autoReplied: true,
      replyMethod: "sms",
      replyBody: "Hi Sarah! Sorry we missed your call. How can we help you today?",
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
