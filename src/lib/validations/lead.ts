import { z } from "zod";

export const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"]),
  rating: z.enum(["HOT", "WARM", "COLD"]),
  ownerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
