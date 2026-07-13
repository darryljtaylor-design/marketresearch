import { notFound } from "next/navigation";
import { CustomFieldDefinitionForm } from "@/components/custom-fields/custom-field-definition-form";
import { prisma } from "@/lib/prisma";
import { updateCustomField } from "@/app/(app)/settings/custom-fields/actions";

export default async function EditCustomFieldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const def = await prisma.customFieldDefinition.findUnique({ where: { id } });
  if (!def) notFound();

  const action = updateCustomField.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit custom field</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <CustomFieldDefinitionForm
          action={action}
          submitLabel="Save changes"
          mode="edit"
          defaultValues={{
            entityType: def.entityType,
            label: def.label,
            fieldKey: def.fieldKey,
            fieldType: def.fieldType,
            options: def.options as string[] | null,
            required: def.required,
            order: def.order,
          }}
        />
      </div>
    </div>
  );
}
