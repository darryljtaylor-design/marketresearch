import { prisma } from "@/lib/prisma";

const OVERDUE_RENOTIFY_MS = 24 * 60 * 60 * 1000;

// Creates in-app notifications for tasks whose reminder time has passed, or
// that are overdue. Safe to call repeatedly (e.g. on every notification-bell
// poll, and from a scheduled /api/cron/check-tasks hit) - each task is only
// renotified once its cooldown has elapsed, tracked via `lastNotifiedAt`.
export async function generateTaskDueNotifications(scopeUserId?: string) {
  const now = new Date();

  const candidates = await prisma.task.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      assignedToId: scopeUserId ?? { not: null },
      OR: [{ reminderAt: { lte: now } }, { dueDate: { lt: now } }],
    },
    select: {
      id: true,
      subject: true,
      dueDate: true,
      reminderAt: true,
      assignedToId: true,
      lastNotifiedAt: true,
    },
  });

  for (const task of candidates) {
    if (!task.assignedToId) continue;

    const reminderDue = task.reminderAt && task.reminderAt <= now;
    const overdue = task.dueDate && task.dueDate < now;

    const alreadyNotifiedForReminder =
      reminderDue && task.lastNotifiedAt && task.lastNotifiedAt >= task.reminderAt!;
    const recentlyNotifiedForOverdue =
      overdue &&
      task.lastNotifiedAt &&
      now.getTime() - task.lastNotifiedAt.getTime() < OVERDUE_RENOTIFY_MS;

    if (reminderDue && !alreadyNotifiedForReminder) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: "TASK_DUE",
          message: `Reminder: "${task.subject}" is due soon`,
          link: `/tasks/${task.id}`,
          taskId: task.id,
        },
      });
      await prisma.task.update({ where: { id: task.id }, data: { lastNotifiedAt: now } });
      continue;
    }

    if (overdue && !recentlyNotifiedForOverdue) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: "TASK_OVERDUE",
          message: `"${task.subject}" is overdue`,
          link: `/tasks/${task.id}`,
          taskId: task.id,
        },
      });
      await prisma.task.update({ where: { id: task.id }, data: { lastNotifiedAt: now } });
    }
  }
}
