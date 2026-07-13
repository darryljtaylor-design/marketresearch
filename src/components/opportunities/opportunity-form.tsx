"use client";

import { useMemo, useState } from "react";
import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import type { StageValues } from "@/lib/validations/opportunity-type";

type OpportunityTypeOption = { id: string; name: string; stages: StageValues[] };

export function OpportunityForm({
  action,
  users,
  companies,
  contacts,
  opportunityTypes,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  users: { id: string; name: string | null; email: string | null }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; firstName: string; lastName: string }[];
  opportunityTypes: OpportunityTypeOption[];
  defaultValues?: {
    name?: string;
    opportunityTypeId?: string;
    stage?: string;
    amount?: string | number | null;
    closeDate?: string | Date | null;
    companyId?: string | null;
    contactId?: string | null;
    ownerId?: string | null;
    description?: string | null;
  };
  submitLabel: string;
}) {
  const d = defaultValues ?? {};
  const [typeId, setTypeId] = useState(d.opportunityTypeId ?? opportunityTypes[0]?.id ?? "");
  const stages = useMemo(
    () => opportunityTypes.find((t) => t.id === typeId)?.stages.sort((a, b) => a.order - b.order) ?? [],
    [opportunityTypes, typeId]
  );
  const closeDateValue =
    d.closeDate instanceof Date ? d.closeDate.toISOString().slice(0, 10) : (d.closeDate ?? "");

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Opportunity name" htmlFor="name" required>
          <TextInput id="name" name="name" required defaultValue={d.name} />
        </Field>
        <Field label="Pipeline / type" htmlFor="opportunityTypeId" required>
          <Select
            id="opportunityTypeId"
            name="opportunityTypeId"
            required
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            {opportunityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stage" htmlFor="stage" required>
          <Select id="stage" name="stage" required defaultValue={d.stage}>
            {stages.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount" htmlFor="amount">
          <TextInput id="amount" name="amount" type="number" step="0.01" defaultValue={d.amount ?? ""} />
        </Field>
        <Field label="Expected close date" htmlFor="closeDate">
          <TextInput id="closeDate" name="closeDate" type="date" defaultValue={closeDateValue} />
        </Field>
        <Field label="Customer" htmlFor="companyId">
          <Select id="companyId" name="companyId" defaultValue={d.companyId ?? ""}>
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Primary contact" htmlFor="contactId">
          <Select id="contactId" name="contactId" defaultValue={d.contactId ?? ""}>
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </Select>
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
