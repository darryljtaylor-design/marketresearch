import Link from "next/link";
import { format, isPast } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cn, humanizeEnum } from "@/lib/utils";
import { Badge, TASK_PRIORITY_COLOR } from "@/components/badge";
import { toggleTaskComplete } from "@/lib/actions/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ assignee?: string; status?: string }>;
}) {
  const session = await auth();
  const { assignee = "me", status } = await searchParams;

  const where = {
    ...(assignee === "me" ? { assignedToId: session!.user.id } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      assignedTo: { select: { name: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      opportunity: { select: { id: true, name: true } },
    },
  });

  function relatedLink(t: (typeof tasks)[number]) {
    if (t.lead) return { href: `/leads/${t.lead.id}`, label: `${t.lead.firstName} ${t.lead.lastName}` };
    if (t.contact)
      return { href: `/contacts/${t.contact.id}`, label: `${t.contact.firstName} ${t.contact.lastName}` };
    if (t.company) return { href: `/companies/${t.company.id}`, label: t.company.name };
    if (t.opportunity) return { href: `/opportunities/${t.opportunity.id}`, label: t.opportunity.name };
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Tasks</h1>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/tasks?assignee=me" active={assignee === "me"}>
          My tasks
        </FilterLink>
        <FilterLink href="/tasks?assignee=all" active={assignee === "all"}>
          All tasks
        </FilterLink>
        <span className="mx-1 self-center text-slate-300">|</span>
        <FilterLink href={`/tasks?assignee=${assignee}`} active={!status}>
          All statuses
        </FilterLink>
        {["OPEN", "IN_PROGRESS", "COMPLETED", "DEFERRED"].map((s) => (
          <FilterLink key={s} href={`/tasks?assignee=${assignee}&status=${s}`} active={status === s}>
            {humanizeEnum(s)}
          </FilterLink>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5"></th>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5 hidden sm:table-cell">Related to</th>
              <th className="px-4 py-2.5">Due</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Priority</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Assigned to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => {
              const overdue = t.dueDate && isPast(t.dueDate) && t.status !== "COMPLETED";
              const related = relatedLink(t);
              return (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-2.5">
                    <form action={toggleTaskComplete.bind(null, t.id, "/tasks")}>
                      <button
                        type="submit"
                        className={cn(
                          "h-4 w-4 rounded border",
                          t.status === "COMPLETED"
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300 dark:border-slate-600"
                        )}
                        aria-label="Toggle complete"
                      />
                    </form>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/tasks/${t.id}`}
                      className={cn(
                        "font-medium hover:text-blue-600",
                        t.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"
                      )}
                    >
                      {t.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-slate-500">
                    {related ? (
                      <Link href={related.href} className="hover:text-blue-600">
                        {related.label}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={cn("px-4 py-2.5", overdue ? "font-medium text-red-600" : "text-slate-500")}>
                    {t.dueDate ? format(t.dueDate, "MMM d, h:mm a") : "—"}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <Badge color={TASK_PRIORITY_COLOR[t.priority]}>{humanizeEnum(t.priority)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">
                    {t.assignedTo?.name ?? "Unassigned"}
                  </td>
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium",
        active
          ? "bg-blue-600 text-white"
          : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      )}
    >
      {children}
    </Link>
  );
}
