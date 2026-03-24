export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const user = await getDefaultUser();

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <CalendarView
      initialAppointments={JSON.parse(JSON.stringify(appointments))}
      contacts={JSON.parse(JSON.stringify(contacts))}
    />
  );
}
