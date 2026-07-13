import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deactivateOpportunityType, reactivateOpportunityType } from "@/app/(app)/settings/opportunity-types/actions";

export default async function OpportunityTypesSettingsPage() {
  const types = await prisma.opportunityType.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { opportunities: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunity pipelines</h1>
          <p className="text-sm text-slate-500">
            Define different opportunity types, each with its own pipeline stages.
          </p>
        </div>
        <Link
          href="/settings/opportunity-types/new"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New pipeline
        </Link>
      </div>

      <div className="space-y-3">
        {types.map((t) => {
          const stages = t.stages as Array<{ label: string }>;
          return (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/settings/opportunity-types/${t.id}`} className="font-medium text-slate-900 hover:text-blue-600 dark:text-white">
                    {t.name}
                  </Link>
                  {!t.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {stages.map((s) => s.label).join(" → ")} · {t._count.opportunities} opportunities
                </p>
              </div>
              <form
                action={
                  t.isActive
                    ? deactivateOpportunityType.bind(null, t.id)
                    : reactivateOpportunityType.bind(null, t.id)
                }
              >
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t.isActive ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            </div>
          );
        })}
        {types.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No pipelines yet. Create one to start tracking opportunities.
          </p>
        )}
      </div>
    </div>
  );
}
