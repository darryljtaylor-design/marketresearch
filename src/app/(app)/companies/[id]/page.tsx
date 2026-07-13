import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAllUsers } from "@/lib/data/users";
import { Badge } from "@/components/badge";
import { NotesPanel } from "@/components/entity/notes-panel";
import { TasksPanel } from "@/components/entity/tasks-panel";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomFieldsDisplay } from "@/components/custom-fields/custom-fields-display";
import { EmailsPanel } from "@/components/entity/emails-panel";
import { getFieldDefs } from "@/lib/custom-fields";
import { deleteCompany } from "@/app/(app)/companies/actions";
import { addNote } from "@/lib/actions/notes";
import { createQuickTask } from "@/lib/actions/tasks";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, users, customFieldDefs] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true } },
        contacts: { orderBy: { firstName: "asc" } },
        opportunities: { orderBy: { createdAt: "desc" } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        tasks: { include: { assignedTo: { select: { name: true } } }, orderBy: { dueDate: "asc" } },
        emailMessages: { orderBy: { receivedAt: "desc" }, take: 20 },
      },
    }),
    getAllUsers(),
    getFieldDefs("COMPANY"),
  ]);
  if (!company) notFound();

  const detailPath = `/companies/${id}`;
  const noteAction = addNote.bind(null, "COMPANY", id, detailPath);
  const taskAction = createQuickTask.bind(null, "COMPANY", id, detailPath);
  const deleteAction = deleteCompany.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{company.name}</h1>
          <p className="text-sm text-slate-500">{company.industry ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/companies/${id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil size={16} /> Edit
          </Link>
          <form action={deleteAction}>
            <ConfirmSubmitButton
              confirmMessage="Delete this customer? This cannot be undone."
              className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        <InfoField label="Website" value={company.website} />
        <InfoField label="Phone" value={company.phone} />
        <InfoField
          label="Address"
          value={[company.street, company.city, company.state, company.postalCode, company.country]
            .filter(Boolean)
            .join(", ")}
        />
        <InfoField label="Owner" value={company.owner?.name ?? "Unassigned"} />
      </div>

      {company.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {company.description}
          </p>
        </div>
      )}

      <CustomFieldsDisplay defs={customFieldDefs} values={company.customFields as Record<string, unknown>} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Contacts</h2>
          <Link
            href={`/contacts/new?companyId=${id}`}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Plus size={14} /> Add contact
          </Link>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {company.contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/contacts/${c.id}`} className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                {c.firstName} {c.lastName}
              </Link>
              <span className="text-xs text-slate-400">{c.title ?? c.email ?? ""}</span>
            </li>
          ))}
          {company.contacts.length === 0 && (
            <p className="py-3 text-center text-sm text-slate-400">No contacts yet.</p>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Opportunities</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {company.opportunities.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/opportunities/${o.id}`} className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                {o.name}
              </Link>
              <div className="flex items-center gap-2">
                <Badge color="blue">{o.stage}</Badge>
                <span className="text-xs text-slate-400">
                  {o.amount ? `$${Number(o.amount).toLocaleString()}` : ""}
                </span>
              </div>
            </li>
          ))}
          {company.opportunities.length === 0 && (
            <p className="py-3 text-center text-sm text-slate-400">No opportunities yet.</p>
          )}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tasks</h2>
          <TasksPanel tasks={company.tasks} createAction={taskAction} detailPath={detailPath} users={users} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
          <NotesPanel notes={company.notes} action={noteAction} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Emails</h2>
        <EmailsPanel emails={company.emailMessages} />
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
