"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";
import { parseCustomFields } from "@/lib/custom-fields";

function toOptional(value: FormDataEntryValue | null) {
  const str = (value ?? "").toString().trim();
  return str.length > 0 ? str : undefined;
}

function parseContactForm(formData: FormData) {
  return contactSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: toOptional(formData.get("email")),
    phone: toOptional(formData.get("phone")),
    mobile: toOptional(formData.get("mobile")),
    title: toOptional(formData.get("title")),
    companyId: toOptional(formData.get("companyId")),
    ownerId: toOptional(formData.get("ownerId")),
    description: toOptional(formData.get("description")),
  });
}

export async function createContact(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseContactForm(formData);
  const customFields = await parseCustomFields("CONTACT", formData);
  const contact = await prisma.contact.create({
    data: {
      ...data,
      companyId: data.companyId || null,
      ownerId: data.ownerId || session.user.id,
      customFields,
    },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseContactForm(formData);
  const customFields = await parseCustomFields("CONTACT", formData);
  await prisma.contact.update({
    where: { id },
    data: { ...data, companyId: data.companyId || null, ownerId: data.ownerId || null, customFields },
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
