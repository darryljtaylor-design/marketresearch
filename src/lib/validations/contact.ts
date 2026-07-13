import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
