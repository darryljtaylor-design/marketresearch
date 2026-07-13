"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SETTINGS_NAV_ITEM } from "@/lib/nav";

const ALL_ITEMS = [...NAV_ITEMS, SETTINGS_NAV_ITEM];

export function NavLink({
  href,
  variant = "sidebar",
}: {
  href: string;
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  const item = ALL_ITEMS.find((i) => i.href === href)!;
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  if (variant === "mobile") {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
        )}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
