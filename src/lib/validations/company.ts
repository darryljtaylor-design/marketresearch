import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
