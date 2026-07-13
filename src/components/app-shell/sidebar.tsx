import Link from "next/link";
import { Building2 } from "lucide-react";
import { NAV_ITEMS, SETTINGS_NAV_ITEM } from "@/lib/nav";
import { NavLink } from "@/components/nav-link";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
          <Building2 size={18} />
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          Victor Sierra CRM
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <NavLink item={SETTINGS_NAV_ITEM} />
      </div>
    </aside>
  );
}
