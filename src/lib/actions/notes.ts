"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FK_BY_ENTITY = {
  LEAD: "leadId",
  CONTACT: "contactId",
  COMPANY: "companyId",
  OPPORTUNITY: "opportunityId",
} as const;

export type NotableEntityType = keyof typeof FK_BY_ENTITY;

export async function addNote(
  entityType: NotableEntityType,
  entityId: string,
  detailPath: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const body = formData.get("body")?.toString().trim();
  if (!body) return;

  await prisma.note.create({
    data: {
      body,
      authorId: session.user.id,
      [FK_BY_ENTITY[entityType]]: entityId,
    },
  });

  revalidatePath(detailPath);
}
