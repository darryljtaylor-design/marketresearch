import { CustomFieldDefinitionForm } from "@/components/custom-fields/custom-field-definition-form";
import { createCustomField } from "@/app/(app)/settings/custom-fields/actions";

export default function NewCustomFieldPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New custom field</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <CustomFieldDefinitionForm action={createCustomField} submitLabel="Create field" mode="create" />
      </div>
    </div>
  );
}
