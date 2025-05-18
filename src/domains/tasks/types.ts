
import { z } from "zod";

// Task status enum
export const TaskStatusEnum = z.enum(["todo", "doing", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// Task schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  order_id: z.string().uuid().nullable().optional(),
  ticket_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  status: TaskStatusEnum.default("todo"),
  due_date: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;

// Task checklist item schema
export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  title: z.string().min(1, "Checklist item title is required"),
  is_completed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
