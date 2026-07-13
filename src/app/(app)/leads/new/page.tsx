import { LeadForm } from "@/components/leads/lead-form";
import { getAllUsers } from "@/lib/data/users";
import { createLead } from "@/app/(app)/leads/actions";

export default async function NewLeadPage() {
  const users = await getAllUsers();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New lead</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <LeadForm action={createLead} users={users} submitLabel="Create lead" />
      </div>
    </div>
  );
}
