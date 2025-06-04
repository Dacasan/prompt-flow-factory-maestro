
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TasksProgressProps {
  tasks: {
    total: number;
    completed: number;
    wip: number;
    todo: number;
  };
}

export const TasksProgress = ({ tasks }: TasksProgressProps) => {
  const completionRate = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Progress</CardTitle>
        <CardDescription>Overview of task completion status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completed</span>
            <span className="text-sm text-muted-foreground">{tasks.completed}/{tasks.total}</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="text-xs text-muted-foreground">{completionRate.toFixed(1)}% completion rate</div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-2">
            <Badge variant="outline">{tasks.todo} To Do</Badge>
            <Badge variant="secondary">{tasks.wip} WIP</Badge>
            <Badge>{tasks.completed} Done</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
