
import { z } from "zod";
import { Role } from "../auth/types";

export const TeamMemberSchema = z.object({
  email: z.string().email("Valid email address is required"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "admin:member"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>;

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export const InvitationSchema = z.object({
  email: z.string().email("Valid email address is required"),
  role: z.enum(["admin", "admin:member"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export type InvitationData = z.infer<typeof InvitationSchema>;

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  token: string;
  invited_by: string | null;
}
