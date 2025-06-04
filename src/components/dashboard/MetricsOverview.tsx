
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DollarSign, 
  Users, 
  CheckSquare, 
  TicketCheck,
  TrendingUp,
  Calendar
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
  color?: string;
}

const MetricCard = ({ title, value, change, changeLabel, icon: Icon, trend, color = "bg-blue-50 text-blue-600" }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (trend === "up") return <ArrowUpIcon className="h-3 w-3 text-green-600" />;
    if (trend === "down") return <ArrowDownIcon className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {change > 0 ? '+' : ''}{change}% {changeLabel || "from last month"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MetricsOverviewProps {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    activeClients: number;
    clientsChange: number;
    completedTasks: number;
    tasksChange: number;
    openTickets: number;
    ticketsChange: number;
  };
}

export const MetricsOverview = ({ stats }: MetricsOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
        change={stats.revenueChange}
        trend={stats.revenueChange > 0 ? "up" : stats.revenueChange < 0 ? "down" : "stable"}
        icon={DollarSign}
        color="bg-green-50 text-green-600"
      />
      <MetricCard
        title="Active Clients"
        value={stats.activeClients}
        change={stats.clientsChange}
        trend={stats.clientsChange > 0 ? "up" : stats.clientsChange < 0 ? "down" : "stable"}
        icon={Users}
        color="bg-blue-50 text-blue-600"
      />
      <MetricCard
        title="Completed Tasks"
        value={stats.completedTasks}
        change={stats.tasksChange}
        trend={stats.tasksChange > 0 ? "up" : stats.tasksChange < 0 ? "down" : "stable"}
        icon={CheckSquare}
        color="bg-purple-50 text-purple-600"
      />
      <MetricCard
        title="Open Tickets"
        value={stats.openTickets}
        change={stats.ticketsChange}
        trend={stats.ticketsChange < 0 ? "up" : stats.ticketsChange > 0 ? "down" : "stable"}
        icon={TicketCheck}
        color="bg-orange-50 text-orange-600"
      />
    </div>
  );
};
