
import { z } from "zod";

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  role: z.string(),
  avatar_url: z.string().nullable().optional(),
  email: z.string().email(),
  client_id: z.string().uuid().nullable().optional(),
  last_sign_in_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const InvitationSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  token: z.string(),
  client_id: z.string().uuid().nullable().optional(),
  invited_by: z.string().uuid().nullable(),
  expires_at: z.string().datetime(),
  status: z.string().default("pending"),
  created_at: z.string(),
});

export type Invitation = z.infer<typeof InvitationSchema>;

export interface InvitationData {
  email: string;
  role: string;
  full_name?: string;
  password?: string;
}
