import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { industry: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true } },
        _count: { select: { contacts: true, opportunities: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Customers</h1>
        <Link
          href="/companies/new"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New customer
        </Link>
      </div>

      <form className="flex gap-2" action="/companies">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search customers..."
          className="w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5 hidden sm:table-cell">Industry</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Contacts</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Opportunities</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="px-4 py-2.5">
                  <Link href={`/companies/${c.id}`} className="font-medium text-slate-800 hover:text-blue-600 dark:text-slate-100">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-slate-500">{c.industry ?? "—"}</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">{c._count.contacts}</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">{c._count.opportunities}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">{c.owner?.name ?? "Unassigned"}</td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} customers)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/companies?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/companies?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
