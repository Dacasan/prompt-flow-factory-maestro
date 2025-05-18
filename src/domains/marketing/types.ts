
import { z } from "zod";

// Review request status enum
export const ReviewRequestStatusEnum = z.enum(["pending", "sent", "failed"]);
export type ReviewRequestStatus = z.infer<typeof ReviewRequestStatusEnum>;

// Review request schema
export const ReviewRequestSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  status: ReviewRequestStatusEnum.default("pending"),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  sent_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ReviewRequest = z.infer<typeof ReviewRequestSchema>;

// Prospect status enum
export const ProspectStatusEnum = z.enum(["lead", "contacted", "qualified", "proposal", "closed_won", "closed_lost"]);
export type ProspectStatus = z.infer<typeof ProspectStatusEnum>;

// Prospect schema
export const ProspectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: ProspectStatusEnum.default("lead"),
  source: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Prospect = z.infer<typeof ProspectSchema>;
