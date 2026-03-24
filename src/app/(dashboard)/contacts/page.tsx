import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { ContactList } from "@/components/contacts/contact-list";

export default async function ContactsPage() {
  const user = await getDefaultUser();
  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContactList
      initialContacts={JSON.parse(JSON.stringify(contacts))}
    />
  );
}
