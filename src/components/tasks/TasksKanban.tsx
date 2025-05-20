
import React from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";

interface TasksKanbanProps {
  tasks: any[];
  onDragEnd: (id: string, status: string) => void;
  isUpdating: boolean;
}

export const TasksKanban: React.FC<TasksKanbanProps> = ({ 
  tasks, 
  onDragEnd,
  isUpdating 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id.toString();
    const newStatus = over.id.toString();
    
    if (newStatus === "todo" || newStatus === "doing" || newStatus === "done") {
      onDragEnd(taskId, newStatus);
    }
  };

  const todoTasks = tasks.filter(task => task.status === "todo");
  const doingTasks = tasks.filter(task => task.status === "doing");
  const doneTasks = tasks.filter(task => task.status === "done");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Todo Column */}
        <Card className="bg-background">
          <CardHeader className="bg-muted/50 rounded-t-md">
            <CardTitle className="text-lg">To Do</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SortableContext
              id="todo"
              items={todoTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div id="todo" className="space-y-4 min-h-[200px]">
                {todoTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    disabled={isUpdating}
                  />
                ))}
                {todoTasks.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No tasks</p>
                )}
              </div>
            </SortableContext>
          </CardContent>
        </Card>

        {/* Doing Column */}
        <Card className="bg-background">
          <CardHeader className="bg-muted/50 rounded-t-md">
            <CardTitle className="text-lg">Doing</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SortableContext
              id="doing"
              items={doingTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div id="doing" className="space-y-4 min-h-[200px]">
                {doingTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    disabled={isUpdating}
                  />
                ))}
                {doingTasks.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No tasks</p>
                )}
              </div>
            </SortableContext>
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card className="bg-background">
          <CardHeader className="bg-muted/50 rounded-t-md">
            <CardTitle className="text-lg">Done</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SortableContext
              id="done"
              items={doneTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div id="done" className="space-y-4 min-h-[200px]">
                {doneTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    disabled={isUpdating}
                  />
                ))}
                {doneTasks.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No tasks</p>
                )}
              </div>
            </SortableContext>
          </CardContent>
        </Card>
      </div>
    </DndContext>
  );
};
