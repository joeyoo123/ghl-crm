import { prisma } from "./prisma";

export async function getDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@ghlcrm.com",
        password: "demo",
        role: "admin",
      },
    });
  }
  return user;
}
