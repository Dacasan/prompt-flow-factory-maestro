
import React, { useState } from "react";
import { useTasks } from "@/domains/tasks/hooks/useTasks";
import { TasksKanban } from "@/components/tasks/TasksKanban";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Tasks = () => {
  const { 
    tasks,
    orders,
    team,
    isLoading,
    createTask,
    updateTaskStatus,
    isCreating,
    isUpdating
  } = useTasks();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  console.log("Tasks page:", { 
    tasksCount: tasks?.length || 0,
    isLoading,
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
