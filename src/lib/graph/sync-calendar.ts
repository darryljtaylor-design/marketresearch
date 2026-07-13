import { prisma } from "@/lib/prisma";
import { getGraphClientForUser } from "@/lib/graph/client";

// Best-effort: a task without a due date, or an assignee who hasn't
// connected Outlook, simply isn't pushed to a calendar. Failures here
// should never block saving the task in the CRM itself.
export async function syncTaskToOutlookCalendar(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task?.assignedToId || !task.dueDate) return;

  const client = await getGraphClientForUser(task.assignedToId);
  if (!client) return;

  const start = task.dueDate;
  const end = new Date(start.getTime() + 30 * 60_000);
  const eventBody = {
    subject: `[CRM] ${task.subject}`,
    body: { contentType: "text", content: task.description ?? "" },
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    isReminderOn: true,
    reminderMinutesBeforeStart: 15,
  };

  try {
    if (task.outlookEventId) {
      await client.api(`/me/events/${task.outlookEventId}`).update(eventBody);
    } else {
      const created = await client.api("/me/events").post(eventBody);
      await prisma.task.update({ where: { id: taskId }, data: { outlookEventId: created.id } });
    }
  } catch {
    // Outlook sync is best-effort; the task remains valid in the CRM.
  }
}

export async function deleteTaskFromOutlookCalendar(task: {
  assignedToId: string | null;
  outlookEventId: string | null;
}) {
  if (!task.assignedToId || !task.outlookEventId) return;
  const client = await getGraphClientForUser(task.assignedToId);
  if (!client) return;
  try {
    await client.api(`/me/events/${task.outlookEventId}`).delete();
  } catch {
    // already gone, or Outlook unreachable - nothing more to do
  }
}
