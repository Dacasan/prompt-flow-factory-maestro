
import { z } from "zod";

export const ClientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().nullable().optional(),
  stripe_customer_id: z.string().nullable().optional(),
});

export type ClientFormData = z.infer<typeof ClientSchema>;

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
