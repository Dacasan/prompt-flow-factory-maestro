
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
  } | null;
  order?: {
    id: string;
    client_id: string;
    clients?: { 
      id: string;
      name: string;
    } | null;
  } | null;
};

export function useTasks() {
  const queryClient = useQueryClient();
  const { orders } = useOrders();
  const { team } = useTeam();
  
  const getTasks = async () => {
    console.log("Fetching tasks...");
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        orders:order_id (
          id, 
          client_id,
          clients:client_id (id, name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(error.message);
    }
    
    console.log("Raw tasks data:", data);
    
    // Process the tasks to include assignee information from team manually
    // since we can't directly join on assigned_to
    const processedTasks = (data || []).map(task => {
      // Find the team member assigned to this task
      const assignee = team?.find(member => member.id === task.assigned_to);
      
      return {
        ...task,
        status: mapDbStatusToUiStatus(task.status),
        assignee: assignee ? {
          id: assignee.id,
          full_name: assignee.full_name,
          avatar_url: assignee.avatar_url
        } : null
      };
    });
    
    return processedTasks as ExtendedTask[];
  };
  
  // Helper function to map database status to UI status
  const mapDbStatusToUiStatus = (dbStatus: string | null): string => {
    switch(dbStatus) {
      case 'to_do': return 'todo';
      case 'in_progress': return 'doing';
      case 'done': return 'done';
      default: return 'todo';
    }
  };
  
  // Helper function to map UI status to database status
  const mapUiStatusToDbStatus = (uiStatus: string): string => {
    switch(uiStatus) {
      case 'todo': return 'to_do';
      case 'doing': return 'in_progress';
      case 'done': return 'done';
      default: return 'to_do';
    }
  };
  
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  });
  
  // Define a concrete type for task creation to avoid excessive type instantiation
  interface TaskCreateData {
    title: string;
    description?: string;
    order_id?: string;
    assigned_to?: string;
    due_date?: Date;
  }
  
  const createTask = async (taskData: TaskCreateData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        order_id: taskData.order_id || null,
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date ? taskData.due_date.toISOString() : null,
        status: 'to_do' // Always set initial status to to_do in database format
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Map the newly created task to include UI status
    return {
      ...data,
      status: mapDbStatusToUiStatus(data.status)
    } as Task;
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
  
  // Define a concrete type for task status update to avoid excessive type instantiation
  interface TaskStatusUpdateData {
    id: string;
    status: string;
  }
  
  const updateTaskStatus = async ({ id, status }: TaskStatusUpdateData) => {
    console.log(`Updating task ${id} status to ${status} (UI status)`);
    
    // Validate that the UI status is one we support
    if (!['todo', 'doing', 'done'].includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: todo, doing, done`);
    }
    
    // Convert UI status to database status before saving
    const dbStatus = mapUiStatusToDbStatus(status);
    console.log(`Mapped to database status: ${dbStatus}`);
    
    // First check if the task exists
    const { data: existingTask, error: checkError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error("Error checking task:", checkError);
      throw new Error(checkError.message);
    }
    
    console.log("Existing task:", existingTask);
    
    // Now update the status
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: dbStatus })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Error updating task status:", error);
      throw new Error(`Error updating task status: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error("Task update failed: no data returned");
    }
    
    console.log("Updated task:", data[0]);
    
    // Map the updated task to include UI status
    return {
      ...data[0],
      status: mapDbStatusToUiStatus(data[0].status)
    } as Task;
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
  
  console.log("Current tasks state:", { 
    tasks, 
    isLoading, 
    error,
    tasksCount: tasks.length
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
