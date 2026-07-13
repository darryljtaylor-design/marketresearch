import { z } from "zod";

export const ENTITY_TYPES = ["LEAD", "CONTACT", "COMPANY", "OPPORTUNITY", "TASK"] as const;
export const FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "DROPDOWN",
  "CHECKBOX",
  "EMAIL",
  "PHONE",
  "URL",
] as const;

export const customFieldDefinitionSchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  label: z.string().min(1, "Label is required"),
  fieldKey: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers, underscores only"),
  fieldType: z.enum(FIELD_TYPES),
  options: z.string().optional().or(z.literal("")),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export function slugifyKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}
