import { notFound } from "next/navigation";
import { CompanyForm } from "@/components/companies/company-form";
import { getAllUsers } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { updateCompany } from "@/app/(app)/companies/actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, users] = await Promise.all([
    prisma.company.findUnique({ where: { id } }),
    getAllUsers(),
  ]);
  if (!company) notFound();

  const action = updateCompany.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Edit customer</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <CompanyForm action={action} users={users} defaultValues={company} submitLabel="Save changes" />
      </div>
    </div>
  );
}
