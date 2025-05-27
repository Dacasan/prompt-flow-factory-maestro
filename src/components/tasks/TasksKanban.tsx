
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { ExtendedTask } from "@/domains/tasks/hooks/useTasks";

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: ExtendedTask[];
  count: number;
  isUpdating: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ id, title, tasks, count, isUpdating }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <Card className="bg-background">
      <CardHeader className="bg-muted/50 rounded-t-md">
        <CardTitle className="text-lg">
          {title} ({count})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`space-y-4 min-h-[200px] p-2 rounded-md border-2 border-dashed transition-colors ${
              isOver ? "border-primary bg-primary/5" : "border-transparent"
            }`}
          >
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    due_date: task.due_date,
                    assignee: task.assignee
                      ? {
                          name: task.assignee.full_name,
                          avatar_url: task.assignee.avatar_url,
                        }
                      : undefined,
                    order: task.order
                      ? {
                          id: task.order.id,
                          client: task.order.clients
                            ? {
                                name: task.order.clients.name,
                              }
                            : undefined,
                        }
                      : undefined,
                  }}
                  disabled={isUpdating}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No tasks</p>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
};

interface TasksKanbanProps {
  tasks: ExtendedTask[];
  onDragEnd: (id: string, status: string) => void;
  isUpdating: boolean;
}

export const TasksKanban: React.FC<TasksKanbanProps> = ({
  tasks,
  onDragEnd,
  isUpdating,
}) => {
  const [activeTask, setActiveTask] = useState<ExtendedTask | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Handle drag over events if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id.toString();
    const newStatus = over.id.toString().replace("column-", "");

    const currentTask = tasks.find((t) => t.id === taskId);
    if (currentTask && currentTask.status !== newStatus) {
      if (["todo", "in_progress", "done"].includes(newStatus)) {
        onDragEnd(taskId, newStatus);
      }
    }
  };

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  const renderTaskCard = (task: ExtendedTask) => (
    <TaskCard
      key={task.id}
      task={{
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        assignee: task.assignee
          ? {
              name: task.assignee.full_name,
              avatar_url: task.assignee.avatar_url,
            }
          : undefined,
        order: task.order
          ? {
              id: task.order.id,
              client: task.order.clients
                ? {
                    name: task.order.clients.name,
                  }
                : undefined,
            }
          : undefined,
      }}
      disabled={isUpdating}
    />
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          id="column-todo"
          title="To Do"
          tasks={todoTasks}
          count={todoTasks.length}
          isUpdating={isUpdating}
        />

        <TaskColumn
          id="column-in_progress"
          title="In Progress"
          tasks={inProgressTasks}
          count={inProgressTasks.length}
          isUpdating={isUpdating}
        />

        <TaskColumn
          id="column-done"
          title="Done"
          tasks={doneTasks}
          count={doneTasks.length}
          isUpdating={isUpdating}
        />
      </div>

      <DragOverlay>
        {activeTask ? renderTaskCard(activeTask) : null}
      </DragOverlay>
    </DndContext>
  );
};
