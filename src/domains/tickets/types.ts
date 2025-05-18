
import { z } from "zod";

// Ticket status enum
export const TicketStatusEnum = z.enum(["open", "closed"]);
export type TicketStatus = z.infer<typeof TicketStatusEnum>;

// Ticket priority enum
export const TicketPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;

// Ticket schema
export const TicketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Ticket title is required"),
  description: z.string().min(1, "Ticket description is required"),
  client_id: z.string().uuid(),
  status: TicketStatusEnum.default("open"),
  priority: TicketPriorityEnum.default("medium"),
  assigned_to: z.string().uuid().nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// Ticket comment schema
export const TicketCommentSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string().min(1, "Comment cannot be empty"),
  created_at: z.string().datetime(),
});

export type TicketComment = z.infer<typeof TicketCommentSchema>;
