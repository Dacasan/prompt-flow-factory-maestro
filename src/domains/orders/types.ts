
import { z } from "zod";

// Order status enum
export const OrderStatusEnum = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Order schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  status: OrderStatusEnum.default("pending"),
  estimated_completion_date: z.string().datetime().optional(),
  estimated_delivery_date: z.string().datetime().nullable().optional(), // Add this field
  actual_completion_date: z.string().datetime().nullable().optional(),
  stripe_payment_id: z.string().nullable().optional(),
  stripe_invoice_id: z.string().nullable().optional(),
  total_amount: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;
