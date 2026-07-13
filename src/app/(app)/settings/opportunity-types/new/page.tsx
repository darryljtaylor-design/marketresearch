import { OpportunityTypeForm } from "@/components/opportunities/opportunity-type-form";
import { createOpportunityType } from "@/app/(app)/settings/opportunity-types/actions";

export default function NewOpportunityTypePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New opportunity pipeline</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <OpportunityTypeForm action={createOpportunityType} submitLabel="Create pipeline" />
      </div>
    </div>
  );
}
