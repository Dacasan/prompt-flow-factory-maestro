
import { z } from "zod";

// Invoice status enum
export const InvoiceStatusEnum = z.enum(["pending", "paid", "partial", "cancelled"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

// Invoice schema
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  order_id: z.string().uuid().nullable().optional(),
  number: z.string(),
  status: InvoiceStatusEnum.default("pending"),
  issue_date: z.string().datetime(),
  due_date: z.string().datetime(),
  total_amount: z.number().min(0),
  amount_paid: z.number().min(0).default(0),
  stripe_invoice_id: z.string().nullable().optional(),
  stripe_payment_intent_id: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// Invoice item schema
export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  amount: z.number().min(0),
  created_at: z.string().datetime(),
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
