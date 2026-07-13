"use client";

import { useState } from "react";
import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import { ENTITY_TYPES, FIELD_TYPES, slugifyKey } from "@/lib/validations/custom-field";
import { humanizeEnum } from "@/lib/utils";

export function CustomFieldDefinitionForm({
  action,
  submitLabel,
  mode,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  mode: "create" | "edit";
  defaultValues?: {
    entityType?: string;
    label?: string;
    fieldKey?: string;
    fieldType?: string;
    options?: string[] | null;
    required?: boolean;
    order?: number;
  };
}) {
  const d = defaultValues ?? {};
  const [label, setLabel] = useState(d.label ?? "");
  const [fieldKey, setFieldKey] = useState(d.fieldKey ?? "");
  const [fieldType, setFieldType] = useState(d.fieldType ?? "TEXT");
  const [keyTouched, setKeyTouched] = useState(mode === "edit");

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Applies to" htmlFor="entityType" required>
          <Select id="entityType" name="entityType" defaultValue={d.entityType ?? "LEAD"} disabled={mode === "edit"}>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanizeEnum(t === "COMPANY" ? "CUSTOMER" : t)}
              </option>
            ))}
          </Select>
          {mode === "edit" && <input type="hidden" name="entityType" value={d.entityType} />}
        </Field>
        <Field label="Field type" htmlFor="fieldType" required>
          <Select
            id="fieldType"
            name="fieldType"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            disabled={mode === "edit"}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanizeEnum(t)}
              </option>
            ))}
          </Select>
          {mode === "edit" && <input type="hidden" name="fieldType" value={d.fieldType} />}
        </Field>
        <Field label="Label" htmlFor="label" required>
          <TextInput
            id="label"
            name="label"
            required
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (!keyTouched) setFieldKey(slugifyKey(e.target.value));
            }}
            placeholder="e.g. Contract Number"
          />
        </Field>
        <Field label="Field key" htmlFor="fieldKey" required>
          <TextInput
            id="fieldKey"
            name="fieldKey"
            required
            value={fieldKey}
            disabled={mode === "edit"}
            onChange={(e) => {
              setKeyTouched(true);
              setFieldKey(slugifyKey(e.target.value));
            }}
          />
        </Field>
        <Field label="Display order" htmlFor="order">
          <TextInput id="order" name="order" type="number" defaultValue={d.order ?? 0} />
        </Field>
        <Field label="Required" htmlFor="required">
          <label className="flex h-full items-center gap-2 text-sm">
            <input type="checkbox" id="required" name="required" defaultChecked={d.required} className="h-4 w-4 rounded" />
            Make this field required
          </label>
        </Field>
      </div>

      {fieldType === "DROPDOWN" && (
        <Field label="Dropdown options (one per line)" htmlFor="options">
          <TextArea
            id="options"
            name="options"
            rows={4}
            defaultValue={(d.options ?? []).join("\n")}
            placeholder={"Option A\nOption B\nOption C"}
          />
        </Field>
      )}

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
