"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { RelatedEntityType } from "@/generated/prisma/client";

const FK_BY_ENTITY: Record<RelatedEntityType, string> = {
  LEAD: "leadId",
  CONTACT: "contactId",
  COMPANY: "companyId",
  OPPORTUNITY: "opportunityId",
};

export async function createQuickTask(
  entityType: RelatedEntityType,
  entityId: string,
  detailPath: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const subject = formData.get("subject")?.toString().trim();
  if (!subject) return;

  const dueDateRaw = formData.get("dueDate")?.toString();
  const assignedToId = formData.get("assignedToId")?.toString() || session.user.id;
  const priority = (formData.get("priority")?.toString() || "NORMAL") as
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT";

  await prisma.task.create({
    data: {
      subject,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      assignedToId,
      createdById: session.user.id,
      priority,
      relatedType: entityType,
      [FK_BY_ENTITY[entityType]]: entityId,
    },
  });

  revalidatePath(detailPath);
  revalidatePath("/tasks");
}

export async function toggleTaskComplete(taskId: string, detailPath: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  await prisma.task.update({
    where: { id: taskId },
    data: { status: task.status === "COMPLETED" ? "OPEN" : "COMPLETED" },
  });

  revalidatePath(detailPath);
  revalidatePath("/tasks");
}
