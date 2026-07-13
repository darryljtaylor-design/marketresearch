"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validations/company";
import { parseCustomFields } from "@/lib/custom-fields";

function toOptional(value: FormDataEntryValue | null) {
  const str = (value ?? "").toString().trim();
  return str.length > 0 ? str : undefined;
}

function parseCompanyForm(formData: FormData) {
  return companySchema.parse({
    name: formData.get("name"),
    industry: toOptional(formData.get("industry")),
    website: toOptional(formData.get("website")),
    phone: toOptional(formData.get("phone")),
    street: toOptional(formData.get("street")),
    city: toOptional(formData.get("city")),
    state: toOptional(formData.get("state")),
    postalCode: toOptional(formData.get("postalCode")),
    country: toOptional(formData.get("country")),
    ownerId: toOptional(formData.get("ownerId")),
    description: toOptional(formData.get("description")),
  });
}

export async function createCompany(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseCompanyForm(formData);
  const customFields = await parseCustomFields("COMPANY", formData);
  const company = await prisma.company.create({
    data: { ...data, ownerId: data.ownerId || session.user.id, customFields },
  });

  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompany(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseCompanyForm(formData);
  const customFields = await parseCustomFields("COMPANY", formData);
  await prisma.company.update({
    where: { id },
    data: { ...data, ownerId: data.ownerId || null, customFields },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.company.delete({ where: { id } });
  revalidatePath("/companies");
  redirect("/companies");
}
