import { NotificationBell } from "@/components/app-shell/notification-bell";
import { UserMenu } from "@/components/app-shell/user-menu";
import { GlobalSearch } from "@/components/app-shell/global-search";

export function Topbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <NotificationBell />
      <UserMenu name={user.name} email={user.email} image={user.image} />
    </header>
  );
}
