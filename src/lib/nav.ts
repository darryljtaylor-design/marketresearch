import {
  LayoutDashboard,
  Target,
  Building2,
  Users,
  Handshake,
  CheckSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Customers", href: "/companies", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Opportunities", href: "/opportunities", icon: Handshake },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
