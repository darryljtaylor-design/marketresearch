import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { StatCard } from "@/components/stat-card";
import { Target, Handshake, CheckSquare, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [openLeads, openOpportunities, dueTasks, pipelineValue, myTasks, recentLeads] =
    await Promise.all([
      prisma.lead.count({ where: { status: { notIn: ["CONVERTED", "UNQUALIFIED"] } } }),
      prisma.opportunity.count({ where: { wonAt: null, lostAt: null } }),
      prisma.task.count({
        where: { assignedToId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.opportunity.aggregate({
        where: { wonAt: null, lostAt: null },
        _sum: { amount: true },
      }),
      prisma.task.findMany({
        where: { assignedToId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy: { dueDate: "asc" },
        take: 6,
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Welcome back{session?.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Open leads"
          value={openLeads}
          href="/leads"
          color="text-amber-600 bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={Handshake}
          label="Open opportunities"
          value={openOpportunities}
          href="/opportunities"
          color="text-blue-600 bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={DollarSign}
          label="Pipeline value"
          value={`$${Number(pipelineValue._sum.amount ?? 0).toLocaleString()}`}
          href="/opportunities"
          color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={CheckSquare}
          label="My open tasks"
          value={dueTasks}
          href="/tasks"
          color="text-violet-600 bg-violet-50 dark:bg-violet-950/40"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              My upcoming tasks
            </h2>
            <Link href="/tasks" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {myTasks.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No open tasks. Nice work.</p>
          )}
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {myTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate text-slate-700 dark:text-slate-200">{t.subject}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {t.dueDate
                    ? formatDistanceToNow(t.dueDate, { addSuffix: true })
                    : "No due date"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent leads</h2>
            <Link href="/leads" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentLeads.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No leads yet.</p>
          )}
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLeads.map((l) => (
              <li key={l.id} className="py-2 text-sm">
                <Link href={`/leads/${l.id}`} className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                  {l.firstName} {l.lastName}
                </Link>
                <p className="text-xs text-slate-400">{l.companyName ?? l.email ?? "—"}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
