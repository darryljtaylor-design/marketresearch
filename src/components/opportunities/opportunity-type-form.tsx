"use client";

import { useRef, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { slugifyStage, type StageValues, DEFAULT_STAGES } from "@/lib/validations/opportunity-type";

export function OpportunityTypeForm({
  action,
  defaultName,
  defaultDescription,
  defaultStages,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultName?: string;
  defaultDescription?: string | null;
  defaultStages?: StageValues[];
  submitLabel: string;
}) {
  const [stages, setStages] = useState<StageValues[]>(
    defaultStages && defaultStages.length > 0 ? defaultStages : DEFAULT_STAGES
  );
  const formRef = useRef<HTMLFormElement>(null);

  function updateStage(index: number, patch: Partial<StageValues>) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addStage() {
    setStages((prev) => [
      ...prev,
      {
        key: `stage-${prev.length + 1}`,
        label: "New stage",
        order: prev.length,
        probability: 50,
        isWon: false,
        isLost: false,
      },
    ]);
  }

  function removeStage(index: number) {
    setStages((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  }

  function moveStage(index: number, direction: -1 | 1) {
    setStages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function handleSubmit() {
    const hidden = formRef.current?.querySelector<HTMLInputElement>('input[name="stagesJson"]');
    if (hidden) hidden.value = JSON.stringify(stages);
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="stagesJson" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Pipeline name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultName}
            placeholder="e.g. New Business, Renewal, Upsell"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <input
            id="description"
            name="description"
            defaultValue={defaultDescription ?? ""}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Pipeline stages</p>
          <button
            type="button"
            onClick={addStage}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Plus size={14} /> Add stage
          </button>
        </div>
        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2.5 dark:border-slate-700"
            >
              <GripVertical size={16} className="shrink-0 text-slate-300" />
              <input
                value={stage.label}
                onChange={(e) => {
                  const label = e.target.value;
                  updateStage(i, { label, key: slugifyStage(label) || `stage-${i}` });
                }}
                className="min-w-[8rem] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder="Stage name"
              />
              <label className="flex items-center gap-1 text-xs text-slate-500">
                Probability
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stage.probability}
                  onChange={(e) => updateStage(i, { probability: Number(e.target.value) })}
                  className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                %
              </label>
              <label className="flex items-center gap-1 text-xs text-emerald-600">
                <input
                  type="checkbox"
                  checked={stage.isWon}
                  onChange={(e) => updateStage(i, { isWon: e.target.checked, isLost: e.target.checked ? false : stage.isLost })}
                />
                Won
              </label>
              <label className="flex items-center gap-1 text-xs text-red-600">
                <input
                  type="checkbox"
                  checked={stage.isLost}
                  onChange={(e) => updateStage(i, { isLost: e.target.checked, isWon: e.target.checked ? false : stage.isWon })}
                />
                Lost
              </label>
              <button type="button" onClick={() => moveStage(i, -1)} className="text-slate-400 hover:text-slate-700" aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => moveStage(i, 1)} className="text-slate-400 hover:text-slate-700" aria-label="Move down">
                ↓
              </button>
              <button type="button" onClick={() => removeStage(i)} className="text-slate-400 hover:text-red-600" aria-label="Remove stage">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
