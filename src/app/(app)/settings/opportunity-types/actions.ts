"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { opportunityTypeSchema } from "@/lib/validations/opportunity-type";

function parseForm(formData: FormData) {
  const stagesJson = formData.get("stagesJson")?.toString() ?? "[]";
  return opportunityTypeSchema.parse({
    name: formData.get("name"),
    description: (formData.get("description") ?? "").toString().trim() || undefined,
    stages: JSON.parse(stagesJson),
  });
}

export async function createOpportunityType(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  await prisma.opportunityType.create({
    data: { name: data.name, description: data.description, stages: data.stages },
  });

  revalidatePath("/settings/opportunity-types");
  redirect("/settings/opportunity-types");
}

export async function updateOpportunityType(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  await prisma.opportunityType.update({
    where: { id },
    data: { name: data.name, description: data.description, stages: data.stages },
  });

  revalidatePath("/settings/opportunity-types");
  redirect("/settings/opportunity-types");
}

export async function deactivateOpportunityType(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.opportunityType.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/settings/opportunity-types");
}

export async function reactivateOpportunityType(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.opportunityType.update({ where: { id }, data: { isActive: true } });
  revalidatePath("/settings/opportunity-types");
}
