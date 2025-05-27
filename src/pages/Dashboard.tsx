
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ShoppingBag, TicketCheck, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrders } from "@/domains/orders/hooks/useOrders";
import { useTasks } from "@/domains/tasks/hooks/useTasks";
import { useTickets } from "@/domains/tickets/hooks/useTickets";

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "admin:member";
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const { tickets } = useTickets();

  // Calculate real stats
  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'in_progress'
  );
  const pendingTasks = tasks.filter(task => 
    task.status === 'todo' || task.status === 'in_progress'
  );
  const openTickets = tickets.filter(ticket => ticket.status === 'open');
  const recentOrders = orders.slice(0, 5);
  const recentTasks = tasks.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

  const stats = [
    { 
      title: "Active Orders", 
      value: activeOrders.length.toString(), 
      icon: ShoppingBag, 
      href: "/orders", 
      color: "bg-blue-50 text-blue-600" 
    },
    { 
      title: "Pending Tasks", 
      value: pendingTasks.length.toString(), 
      icon: CheckSquare, 
      href: "/tasks", 
      color: "bg-amber-50 text-amber-600" 
    },
    { 
      title: "Open Tickets", 
      value: openTickets.length.toString(), 
      icon: TicketCheck, 
      href: "/tickets", 
      color: "bg-red-50 text-red-600" 
    },
    { 
      title: "Total Orders", 
      value: orders.length.toString(), 
      icon: FileText, 
      href: "/orders", 
      color: "bg-green-50 text-green-600" 
    },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || "User"}!
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
            <CardFooter>
              <Link to={stat.href} className="w-full">
                <Button variant="ghost" size="sm" className="gap-1 w-full justify-start">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {task.status} 
                      {task.due_date && ` - Due: ${new Date(task.due_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="self-start sm:self-center">
                    View
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No tasks to display.</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/tasks" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View All Tasks
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Support tickets awaiting response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {ticket.status} - {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="self-start sm:self-center">
                    View
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No tickets to display.</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/tickets" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View All Tickets
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">Order #{order.id?.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.clients?.name || 'Unknown Client'} - {order.services?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {order.status}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium">${order.total_amount}</span>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No orders to display.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/orders" className="w-full">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
