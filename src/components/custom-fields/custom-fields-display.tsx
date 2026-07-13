import type { CustomFieldDef } from "@/lib/custom-fields";

export function CustomFieldsDisplay({
  defs,
  values,
}: {
  defs: CustomFieldDef[];
  values?: Record<string, unknown> | null;
}) {
  if (defs.length === 0) return null;
  const v = values ?? {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Custom fields</h2>
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
        {defs.map((def) => {
          const raw = v[def.fieldKey];
          const display =
            def.fieldType === "CHECKBOX" ? (raw ? "Yes" : "No") : raw != null && raw !== "" ? String(raw) : "—";
          return (
            <div key={def.id}>
              <p className="text-xs uppercase text-slate-400">{def.label}</p>
              <p className="text-slate-700 dark:text-slate-200">{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
