import { notFound } from "next/navigation";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { getAllUsers } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { updateOpportunity } from "@/app/(app)/opportunities/actions";
import type { StageValues } from "@/lib/validations/opportunity-type";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, users, companies, contacts, opportunityTypes] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id } }),
    getAllUsers(),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contact.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    prisma.opportunityType.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!opportunity) notFound();

  const action = updateOpportunity.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit opportunity</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <OpportunityForm
          action={action}
          users={users}
          companies={companies}
          contacts={contacts}
          opportunityTypes={opportunityTypes.map((t) => ({
            id: t.id,
            name: t.name,
            stages: t.stages as StageValues[],
          }))}
          defaultValues={{
            ...opportunity,
            amount: opportunity.amount ? Number(opportunity.amount) : null,
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
