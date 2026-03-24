import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { AutomationList } from "@/components/automations/automation-list";

export default async function AutomationsPage() {
  const user = await getDefaultUser();

  const automations = await prisma.automation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AutomationList
      initialAutomations={JSON.parse(JSON.stringify(automations))}
    />
  );
}
