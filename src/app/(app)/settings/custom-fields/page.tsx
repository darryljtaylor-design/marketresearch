import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { humanizeEnum } from "@/lib/utils";
import { ENTITY_TYPES } from "@/lib/validations/custom-field";
import { deactivateCustomField, reactivateCustomField } from "@/app/(app)/settings/custom-fields/actions";

export default async function CustomFieldsSettingsPage() {
  const defs = await prisma.customFieldDefinition.findMany({ orderBy: [{ entityType: "asc" }, { order: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Custom fields</h1>
          <p className="text-sm text-slate-500">
            Add your own fields to leads, customers, contacts, opportunities and tasks.
          </p>
        </div>
        <Link
          href="/settings/custom-fields/new"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New field
        </Link>
      </div>

      {ENTITY_TYPES.map((entityType) => {
        const items = defs.filter((d) => d.entityType === entityType);
        return (
          <div key={entityType} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {humanizeEnum(entityType === "COMPANY" ? "CUSTOMER" : entityType)}
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400">No custom fields yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div>
                      <Link href={`/settings/custom-fields/${d.id}`} className="font-medium text-slate-800 hover:text-blue-600 dark:text-slate-100">
                        {d.label}
                      </Link>
                      <span className="ml-2 text-xs text-slate-400">
                        {d.fieldKey} · {humanizeEnum(d.fieldType)}
                        {d.required && " · required"}
                        {!d.isActive && " · inactive"}
                      </span>
                    </div>
                    <form action={(d.isActive ? deactivateCustomField : reactivateCustomField).bind(null, d.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        {d.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
