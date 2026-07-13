"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { opportunitySchema } from "@/lib/validations/opportunity";
import type { StageValues } from "@/lib/validations/opportunity-type";
import { parseCustomFields } from "@/lib/custom-fields";

function toOptional(value: FormDataEntryValue | null) {
  const str = (value ?? "").toString().trim();
  return str.length > 0 ? str : undefined;
}

function parseForm(formData: FormData) {
  return opportunitySchema.parse({
    name: formData.get("name"),
    opportunityTypeId: formData.get("opportunityTypeId"),
    stage: formData.get("stage"),
    amount: toOptional(formData.get("amount")),
    closeDate: toOptional(formData.get("closeDate")),
    companyId: toOptional(formData.get("companyId")),
    contactId: toOptional(formData.get("contactId")),
    ownerId: toOptional(formData.get("ownerId")),
    description: toOptional(formData.get("description")),
  });
}

async function stageMeta(opportunityTypeId: string, stageKey: string) {
  const type = await prisma.opportunityType.findUniqueOrThrow({ where: { id: opportunityTypeId } });
  const stages = type.stages as StageValues[];
  return stages.find((s) => s.key === stageKey);
}

export async function createOpportunity(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  const meta = await stageMeta(data.opportunityTypeId, data.stage);
  const customFields = await parseCustomFields("OPPORTUNITY", formData);

  const opportunity = await prisma.opportunity.create({
    data: {
      name: data.name,
      opportunityTypeId: data.opportunityTypeId,
      stage: data.stage,
      probability: meta?.probability ?? 0,
      amount: data.amount ? Number(data.amount) : undefined,
      closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
      companyId: data.companyId || null,
      contactId: data.contactId || null,
      ownerId: data.ownerId || session.user.id,
      description: data.description,
      wonAt: meta?.isWon ? new Date() : null,
      lostAt: meta?.isLost ? new Date() : null,
      customFields,
    },
  });

  revalidatePath("/opportunities");
  redirect(`/opportunities/${opportunity.id}`);
}

export async function updateOpportunity(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseForm(formData);
  const meta = await stageMeta(data.opportunityTypeId, data.stage);
  const customFields = await parseCustomFields("OPPORTUNITY", formData);

  await prisma.opportunity.update({
    where: { id },
    data: {
      name: data.name,
      opportunityTypeId: data.opportunityTypeId,
      stage: data.stage,
      probability: meta?.probability ?? 0,
      amount: data.amount ? Number(data.amount) : null,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      companyId: data.companyId || null,
      contactId: data.contactId || null,
      ownerId: data.ownerId || null,
      description: data.description,
      wonAt: meta?.isWon ? new Date() : null,
      lostAt: meta?.isLost ? new Date() : null,
      customFields,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}

export async function deleteOpportunity(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.opportunity.delete({ where: { id } });
  revalidatePath("/opportunities");
  redirect("/opportunities");
}

export async function moveOpportunityStage(id: string, stageKey: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const opportunity = await prisma.opportunity.findUniqueOrThrow({ where: { id } });
  const meta = await stageMeta(opportunity.opportunityTypeId, stageKey);

  await prisma.opportunity.update({
    where: { id },
    data: {
      stage: stageKey,
      probability: meta?.probability ?? opportunity.probability,
      wonAt: meta?.isWon ? new Date() : null,
      lostAt: meta?.isLost ? new Date() : null,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
}
