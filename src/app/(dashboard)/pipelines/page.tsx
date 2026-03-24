export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { PipelineBoard } from "@/components/pipelines/pipeline-board";

export default async function PipelinesPage() {
  const user = await getDefaultUser();

  const pipelines = await prisma.pipeline.findMany({
    include: {
      deals: {
        where: { userId: user.id },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, company: true },
          },
        },
      },
    },
  });

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <PipelineBoard
      initialPipelines={JSON.parse(JSON.stringify(pipelines))}
      contacts={JSON.parse(JSON.stringify(contacts))}
    />
  );
}
