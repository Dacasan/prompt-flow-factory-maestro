
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    due_date?: string | null;
    assignee?: {
      name: string;
      avatar_url?: string | null;
    };
    order?: {
      id: string;
      client?: {
        name: string;
      };
    };
  };
  disabled?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, disabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="cursor-grab active:cursor-grabbing shadow-sm"
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{task.title}</h3>
          {task.order?.client && (
            <Badge variant="outline" className="ml-2">
              {task.order.client.name}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        {task.due_date && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(task.due_date), 'MMM d')}
          </div>
        )}
        
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </CardFooter>
    </Card>
  );
};
