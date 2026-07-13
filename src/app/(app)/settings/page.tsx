import Link from "next/link";
import { Handshake, ListPlus, Mail, Users } from "lucide-react";

const SETTINGS_LINKS = [
  {
    href: "/settings/opportunity-types",
    label: "Opportunity pipelines",
    description: "Define opportunity types and their pipeline stages",
    icon: Handshake,
  },
  {
    href: "/settings/custom-fields",
    label: "Custom fields",
    description: "Add your own fields to leads, customers, contacts, opportunities and tasks",
    icon: ListPlus,
  },
  {
    href: "/settings/outlook",
    label: "Outlook integration",
    description: "Connect Outlook to sync email and calendar",
    icon: Mail,
  },
  {
    href: "/settings/users",
    label: "Users",
    description: "People with access to this CRM",
    icon: Users,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTINGS_LINKS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
              <p className="text-sm text-slate-500">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
