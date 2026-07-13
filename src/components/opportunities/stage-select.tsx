"use client";

import { useTransition } from "react";
import { moveOpportunityStage } from "@/app/(app)/opportunities/actions";
import type { StageValues } from "@/lib/validations/opportunity-type";

export function StageSelect({
  opportunityId,
  currentStage,
  stages,
}: {
  opportunityId: string;
  currentStage: string;
  stages: StageValues[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentStage}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          moveOpportunityStage(opportunityId, next);
        });
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
    >
      {stages.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
