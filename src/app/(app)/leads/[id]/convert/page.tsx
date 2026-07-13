import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Field, TextInput, Select } from "@/components/form/fields";
import { convertLead } from "@/app/(app)/leads/actions";

export default async function ConvertLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, opportunityTypes] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    prisma.opportunityType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!lead) notFound();
  if (lead.status === "CONVERTED") redirect(`/leads/${id}`);

  const action = convertLead.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Convert {lead.firstName} {lead.lastName}
        </h1>
        <p className="text-sm text-slate-500">
          This creates a contact (and customer, if provided) from this lead.
        </p>
      </div>
      <form action={action} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Field label="Customer (company) name" htmlFor="companyName">
          <TextInput id="companyName" name="companyName" defaultValue={lead.companyName ?? ""} />
        </Field>

        {opportunityTypes.length > 0 ? (
          <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input type="checkbox" name="createOpportunity" defaultChecked className="rounded" />
              Also create an opportunity
            </label>
            <Field label="Opportunity name" htmlFor="opportunityName">
              <TextInput
                id="opportunityName"
                name="opportunityName"
                defaultValue={`${lead.companyName ?? lead.lastName} - New Business`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pipeline / type" htmlFor="opportunityTypeId">
                <Select id="opportunityTypeId" name="opportunityTypeId" defaultValue={opportunityTypes[0]?.id}>
                  {opportunityTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount" htmlFor="opportunityAmount">
                <TextInput id="opportunityAmount" name="opportunityAmount" type="number" step="0.01" />
              </Field>
            </div>
          </fieldset>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
            No opportunity pipelines configured yet. You can set those up in Settings →
            Opportunity pipelines, and create an opportunity for this contact afterwards.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Convert lead
          </button>
        </div>
      </form>
    </div>
  );
}
