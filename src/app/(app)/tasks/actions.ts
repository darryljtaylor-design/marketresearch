"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations/task";
import { parseCustomFields } from "@/lib/custom-fields";
import { syncTaskToOutlookCalendar, deleteTaskFromOutlookCalendar } from "@/lib/graph/sync-calendar";

export async function updateTask(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = taskSchema.parse({
    subject: formData.get("subject"),
    description: (formData.get("description") ?? "").toString().trim() || undefined,
    dueDate: (formData.get("dueDate") ?? "").toString() || undefined,
    reminderAt: (formData.get("reminderAt") ?? "").toString() || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    assignedToId: (formData.get("assignedToId") ?? "").toString() || undefined,
  });

  const customFields = await parseCustomFields("TASK", formData);

  await prisma.task.update({
    where: { id },
    data: {
      subject: data.subject,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
      status: data.status,
      priority: data.priority,
      assignedToId: data.assignedToId || null,
      customFields,
      // A manual edit means any previous notification cooldown no longer applies.
      lastNotifiedAt: null,
    },
  });

  revalidatePath("/tasks");
  await syncTaskToOutlookCalendar(id);
  redirect("/tasks");
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({
    where: { id },
    select: { assignedToId: true, outlookEventId: true },
  });
  await prisma.task.delete({ where: { id } });
  if (task) await deleteTaskFromOutlookCalendar(task);

  revalidatePath("/tasks");
  redirect("/tasks");
}
