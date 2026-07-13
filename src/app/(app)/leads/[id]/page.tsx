import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowRightCircle, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllUsers } from "@/lib/data/users";
import { Badge, LEAD_STATUS_COLOR, LEAD_RATING_COLOR } from "@/components/badge";
import { humanizeEnum } from "@/lib/utils";
import { NotesPanel } from "@/components/entity/notes-panel";
import { TasksPanel } from "@/components/entity/tasks-panel";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deleteLead } from "@/app/(app)/leads/actions";
import { addNote } from "@/lib/actions/notes";
import { createQuickTask } from "@/lib/actions/tasks";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, users] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        tasks: {
          include: { assignedTo: { select: { name: true } } },
          orderBy: { dueDate: "asc" },
        },
        convertedContact: true,
      },
    }),
    getAllUsers(),
  ]);
  if (!lead) notFound();

  const detailPath = `/leads/${id}`;
  const noteAction = addNote.bind(null, "LEAD", id, detailPath);
  const taskAction = createQuickTask.bind(null, "LEAD", id, detailPath);
  const deleteAction = deleteLead.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {lead.firstName} {lead.lastName}
            </h1>
            <Badge color={LEAD_STATUS_COLOR[lead.status]}>{humanizeEnum(lead.status)}</Badge>
            <Badge color={LEAD_RATING_COLOR[lead.rating]}>{humanizeEnum(lead.rating)}</Badge>
          </div>
          <p className="text-sm text-slate-500">{lead.companyName ?? lead.title ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          {lead.status !== "CONVERTED" && (
            <Link
              href={`/leads/${id}/convert`}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <ArrowRightCircle size={16} /> Convert
            </Link>
          )}
          <Link
            href={`/leads/${id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil size={16} /> Edit
          </Link>
          <form action={deleteAction}>
            <ConfirmSubmitButton
              confirmMessage="Delete this lead? This cannot be undone."
              className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      {lead.status === "CONVERTED" && lead.convertedContact && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Converted to contact{" "}
          <Link href={`/contacts/${lead.convertedContact.id}`} className="font-medium underline">
            {lead.convertedContact.firstName} {lead.convertedContact.lastName}
          </Link>
          .
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        <InfoField label="Email" value={lead.email} />
        <InfoField label="Phone" value={lead.phone} />
        <InfoField label="Source" value={lead.source} />
        <InfoField label="Owner" value={lead.owner?.name ?? "Unassigned"} />
      </div>

      {lead.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {lead.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tasks</h2>
          <TasksPanel tasks={lead.tasks} createAction={taskAction} detailPath={detailPath} users={users} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
          <NotesPanel notes={lead.notes} action={noteAction} />
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
