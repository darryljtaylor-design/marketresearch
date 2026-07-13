import Link from "next/link";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { getAllUsers } from "@/lib/data/users";
import { getFieldDefs } from "@/lib/custom-fields";
import { prisma } from "@/lib/prisma";
import { createOpportunity } from "@/app/(app)/opportunities/actions";
import type { StageValues } from "@/lib/validations/opportunity-type";

export default async function NewOpportunityPage() {
  const [users, companies, contacts, opportunityTypes, customFieldDefs] = await Promise.all([
    getAllUsers(),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contact.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    prisma.opportunityType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    getFieldDefs("OPPORTUNITY"),
  ]);

  if (opportunityTypes.length === 0) {
    return (
      <div className="max-w-xl rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500">
          You need at least one opportunity pipeline before creating opportunities.
        </p>
        <Link
          href="/settings/opportunity-types/new"
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create a pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New opportunity</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <OpportunityForm
          action={createOpportunity}
          users={users}
          companies={companies}
          contacts={contacts}
          opportunityTypes={opportunityTypes.map((t) => ({
            id: t.id,
            name: t.name,
            stages: t.stages as StageValues[],
          }))}
          customFieldDefs={customFieldDefs}
          submitLabel="Create opportunity"
        />
      </div>
    </div>
  );
}
