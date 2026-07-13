import { ContactForm } from "@/components/contacts/contact-form";
import { getAllUsers } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { createContact } from "@/app/(app)/contacts/actions";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const [users, companies] = await Promise.all([
    getAllUsers(),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New contact</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <ContactForm
          action={createContact}
          users={users}
          companies={companies}
          defaultValues={companyId ? { companyId } : undefined}
          submitLabel="Create contact"
        />
      </div>
    </div>
  );
}
