import { z } from "zod";

export const stageSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int().min(0),
  probability: z.number().int().min(0).max(100),
  isWon: z.boolean().default(false),
  isLost: z.boolean().default(false),
});

export const opportunityTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  stages: z.array(stageSchema).min(1, "Add at least one stage"),
});

export type StageValues = z.infer<typeof stageSchema>;
export type OpportunityTypeFormValues = z.infer<typeof opportunityTypeSchema>;

export function slugifyStage(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const DEFAULT_STAGES: StageValues[] = [
  { key: "qualification", label: "Qualification", order: 0, probability: 10, isWon: false, isLost: false },
  { key: "needs-analysis", label: "Needs Analysis", order: 1, probability: 25, isWon: false, isLost: false },
  { key: "proposal", label: "Proposal", order: 2, probability: 50, isWon: false, isLost: false },
  { key: "negotiation", label: "Negotiation", order: 3, probability: 75, isWon: false, isLost: false },
  { key: "closed-won", label: "Closed Won", order: 4, probability: 100, isWon: true, isLost: false },
  { key: "closed-lost", label: "Closed Lost", order: 5, probability: 0, isWon: false, isLost: true },
];
