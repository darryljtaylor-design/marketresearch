import { z } from "zod";

export const taskSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  reminderAt: z.string().optional().or(z.literal("")),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "DEFERRED"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  assignedToId: z.string().optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
