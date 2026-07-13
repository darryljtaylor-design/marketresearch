import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllUsers } from "@/lib/data/users";
import { Badge } from "@/components/badge";
import { NotesPanel } from "@/components/entity/notes-panel";
import { TasksPanel } from "@/components/entity/tasks-panel";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { StageSelect } from "@/components/opportunities/stage-select";
import { deleteOpportunity } from "@/app/(app)/opportunities/actions";
import { addNote } from "@/lib/actions/notes";
import { createQuickTask } from "@/lib/actions/tasks";
import type { StageValues } from "@/lib/validations/opportunity-type";
import { format } from "date-fns";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, users] = await Promise.all([
    prisma.opportunity.findUnique({
      where: { id },
      include: {
        opportunityType: true,
        company: true,
        contact: true,
        owner: { select: { name: true } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        tasks: { include: { assignedTo: { select: { name: true } } }, orderBy: { dueDate: "asc" } },
      },
    }),
    getAllUsers(),
  ]);
  if (!opportunity) notFound();

  const detailPath = `/opportunities/${id}`;
  const noteAction = addNote.bind(null, "OPPORTUNITY", id, detailPath);
  const taskAction = createQuickTask.bind(null, "OPPORTUNITY", id, detailPath);
  const deleteAction = deleteOpportunity.bind(null, id);
  const stages = (opportunity.opportunityType.stages as StageValues[]).sort((a, b) => a.order - b.order);
  const currentStageMeta = stages.find((s) => s.key === opportunity.stage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{opportunity.name}</h1>
            <Badge color="slate">{opportunity.opportunityType.name}</Badge>
            {opportunity.wonAt && <Badge color="emerald">Won</Badge>}
            {opportunity.lostAt && <Badge color="red">Lost</Badge>}
          </div>
          <p className="text-sm text-slate-500">
            {opportunity.company?.name ?? "No customer"}
            {opportunity.contact && ` · ${opportunity.contact.firstName} ${opportunity.contact.lastName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/opportunities/${id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil size={16} /> Edit
          </Link>
          <form action={deleteAction}>
            <ConfirmSubmitButton
              confirmMessage="Delete this opportunity? This cannot be undone."
              className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        <InfoField label="Amount" value={opportunity.amount ? `$${Number(opportunity.amount).toLocaleString()}` : "—"} />
        <InfoField
          label="Expected close"
          value={opportunity.closeDate ? format(opportunity.closeDate, "MMM d, yyyy") : "—"}
        />
        <InfoField label="Probability" value={`${currentStageMeta?.probability ?? opportunity.probability}%`} />
        <InfoField label="Owner" value={opportunity.owner?.name ?? "Unassigned"} />
        <div>
          <p className="mb-1 text-xs uppercase text-slate-400">Stage</p>
          <StageSelect opportunityId={opportunity.id} currentStage={opportunity.stage} stages={stages} />
        </div>
      </div>

      {opportunity.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {opportunity.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tasks</h2>
          <TasksPanel tasks={opportunity.tasks} createAction={taskAction} detailPath={detailPath} users={users} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
          <NotesPanel notes={opportunity.notes} action={noteAction} />
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="text-slate-700 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}
