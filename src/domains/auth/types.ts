
import { z } from "zod";

// Role definitions
export type Role = "admin" | "admin:member" | "client" | "client:member";

// User schema with Zod validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1, "Full name is required"),
  role: z.enum(["admin", "admin:member", "client", "client:member"]),
  avatar_url: z.string().url().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_sign_in_at: z.string().datetime().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Invitation schema
export const InvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "admin:member", "client", "client:member"]),
  client_id: z.string().uuid().nullable().optional(),
});

export type Invitation = z.infer<typeof InvitationSchema>;
