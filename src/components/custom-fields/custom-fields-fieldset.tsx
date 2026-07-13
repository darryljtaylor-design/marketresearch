import { Field, TextInput, TextArea, Select } from "@/components/form/fields";
import type { CustomFieldDef } from "@/lib/custom-fields";

const INPUT_TYPE: Record<string, string> = {
  TEXT: "text",
  EMAIL: "email",
  PHONE: "tel",
  URL: "url",
  NUMBER: "number",
  DATE: "date",
};

export function CustomFieldsFieldset({
  defs,
  values,
}: {
  defs: CustomFieldDef[];
  values?: Record<string, unknown> | null;
}) {
  if (defs.length === 0) return null;
  const v = values ?? {};

  return (
    <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <legend className="px-1 text-sm font-medium text-slate-600 dark:text-slate-400">
        Custom fields
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {defs.map((def) => {
          const name = `cf__${def.fieldKey}`;
          const value = v[def.fieldKey];
          return (
            <Field key={def.id} label={def.label} htmlFor={name} required={def.required}>
              {def.fieldType === "TEXTAREA" ? (
                <TextArea id={name} name={name} required={def.required} defaultValue={(value as string) ?? ""} />
              ) : def.fieldType === "CHECKBOX" ? (
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  defaultChecked={Boolean(value)}
                  className="h-4 w-4 rounded border-slate-300"
                />
              ) : def.fieldType === "DROPDOWN" ? (
                <Select id={name} name={name} required={def.required} defaultValue={(value as string) ?? ""}>
                  <option value="">Select...</option>
                  {(def.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextInput
                  id={name}
                  name={name}
                  type={INPUT_TYPE[def.fieldType] ?? "text"}
                  required={def.required}
                  defaultValue={(value as string | number) ?? ""}
                />
              )}
            </Field>
          );
        })}
      </div>
    </fieldset>
  );
}
