import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "../types";
import { toast } from "sonner";

const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
  return data || [];
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
};

const createTask = async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([newTask])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  return data;
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
};

const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }
  return data;
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => updateTask(taskId, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        toast.success("Task updated successfully!");
      },
      onError: (error: any) => {
        toast.error(`Failed to update task: ${error.message}`);
      },
    }
  );
};

const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
};

const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  // Map UI status to database status
  const dbStatusMap = {
    'todo': 'to_do',
    'wip': 'doing',  // Fixed: use 'doing' instead of 'in_progress'
    'done': 'done'
  };

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: dbStatusMap[status] })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTaskStatus(taskId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        toast.success("Task status updated successfully!");
      },
      onError: (error: any) => {
        toast.error(`Failed to update task status: ${error.message}`);
      },
    }
  );
};
