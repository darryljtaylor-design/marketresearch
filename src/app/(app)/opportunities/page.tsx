import Link from "next/link";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { StageSelect } from "@/components/opportunities/stage-select";
import type { StageValues } from "@/lib/validations/opportunity-type";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; view?: string }>;
}) {
  const { type, view } = await searchParams;
  const opportunityTypes = await prisma.opportunityType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  if (opportunityTypes.length === 0) {
    return (
      <div className="max-w-xl rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500">
          Set up at least one opportunity pipeline to start tracking deals.
        </p>
        <Link
          href="/settings/opportunity-types/new"
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create a pipeline
        </Link>
      </div>
    );
  }

  const activeType = opportunityTypes.find((t) => t.id === type) ?? opportunityTypes[0];
  const isListView = view === "list";

  const opportunities = await prisma.opportunity.findMany({
    where: isListView ? {} : { opportunityTypeId: activeType.id },
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      owner: { select: { name: true } },
      opportunityType: { select: { name: true } },
    },
  });

  const stages = (activeType.stages as StageValues[]).sort((a, b) => a.order - b.order);
  const columns = stages.map((stage) => ({
    stage,
    items: opportunities.filter((o) => o.stage === stage.key),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunities</h1>
        <Link
          href="/opportunities/new"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New opportunity
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {opportunityTypes.map((t) => (
            <Link
              key={t.id}
              href={`/opportunities?type=${t.id}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                !isListView && t.id === activeType.id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {t.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Link
            href={`/opportunities?type=${activeType.id}`}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium",
              !isListView
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <LayoutGrid size={14} /> Board
          </Link>
          <Link
            href="/opportunities?view=list"
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium",
              isListView
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <ListIcon size={14} /> List
          </Link>
        </div>
      </div>

      {isListView ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5 hidden sm:table-cell">Pipeline</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Amount</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Customer</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {opportunities.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-2.5">
                    <Link href={`/opportunities/${o.id}`} className="font-medium text-slate-800 hover:text-blue-600 dark:text-slate-100">
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-slate-500">{o.opportunityType.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{o.stage}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">
                    {o.amount ? `$${Number(o.amount).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">{o.company?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">{o.owner?.name ?? "Unassigned"}</td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No opportunities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map(({ stage, items }) => {
            const columnTotal = items.reduce((sum, o) => sum + Number(o.amount ?? 0), 0);
            return (
              <div key={stage.key} className="w-72 shrink-0 rounded-xl bg-slate-100 p-3 dark:bg-slate-800/60">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stage.label}</h3>
                  <span className="text-xs text-slate-400">{items.length}</span>
                </div>
                {columnTotal > 0 && (
                  <p className="mb-2 px-1 text-xs text-slate-400">${columnTotal.toLocaleString()}</p>
                )}
                <div className="space-y-2">
                  {items.map((o) => (
                    <Link
                      key={o.id}
                      href={`/opportunities/${o.id}`}
                      className="block space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:shadow dark:border-slate-700 dark:bg-slate-900"
                    >
                      <p className="font-medium text-slate-800 dark:text-slate-100">{o.name}</p>
                      <p className="text-xs text-slate-400">{o.company?.name ?? "No customer"}</p>
                      {o.amount != null && (
                        <p className="text-xs font-medium text-emerald-600">
                          ${Number(o.amount).toLocaleString()}
                        </p>
                      )}
                      <StageSelect opportunityId={o.id} currentStage={o.stage} stages={stages} />
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                      No deals
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
