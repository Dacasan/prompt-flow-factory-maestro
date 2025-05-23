
import React, { useState } from "react";
import { useTasks } from "@/domains/tasks/hooks/useTasks";
import { TasksKanban } from "@/components/tasks/TasksKanban";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Tasks = () => {
  const { 
    tasks,
    orders,
    team,
    isLoading,
    error,
    createTask,
    updateTaskStatus,
    isCreating,
    isUpdating
  } = useTasks();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  console.log("Tasks page:", { 
    tasksCount: tasks?.length || 0,
    isLoading,
    error: error ? 'Error fetching tasks' : null,
    orders: orders?.length || 0,
    team: team?.length || 0
  });

  const handleCreateSubmit = (data: any) => {
    createTask(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleDragEnd = (taskId: string, newStatus: string) => {
    console.log(`Dragging task ${taskId} to ${newStatus}`);
    updateTaskStatus({
      id: taskId,
      status: newStatus,
    });
  };

  // Transform orders to match the expected format
  const formattedOrders = orders ? orders.map(order => ({
    id: order.id || '',
    clients: order.clients ? {
      name: order.clients.name || ''
    } : undefined,
    services: order.services ? {
      name: order.services.name || ''
    } : undefined
  })) : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create Task</SheetTitle>
              <SheetDescription>
                Fill out the task information in the form below.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <TaskForm
                orders={formattedOrders}
                team={team || []}
                onTaskCreate={handleCreateSubmit}
                isSubmitting={isCreating}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading tasks. Please try again later.
            <details className="mt-2 text-xs">
              <summary>Error details</summary>
              <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
            </details>
          </AlertDescription>
        </Alert>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 border rounded-lg border-dashed">
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-6">Create your first task to get started</p>
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      ) : (
        <TasksKanban
          tasks={tasks}
          onDragEnd={handleDragEnd}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
