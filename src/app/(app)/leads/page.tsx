import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, LEAD_STATUS_COLOR, LEAD_RATING_COLOR } from "@/components/badge";
import { humanizeEnum } from "@/lib/utils";

const PAGE_SIZE = 25;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; rating?: string; page?: string }>;
}) {
  const { q, status, rating, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(rating ? { rating: rating as never } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { companyName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { owner: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(params: Record<string, string | undefined>) {
    const usp = new URLSearchParams();
    const merged = { q, status, rating, ...params };
    Object.entries(merged).forEach(([k, v]) => v && usp.set(k, v));
    const qs = usp.toString();
    return `/leads${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Leads</h1>
        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New lead
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/leads">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search leads..."
          className="w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"].map((s) => (
            <option key={s} value={s}>
              {humanizeEnum(s)}
            </option>
          ))}
        </select>
        <select
          name="rating"
          defaultValue={rating ?? ""}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All ratings</option>
          {["HOT", "WARM", "COLD"].map((r) => (
            <option key={r} value={r}>
              {humanizeEnum(r)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5 hidden sm:table-cell">Company</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Email</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 hidden sm:table-cell">Rating</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="px-4 py-2.5">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-slate-800 hover:text-blue-600 dark:text-slate-100">
                    {lead.firstName} {lead.lastName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-slate-500">
                  {lead.companyName ?? "—"}
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell text-slate-500">
                  {lead.email ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={LEAD_STATUS_COLOR[lead.status]}>{humanizeEnum(lead.status)}</Badge>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <Badge color={LEAD_RATING_COLOR[lead.rating]}>{humanizeEnum(lead.rating)}</Badge>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500">
                  {lead.owner?.name ?? "Unassigned"}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} leads)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref({ page: String(page - 1) })}
                className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref({ page: String(page + 1) })}
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
