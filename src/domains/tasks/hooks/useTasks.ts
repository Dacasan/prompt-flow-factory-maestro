import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "../types";
import { toast } from "sonner";

// Extended task type for UI that includes related data
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

const fetchTasks = async (): Promise<ExtendedTask[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!assigned_to(id, full_name, avatar_url),
      order:orders!order_id(
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

  // Map database status to UI status
  const mappedTasks = (data || []).map(task => ({
    ...task,
    status: mapDbStatusToUI(task.status) as TaskStatus
  }));

  return mappedTasks;
};

// Helper function to map database status to UI status
const mapDbStatusToUI = (dbStatus: string): TaskStatus => {
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
const mapUIStatusToDb = (uiStatus: TaskStatus): string => {
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

export const useTasks = () => {
  const queryClient = useQueryClient();

  // Fetch tasks query
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // Fetch orders for task forms
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          clients(name),
          services(name)
        `);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch team members for task assignment
  const teamQuery = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('role', ['admin', 'admin:member']);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const taskToInsert = {
        ...newTask,
        status: mapUIStatusToDb(newTask.status || 'todo')
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const updatesToSend = { ...updates };
      if (updatesToSend.status) {
        updatesToSend.status = mapUIStatusToDb(updatesToSend.status) as TaskStatus;
      }

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update task status: ${error.message}`);
    },
  });

  return {
    // Data
    tasks: tasksQuery.data || [],
    orders: ordersQuery.data || [],
    team: teamQuery.data || [],
    
    // Loading states
    isLoading: tasksQuery.isLoading || ordersQuery.isLoading || teamQuery.isLoading,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskStatusMutation.isPending || updateTaskMutation.isPending,
    
    // Error state
    error: tasksQuery.error || ordersQuery.error || teamQuery.error,
    
    // Mutations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    updateTaskStatus: updateTaskStatusMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
  };
};

// Keep the individual hook exports for backward compatibility
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const taskToInsert = {
        ...newTask,
        status: mapUIStatusToDb(newTask.status || 'todo')
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const updatesToSend = { ...updates };
      if (updatesToSend.status) {
        updatesToSend.status = mapUIStatusToDb(updatesToSend.status) as TaskStatus;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updatesToSend)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const dbStatus = mapUIStatusToDb(status);

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update task status: ${error.message}`);
    },
  });
};
