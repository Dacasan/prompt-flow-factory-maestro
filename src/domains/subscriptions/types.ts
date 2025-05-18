
import { z } from "zod";

// Subscription status enum
export const SubscriptionStatusEnum = z.enum(["active", "canceled", "past_due", "unpaid"]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

// Subscription schema
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  stripe_subscription_id: z.string(),
  status: SubscriptionStatusEnum.default("active"),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().nullable().optional(),
  next_billing_date: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
