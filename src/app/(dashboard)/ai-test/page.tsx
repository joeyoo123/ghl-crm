export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { AITestChat } from "@/components/conversations/ai-test-chat";

export default async function AITestPage() {
  const user = await getDefaultUser();

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    select: { id: true, firstName: true, lastName: true, phone: true, email: true },
    take: 20,
  });

  return (
    <AITestChat
      contacts={JSON.parse(JSON.stringify(contacts))}
    />
  );
}
