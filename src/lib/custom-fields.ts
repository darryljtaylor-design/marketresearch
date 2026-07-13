import { prisma } from "@/lib/prisma";
import type { RelatedEntityType, CustomFieldType, Prisma } from "@/generated/prisma/client";

export type CustomFieldDef = {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: CustomFieldType;
  options: string[] | null;
  required: boolean;
};

export async function getFieldDefs(entityType: RelatedEntityType): Promise<CustomFieldDef[]> {
  const defs = await prisma.customFieldDefinition.findMany({
    where: { entityType, isActive: true },
    orderBy: { order: "asc" },
  });
  return defs.map((d) => ({
    id: d.id,
    fieldKey: d.fieldKey,
    label: d.label,
    fieldType: d.fieldType,
    options: (d.options as string[] | null) ?? null,
    required: d.required,
  }));
}

export function parseCustomFieldsFromForm(
  defs: CustomFieldDef[],
  formData: FormData
): Prisma.InputJsonObject {
  const result: Record<string, string | number | boolean | null> = {};
  for (const def of defs) {
    const raw = formData.get(`cf__${def.fieldKey}`);
    if (def.fieldType === "CHECKBOX") {
      result[def.fieldKey] = raw === "on" || raw === "true";
      continue;
    }
    const str = (raw ?? "").toString().trim();
    if (!str) {
      result[def.fieldKey] = null;
      continue;
    }
    result[def.fieldKey] = def.fieldType === "NUMBER" ? Number(str) : str;
  }
  return result as Prisma.InputJsonObject;
}

export async function parseCustomFields(entityType: RelatedEntityType, formData: FormData) {
  const defs = await getFieldDefs(entityType);
  return parseCustomFieldsFromForm(defs, formData);
}
