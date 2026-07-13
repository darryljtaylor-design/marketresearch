"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/lead";

function toOptional(value: FormDataEntryValue | null) {
  const str = (value ?? "").toString().trim();
  return str.length > 0 ? str : undefined;
}

function parseLeadForm(formData: FormData) {
  return leadSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    companyName: toOptional(formData.get("companyName")),
    email: toOptional(formData.get("email")),
    phone: toOptional(formData.get("phone")),
    title: toOptional(formData.get("title")),
    source: toOptional(formData.get("source")),
    status: formData.get("status"),
    rating: formData.get("rating"),
    ownerId: toOptional(formData.get("ownerId")),
    description: toOptional(formData.get("description")),
  });
}

export async function createLead(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseLeadForm(formData);
  const lead = await prisma.lead.create({
    data: { ...data, ownerId: data.ownerId || session.user.id },
  });

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseLeadForm(formData);
  await prisma.lead.update({
    where: { id },
    data: { ...data, ownerId: data.ownerId || null },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function deleteLead(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  redirect("/leads");
}

export async function convertLead(leadId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  if (lead.status === "CONVERTED") redirect(`/leads/${leadId}`);

  const companyName = toOptional(formData.get("companyName"));
  const createOpportunity = formData.get("createOpportunity") === "on";
  const opportunityTypeId = toOptional(formData.get("opportunityTypeId"));
  const opportunityName = toOptional(formData.get("opportunityName"));
  const opportunityAmount = toOptional(formData.get("opportunityAmount"));

  const result = await prisma.$transaction(async (tx) => {
    let companyId: string | undefined;
    if (companyName) {
      const existing = await tx.company.findFirst({
        where: { name: { equals: companyName, mode: "insensitive" } },
      });
      companyId = existing
        ? existing.id
        : (await tx.company.create({ data: { name: companyName, ownerId: lead.ownerId } })).id;
    }

    const contact = await tx.contact.create({
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        title: lead.title,
        companyId,
        ownerId: lead.ownerId,
      },
    });

    let opportunityId: string | undefined;
    if (createOpportunity && opportunityTypeId && opportunityName) {
      const opportunity = await tx.opportunity.create({
        data: {
          name: opportunityName,
          opportunityTypeId,
          amount: opportunityAmount ? Number(opportunityAmount) : undefined,
          stage: await firstStageOf(tx, opportunityTypeId),
          companyId,
          contactId: contact.id,
          ownerId: lead.ownerId,
        },
      });
      opportunityId = opportunity.id;
    }

    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedContactId: contact.id,
        convertedCompanyId: companyId,
        convertedOpportunityId: opportunityId,
      },
    });

    return { contact, companyId, opportunityId };
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);

  if (result.opportunityId) redirect(`/opportunities/${result.opportunityId}`);
  redirect(`/contacts/${result.contact.id}`);
}

async function firstStageOf(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  opportunityTypeId: string
) {
  const type = await tx.opportunityType.findUniqueOrThrow({ where: { id: opportunityTypeId } });
  const stages = type.stages as Array<{ key: string; order: number }>;
  const first = [...stages].sort((a, b) => a.order - b.order)[0];
  return first?.key ?? "new";
}
