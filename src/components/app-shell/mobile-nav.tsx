import { NAV_ITEMS } from "@/lib/nav";
import { NavLink } from "@/components/nav-link";

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-900">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} variant="mobile" />
      ))}
    </nav>
  );
}
