
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, TaskStatus } from "../types";
import {
  ExtendedTask,
  fetchTasks,
  fetchOrders,
  fetchTeam,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from "../services/tasksService";

export type { ExtendedTask };

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
    queryFn: fetchOrders,
  });

  // Fetch team members for task assignment
  const teamQuery = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
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
    mutationFn: updateTask,
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
    mutationFn: deleteTask,
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
    mutationFn: updateTaskStatus,
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

// Individual hook exports for backward compatibility
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
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
    mutationFn: updateTask,
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
    mutationFn: deleteTask,
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
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => 
      updateTaskStatus({ id: taskId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update task status: ${error.message}`);
    },
  });
};
