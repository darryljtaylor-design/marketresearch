import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contacts/contact-form";
import { getAllUsers } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { updateContact } from "@/app/(app)/contacts/actions";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, users, companies] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    getAllUsers(),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!contact) notFound();

  const action = updateContact.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit contact</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <ContactForm
          action={action}
          users={users}
          companies={companies}
          defaultValues={contact}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
