import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllUsers } from "@/lib/data/users";
import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { humanizeEnum } from "@/lib/utils";
import { updateTask, deleteTask } from "@/app/(app)/tasks/actions";

function toLocalInputValue(d: Date | null) {
  if (!d) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, users] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        opportunity: { select: { id: true, name: true } },
      },
    }),
    getAllUsers(),
  ]);
  if (!task) notFound();

  const related = task.lead
    ? { href: `/leads/${task.lead.id}`, label: `${task.lead.firstName} ${task.lead.lastName}`, type: "Lead" }
    : task.contact
      ? { href: `/contacts/${task.contact.id}`, label: `${task.contact.firstName} ${task.contact.lastName}`, type: "Contact" }
      : task.company
        ? { href: `/companies/${task.company.id}`, label: task.company.name, type: "Customer" }
        : task.opportunity
          ? { href: `/opportunities/${task.opportunity.id}`, label: task.opportunity.name, type: "Opportunity" }
          : null;

  const action = updateTask.bind(null, id);
  const deleteAction = deleteTask.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Task</h1>
        <form action={deleteAction}>
          <ConfirmSubmitButton
            confirmMessage="Delete this task?"
            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
          >
            <Trash2 size={16} /> Delete
          </ConfirmSubmitButton>
        </form>
      </div>

      {related && (
        <p className="text-sm text-slate-500">
          Related to {related.type.toLowerCase()}{" "}
          <Link href={related.href} className="font-medium text-blue-600 hover:underline">
            {related.label}
          </Link>
        </p>
      )}

      <form action={action} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Field label="Subject" htmlFor="subject" required>
          <TextInput id="subject" name="subject" required defaultValue={task.subject} />
        </Field>
        <Field label="Description" htmlFor="description">
          <TextArea id="description" name="description" defaultValue={task.description ?? ""} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Due date" htmlFor="dueDate">
            <TextInput
              id="dueDate"
              name="dueDate"
              type="datetime-local"
              defaultValue={toLocalInputValue(task.dueDate)}
            />
          </Field>
          <Field label="Reminder" htmlFor="reminderAt">
            <TextInput
              id="reminderAt"
              name="reminderAt"
              type="datetime-local"
              defaultValue={toLocalInputValue(task.reminderAt)}
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={task.status}>
              {["OPEN", "IN_PROGRESS", "COMPLETED", "DEFERRED"].map((s) => (
                <option key={s} value={s}>
                  {humanizeEnum(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={task.priority}>
              {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>
                  {humanizeEnum(p)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assigned to" htmlFor="assignedToId">
            <Select id="assignedToId" name="assignedToId" defaultValue={task.assignedToId ?? ""}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
