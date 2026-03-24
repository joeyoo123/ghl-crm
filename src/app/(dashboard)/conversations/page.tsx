export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { ConversationView } from "@/components/conversations/conversation-view";

export default async function ConversationsPage() {
  const user = await getDefaultUser();

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <ConversationView
      initialConversations={JSON.parse(JSON.stringify(conversations))}
    />
  );
}
