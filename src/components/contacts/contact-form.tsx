import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import { CustomFieldsFieldset } from "@/components/custom-fields/custom-fields-fieldset";
import type { CustomFieldDef } from "@/lib/custom-fields";

export function ContactForm({
  action,
  users,
  companies,
  defaultValues,
  submitLabel,
  customFieldDefs = [],
}: {
  action: (formData: FormData) => void;
  users: { id: string; name: string | null; email: string | null }[];
  companies: { id: string; name: string }[];
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
    title?: string | null;
    companyId?: string | null;
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
        <Field label="First name" htmlFor="firstName" required>
          <TextInput id="firstName" name="firstName" required defaultValue={d.firstName} />
        </Field>
        <Field label="Last name" htmlFor="lastName" required>
          <TextInput id="lastName" name="lastName" required defaultValue={d.lastName} />
        </Field>
        <Field label="Title" htmlFor="title">
          <TextInput id="title" name="title" defaultValue={d.title ?? ""} />
        </Field>
        <Field label="Customer (company)" htmlFor="companyId">
          <Select id="companyId" name="companyId" defaultValue={d.companyId ?? ""}>
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" defaultValue={d.email ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={d.phone ?? ""} />
        </Field>
        <Field label="Mobile" htmlFor="mobile">
          <TextInput id="mobile" name="mobile" defaultValue={d.mobile ?? ""} />
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
