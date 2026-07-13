import { notFound } from "next/navigation";
import { LeadForm } from "@/components/leads/lead-form";
import { getAllUsers } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { updateLead } from "@/app/(app)/leads/actions";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, users] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    getAllUsers(),
  ]);
  if (!lead) notFound();

  const action = updateLead.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit lead</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <LeadForm action={action} users={users} defaultValues={lead} submitLabel="Save changes" />
      </div>
    </div>
  );
}
