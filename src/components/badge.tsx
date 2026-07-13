import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
};

export function Badge({
  children,
  color = "slate",
  className,
}: {
  children: React.ReactNode;
  color?: keyof typeof COLOR_MAP;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        COLOR_MAP[color],
        className
      )}
    >
      {children}
    </span>
  );
}

export const LEAD_STATUS_COLOR: Record<string, keyof typeof COLOR_MAP> = {
  NEW: "blue",
  CONTACTED: "cyan",
  QUALIFIED: "emerald",
  UNQUALIFIED: "red",
  CONVERTED: "violet",
};

export const LEAD_RATING_COLOR: Record<string, keyof typeof COLOR_MAP> = {
  HOT: "red",
  WARM: "amber",
  COLD: "blue",
};

export const TASK_STATUS_COLOR: Record<string, keyof typeof COLOR_MAP> = {
  OPEN: "blue",
  IN_PROGRESS: "amber",
  COMPLETED: "emerald",
  DEFERRED: "slate",
};

export const TASK_PRIORITY_COLOR: Record<string, keyof typeof COLOR_MAP> = {
  LOW: "slate",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red",
};
