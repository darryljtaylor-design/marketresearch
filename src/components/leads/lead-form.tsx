import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import { humanizeEnum } from "@/lib/utils";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"];
const RATINGS = ["HOT", "WARM", "COLD"];

export function LeadForm({
  action,
  users,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  users: { id: string; name: string | null; email: string | null }[];
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
    source?: string | null;
    status?: string;
    rating?: string;
    ownerId?: string | null;
    description?: string | null;
  };
  submitLabel: string;
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
        <Field label="Company name" htmlFor="companyName">
          <TextInput id="companyName" name="companyName" defaultValue={d.companyName ?? ""} />
        </Field>
        <Field label="Title" htmlFor="title">
          <TextInput id="title" name="title" defaultValue={d.title ?? ""} />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" defaultValue={d.email ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={d.phone ?? ""} />
        </Field>
        <Field label="Lead source" htmlFor="source">
          <TextInput
            id="source"
            name="source"
            placeholder="Website, referral, event..."
            defaultValue={d.source ?? ""}
          />
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
        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={d.status ?? "NEW"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanizeEnum(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Rating" htmlFor="rating" required>
          <Select id="rating" name="rating" defaultValue={d.rating ?? "WARM"}>
            {RATINGS.map((r) => (
              <option key={r} value={r}>
                {humanizeEnum(r)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Description" htmlFor="description">
        <TextArea id="description" name="description" defaultValue={d.description ?? ""} />
      </Field>
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
