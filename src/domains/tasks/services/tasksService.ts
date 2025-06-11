
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "../types";

export interface ExtendedTask extends Task {
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
  order?: {
    id: string;
    clients?: {
      name: string;
    };
    services?: {
      name: string;
    };
  };
}

// Helper function to map database status to UI status
export const mapDbStatusToUI = (dbStatus: string): TaskStatus => {
  switch (dbStatus) {
    case 'to_do':
      return 'todo';
    case 'doing':
      return 'wip';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
};

// Helper function to map UI status to database status
export const mapUIStatusToDb = (uiStatus: TaskStatus): string => {
  switch (uiStatus) {
    case 'todo':
      return 'to_do';
    case 'wip':
      return 'doing';
    case 'done':
      return 'done';
    default:
      return 'to_do';
  }
};

export const fetchTasks = async (): Promise<ExtendedTask[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
      order:orders!tasks_order_id_fkey(
        id,
        clients(name),
        services(name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  const mappedTasks = (data || []).map(task => {
    // Safely handle assignee data
    let assignee: ExtendedTask['assignee'] = undefined;
    
    if (task.assignee) {
      // Handle both single object and array cases from Supabase joins
      const assigneeData = Array.isArray(task.assignee) ? task.assignee[0] : task.assignee;
      
      if (assigneeData && typeof assigneeData === 'object' && 
          'id' in assigneeData && 'full_name' in assigneeData) {
        assignee = {
          id: String(assigneeData.id),
          full_name: String(assigneeData.full_name),
          avatar_url: assigneeData.avatar_url ? String(assigneeData.avatar_url) : null
        };
      }
    }

    // Safely handle order data
    let order: ExtendedTask['order'] = undefined;
    
    if (task.order && typeof task.order === 'object' && 'id' in task.order) {
      order = {
        id: String(task.order.id),
        clients: task.order.clients,
        services: task.order.services
      };
    }

    return {
      ...task,
      status: mapDbStatusToUI(task.status) as TaskStatus,
      assignee,
      order
    };
  });

  return mappedTasks;
};

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      clients(name),
      services(name)
    `);
  
  if (error) throw error;
  return data || [];
};

export const fetchTeam = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('role', ['admin', 'admin:member']);
  
  if (error) throw error;
  return data || [];
};

export const createTask = async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
  const taskToInsert = {
    title: newTask.title,
    description: newTask.description || null,
    order_id: newTask.order_id || null,
    ticket_id: newTask.ticket_id || null,
    assigned_to: newTask.assigned_to || null,
    status: mapUIStatusToDb(newTask.status || 'todo'),
    due_date: newTask.due_date || null
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert([taskToInsert])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  return data;
};

export const updateTask = async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
  const updatesToSend: any = {};
  
  if (updates.title !== undefined) updatesToSend.title = updates.title;
  if (updates.description !== undefined) updatesToSend.description = updates.description;
  if (updates.order_id !== undefined) updatesToSend.order_id = updates.order_id;
  if (updates.ticket_id !== undefined) updatesToSend.ticket_id = updates.ticket_id;
  if (updates.assigned_to !== undefined) updatesToSend.assigned_to = updates.assigned_to;
  if (updates.due_date !== undefined) updatesToSend.due_date = updates.due_date;
  if (updates.status !== undefined) updatesToSend.status = mapUIStatusToDb(updates.status);

  const { data, error } = await supabase
    .from('tasks')
    .update(updatesToSend)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }
  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const updateTaskStatus = async ({ id, status }: { id: string; status: string }) => {
  const dbStatus = mapUIStatusToDb(status as TaskStatus);

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: dbStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
  return data;
};
