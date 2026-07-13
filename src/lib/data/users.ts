import { prisma } from "@/lib/prisma";

export function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}
