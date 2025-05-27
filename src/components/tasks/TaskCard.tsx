
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CalendarIcon, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'doing':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status.replace('_', ' ');
    }
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow relative group"
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium line-clamp-2 pr-2">{task.title}</h3>
            <div className="flex items-center gap-1">
              {task.order?.client && (
                <Badge variant="outline" className="text-xs">
                  {task.order.client.name}
                </Badge>
              )}
              <button
                onClick={handleCardClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                title="View details"
              >
                <Eye className="h-3 w-3" />
              </button>
            </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>Task Details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-muted-foreground">{formatStatus(task.status)}</p>
              </div>
              
              {task.due_date && (
                <div>
                  <span className="font-medium">Due Date:</span>
                  <p className="text-muted-foreground">
                    {format(new Date(task.due_date), 'PPP')}
                  </p>
                </div>
              )}
              
              {task.assignee && (
                <div>
                  <span className="font-medium">Assigned to:</span>
                  <p className="text-muted-foreground">{task.assignee.name}</p>
                </div>
              )}
              
              {task.order?.client && (
                <div>
                  <span className="font-medium">Client:</span>
                  <p className="text-muted-foreground">{task.order.client.name}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
