import { CompanyForm } from "@/components/companies/company-form";
import { getAllUsers } from "@/lib/data/users";
import { getFieldDefs } from "@/lib/custom-fields";
import { createCompany } from "@/app/(app)/companies/actions";

export default async function NewCompanyPage() {
  const [users, customFieldDefs] = await Promise.all([getAllUsers(), getFieldDefs("COMPANY")]);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New customer</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <CompanyForm action={createCompany} users={users} customFieldDefs={customFieldDefs} submitLabel="Create customer" />
      </div>
    </div>
  );
}
