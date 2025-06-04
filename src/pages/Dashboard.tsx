
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, DollarSign } from "lucide-react";
import { useOrders } from "@/domains/orders/hooks/useOrders";
import { useTasks } from "@/domains/tasks/hooks/useTasks";
import { useTickets } from "@/domains/tickets/hooks/useTickets";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TasksProgress } from "@/components/dashboard/TasksProgress";

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "admin:member";
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const { tickets } = useTickets();

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount?.toString() || "0"));
  }, 0);

  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'in_progress'
  );
  
  const completedTasks = tasks.filter(task => task.status === 'done');
  const wipTasks = tasks.filter(task => task.status === 'wip');
  const todoTasks = tasks.filter(task => task.status === 'todo');
  
  const openTickets = tickets.filter(ticket => ticket.status === 'open');
  const recentOrders = orders.slice(0, 3);
  const recentTasks = tasks.slice(0, 3);
  const urgentTickets = tickets.filter(ticket => ticket.status === 'open').slice(0, 3);

  // Mock data for demonstration (in real app this would come from analytics)
  const dashboardStats = {
    totalRevenue: Math.round(totalRevenue),
    revenueChange: 12.5,
    activeClients: new Set(orders.map(order => order.client_id)).size,
    clientsChange: 8.2,
    completedTasks: completedTasks.length,
    tasksChange: 15.3,
    openTickets: openTickets.length,
    ticketsChange: -5.1, // negative is good for tickets
  };

  const tasksProgressData = {
    total: tasks.length,
    completed: completedTasks.length,
    wip: wipTasks.length,
    todo: todoTasks.length,
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || "User"}! Here's what's happening with your business.
        </p>
      </div>

      <MetricsOverview stats={dashboardStats} />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <RevenueChart />
        <TasksProgress tasks={tasksProgressData} />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Orders */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Latest orders from clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Order #{order.id?.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.clients?.name || 'Unknown Client'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total_amount}</p>
                      <p className="text-xs text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent orders</p>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/orders" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  View All Orders <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'wip' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'wip' ? 'WIP' : task.status}
                    </span>
                  </div>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent tasks</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/tasks" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Urgent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Urgent Tickets
            </CardTitle>
            <CardDescription>Support tickets requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentTickets.length > 0 ? (
              urgentTickets.map((ticket) => (
                <div key={ticket.id} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Client: {ticket.clients?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No urgent tickets</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to={isAdmin ? "/support" : "/client/support"} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View All Tickets <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
