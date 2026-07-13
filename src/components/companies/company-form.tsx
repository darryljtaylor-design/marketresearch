import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import { CustomFieldsFieldset } from "@/components/custom-fields/custom-fields-fieldset";
import type { CustomFieldDef } from "@/lib/custom-fields";

export function CompanyForm({
  action,
  users,
  defaultValues,
  submitLabel,
  customFieldDefs = [],
}: {
  action: (formData: FormData) => void;
  users: { id: string; name: string | null; email: string | null }[];
  defaultValues?: {
    name?: string;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    ownerId?: string | null;
    description?: string | null;
    customFields?: unknown;
  };
  submitLabel: string;
  customFieldDefs?: CustomFieldDef[];
}) {
  const d = defaultValues ?? {};
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company name" htmlFor="name" required>
          <TextInput id="name" name="name" required defaultValue={d.name} />
        </Field>
        <Field label="Industry" htmlFor="industry">
          <TextInput id="industry" name="industry" defaultValue={d.industry ?? ""} />
        </Field>
        <Field label="Website" htmlFor="website">
          <TextInput id="website" name="website" defaultValue={d.website ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={d.phone ?? ""} />
        </Field>
        <Field label="Owner" htmlFor="ownerId">
          <Select id="ownerId" name="ownerId" defaultValue={d.ownerId ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-medium text-slate-600 dark:text-slate-400">Address</legend>
        <Field label="Street" htmlFor="street">
          <TextInput id="street" name="street" defaultValue={d.street ?? ""} />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="City" htmlFor="city">
            <TextInput id="city" name="city" defaultValue={d.city ?? ""} />
          </Field>
          <Field label="State" htmlFor="state">
            <TextInput id="state" name="state" defaultValue={d.state ?? ""} />
          </Field>
          <Field label="Postal code" htmlFor="postalCode">
            <TextInput id="postalCode" name="postalCode" defaultValue={d.postalCode ?? ""} />
          </Field>
          <Field label="Country" htmlFor="country">
            <TextInput id="country" name="country" defaultValue={d.country ?? ""} />
          </Field>
        </div>
      </fieldset>

      <Field label="Description" htmlFor="description">
        <TextArea id="description" name="description" defaultValue={d.description ?? ""} />
      </Field>
      <CustomFieldsFieldset defs={customFieldDefs} values={d.customFields as Record<string, unknown>} />
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
