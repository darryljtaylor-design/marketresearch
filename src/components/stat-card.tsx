import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg", color)}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  );
}
