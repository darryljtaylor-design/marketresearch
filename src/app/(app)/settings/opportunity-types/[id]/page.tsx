import { notFound } from "next/navigation";
import { OpportunityTypeForm } from "@/components/opportunities/opportunity-type-form";
import { prisma } from "@/lib/prisma";
import { updateOpportunityType } from "@/app/(app)/settings/opportunity-types/actions";
import type { StageValues } from "@/lib/validations/opportunity-type";

export default async function EditOpportunityTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const type = await prisma.opportunityType.findUnique({ where: { id } });
  if (!type) notFound();

  const action = updateOpportunityType.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit {type.name}</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <OpportunityTypeForm
          action={action}
          defaultName={type.name}
          defaultDescription={type.description}
          defaultStages={type.stages as StageValues[]}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
