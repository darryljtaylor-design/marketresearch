import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllUsers } from "@/lib/data/users";
import { Badge } from "@/components/badge";
import { NotesPanel } from "@/components/entity/notes-panel";
import { TasksPanel } from "@/components/entity/tasks-panel";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomFieldsDisplay } from "@/components/custom-fields/custom-fields-display";
import { getFieldDefs } from "@/lib/custom-fields";
import { deleteContact } from "@/app/(app)/contacts/actions";
import { addNote } from "@/lib/actions/notes";
import { createQuickTask } from "@/lib/actions/tasks";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, users, customFieldDefs] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        owner: { select: { name: true } },
        opportunities: { orderBy: { createdAt: "desc" } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        tasks: { include: { assignedTo: { select: { name: true } } }, orderBy: { dueDate: "asc" } },
      },
    }),
    getAllUsers(),
    getFieldDefs("CONTACT"),
  ]);
  if (!contact) notFound();

  const detailPath = `/contacts/${id}`;
  const noteAction = addNote.bind(null, "CONTACT", id, detailPath);
  const taskAction = createQuickTask.bind(null, "CONTACT", id, detailPath);
  const deleteAction = deleteContact.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="text-sm text-slate-500">
            {contact.title ?? "—"}
            {contact.company && (
              <>
                {" · "}
                <Link href={`/companies/${contact.company.id}`} className="hover:text-blue-600">
                  {contact.company.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/contacts/${id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil size={16} /> Edit
          </Link>
          <form action={deleteAction}>
            <ConfirmSubmitButton
              confirmMessage="Delete this contact? This cannot be undone."
              className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        <InfoField label="Email" value={contact.email} />
        <InfoField label="Phone" value={contact.phone} />
        <InfoField label="Mobile" value={contact.mobile} />
        <InfoField label="Owner" value={contact.owner?.name ?? "Unassigned"} />
      </div>

      {contact.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {contact.description}
          </p>
        </div>
      )}

      <CustomFieldsDisplay defs={customFieldDefs} values={contact.customFields as Record<string, unknown>} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Opportunities</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {contact.opportunities.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/opportunities/${o.id}`} className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                {o.name}
              </Link>
              <Badge color="blue">{o.stage}</Badge>
            </li>
          ))}
          {contact.opportunities.length === 0 && (
            <p className="py-3 text-center text-sm text-slate-400">No opportunities yet.</p>
          )}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tasks</h2>
          <TasksPanel tasks={contact.tasks} createAction={taskAction} detailPath={detailPath} users={users} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
          <NotesPanel notes={contact.notes} action={noteAction} />
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
