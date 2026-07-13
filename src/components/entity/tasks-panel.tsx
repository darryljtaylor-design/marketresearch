import { format } from "date-fns";
import { Badge, TASK_PRIORITY_COLOR } from "@/components/badge";
import { humanizeEnum } from "@/lib/utils";
import { toggleTaskComplete } from "@/lib/actions/tasks";

type TaskItem = {
  id: string;
  subject: string;
  dueDate: Date | null;
  status: string;
  priority: string;
  assignedTo: { name: string | null } | null;
};

export function TasksPanel({
  tasks,
  createAction,
  detailPath,
  users,
}: {
  tasks: TaskItem[];
  createAction: (formData: FormData) => void;
  detailPath: string;
  users: { id: string; name: string | null; email: string | null }[];
}) {
  const toggleAction = toggleTaskComplete.bind(null);

  return (
    <div className="space-y-4">
      <form action={createAction} className="flex flex-wrap gap-2">
        <input
          name="subject"
          required
          placeholder="Follow up call..."
          className="min-w-[10rem] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
        />
        <input
          name="dueDate"
          type="datetime-local"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          name="assignedToId"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue="NORMAL"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
            <option key={p} value={p}>
              {humanizeEnum(p)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add task
        </button>
      </form>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <form action={toggleAction.bind(null, t.id, detailPath)}>
              <button
                type="submit"
                className={`h-4 w-4 shrink-0 rounded border ${
                  t.status === "COMPLETED"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                aria-label="Toggle complete"
              />
            </form>
            <span
              className={`flex-1 truncate ${
                t.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {t.subject}
            </span>
            <Badge color={TASK_PRIORITY_COLOR[t.priority]}>{humanizeEnum(t.priority)}</Badge>
            <span className="w-28 shrink-0 text-right text-xs text-slate-400">
              {t.dueDate ? format(t.dueDate, "MMM d, h:mm a") : "No due date"}
            </span>
          </li>
        ))}
        {tasks.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No tasks yet.</p>
        )}
      </ul>
    </div>
  );
}
