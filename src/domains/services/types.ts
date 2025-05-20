
import { z } from "zod";

// Service type enum
export const ServiceTypeEnum = z.enum(["one_time", "recurring"]);
export type ServiceType = z.infer<typeof ServiceTypeEnum>;

// Service form values
export type ServiceFormValues = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  type: string;
  icon?: string;
  folder_id?: string | null;
  is_active?: boolean;
};

// Service schema
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  type: ServiceTypeEnum,
  icon: z.string().optional(),
  folder_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Service = z.infer<typeof ServiceSchema>;

// Service Folder schema
export const ServiceFolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ServiceFolder = z.infer<typeof ServiceFolderSchema>;

// Service Add-on schema
export const ServiceAddonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Add-on name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  service_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ServiceAddon = z.infer<typeof ServiceAddonSchema>;
