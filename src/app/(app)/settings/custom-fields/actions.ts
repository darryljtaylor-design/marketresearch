"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { customFieldDefinitionSchema } from "@/lib/validations/custom-field";

function parseOptions(raw: string | undefined) {
  if (!raw) return undefined;
  const opts = raw
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);
  return opts.length > 0 ? opts : undefined;
}

function parseForm(formData: FormData) {
  return customFieldDefinitionSchema.parse({
    entityType: formData.get("entityType"),
    label: formData.get("label"),
    fieldKey: formData.get("fieldKey"),
    fieldType: formData.get("fieldType"),
    options: (formData.get("options") ?? "").toString(),
    required: formData.get("required") === "on",
    order: Number(formData.get("order") ?? 0),
  });
}

export async function createCustomField(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  await prisma.customFieldDefinition.create({
    data: {
      entityType: data.entityType,
      label: data.label,
      fieldKey: data.fieldKey,
      fieldType: data.fieldType,
      options: parseOptions(data.options),
      required: data.required,
      order: data.order,
    },
  });

  revalidatePath("/settings/custom-fields");
  redirect("/settings/custom-fields");
}

export async function updateCustomField(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  await prisma.customFieldDefinition.update({
    where: { id },
    data: {
      label: data.label,
      fieldType: data.fieldType,
      options: parseOptions(data.options),
      required: data.required,
      order: data.order,
    },
  });

  revalidatePath("/settings/custom-fields");
  redirect("/settings/custom-fields");
}

export async function deactivateCustomField(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.customFieldDefinition.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/settings/custom-fields");
}

export async function reactivateCustomField(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.customFieldDefinition.update({ where: { id }, data: { isActive: true } });
  revalidatePath("/settings/custom-fields");
}
