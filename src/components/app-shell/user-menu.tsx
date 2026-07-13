"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/lib/actions";

export function UserMenu({
  name,
  email,
  image,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-semibold text-white"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name ?? "User"} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} /> Settings
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
