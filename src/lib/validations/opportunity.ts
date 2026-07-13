import { z } from "zod";

export const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  opportunityTypeId: z.string().min(1, "Pipeline is required"),
  stage: z.string().min(1, "Stage is required"),
  amount: z.string().optional().or(z.literal("")),
  closeDate: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type OpportunityFormValues = z.infer<typeof opportunitySchema>;
