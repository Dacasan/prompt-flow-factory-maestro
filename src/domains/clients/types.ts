
import { z } from "zod";
import { UserSchema } from "../auth/types";

// Client schema
export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  logo_url: z.string().url().nullable().optional(),
  stripe_customer_id: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Client = z.infer<typeof ClientSchema>;

// Client Member schema (extending UserSchema)
export const ClientMemberSchema = UserSchema.extend({
  client_id: z.string().uuid(),
});

export type ClientMember = z.infer<typeof ClientMemberSchema>;
