
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/domains/tasks/types";
import { useOrders } from "@/domains/orders/hooks/useOrders";
import { useTeam } from "@/domains/team/hooks/useTeam";

export type ExtendedTask = Task & {
  assignee?: { 
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
  order?: {
    id: string;
    client_id: string;
    clients?: { 
      id: string;
      name: string;
    }
  };
};

export function useTasks() {
  const queryClient = useQueryClient();
  const { orders } = useOrders();
  const { team } = useTeam();
  
  const getTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:assigned_to (id, full_name, avatar_url),
        orders:order_id (
          id, 
          client_id,
          clients:client_id (id, name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as ExtendedTask[];
  };
  
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });
  
  const createTask = async (taskData: {
    title: string;
    description?: string;
    order_id?: string;
    assigned_to?: string;
    due_date?: Date;
  }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        order_id: taskData.order_id || null,
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date ? taskData.due_date.toISOString() : null,
        status: 'to_do'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Task;
  };
  
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating task: ${error.message}`);
    }
  });
  
  const updateTaskStatus = async ({ id, status }: { id: string; status: string }) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Task;
  };
  
  const updateTaskStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      toast.success(`Task status updated`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating task: ${error.message}`);
    }
  });
  
  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Error deleting task: ${error.message}`);
    }
  });
  
  return {
    tasks,
    orders,
    team,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTaskStatus: updateTaskStatusMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskStatusMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}
