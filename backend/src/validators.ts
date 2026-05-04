import { z } from "zod";

export const salarySchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  level: z.enum(["L3", "L4", "L5"]),
  location: z.string().min(1, "Location is required"),
  experience_years: z.number().nonnegative(),
  base_salary: z.number().positive("Base salary must be positive"),
  bonus: z.number().nonnegative().default(0),
  stock: z.number().nonnegative().default(0),
  confidence_score: z.number().min(0).max(1).optional(),
});

export type SalaryInput = z.infer<typeof salarySchema>;