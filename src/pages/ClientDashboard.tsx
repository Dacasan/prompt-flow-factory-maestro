
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketCheck, CheckSquare, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTickets } from "@/domains/tickets/hooks/useTickets";
import { useTasks } from "@/domains/tasks/hooks/useTasks";
import { Loader2 } from "lucide-react";

export const ClientDashboard = () => {
  const { user } = useAuth();
  const { tickets, isLoading: ticketsLoading } = useTickets();
  const { tasks, isLoading: tasksLoading } = useTasks();
  
  // Filter tickets for the current client
  const clientTickets = tickets.filter(ticket => 
    ticket.client_id === user?.client_id
  );
  
  // Filter tasks related to client's orders
  const clientTasks = tasks.filter(task => 
    task.order?.client_id === user?.client_id
  );
  
  // Count open tickets
  const openTickets = clientTickets.filter(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  ).length;
  
  // Count pending tasks
  const pendingTasks = clientTasks.filter(task => 
    task.status !== 'done'
  ).length;

  if (ticketsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || "Client"}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <div className="p-2 rounded-full bg-red-50 text-red-600">
              <TicketCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
          </CardContent>
          <CardFooter>
            <Link to="/tickets">
              <Button variant="ghost" size="sm" className="gap-1">
                View tickets <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
          <CardFooter>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="gap-1">
                View tasks <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Invoices</CardTitle>
            <div className="p-2 rounded-full bg-green-50 text-green-600">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
          <CardFooter>
            <Link to="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                View invoices <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Client Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            Track the progress of your current orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would be populated with actual orders data */}
            <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">No orders found</p>
                <p className="text-sm text-muted-foreground">Create your first order to get started</p>
              </div>
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/orders">
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Client Tickets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
          <CardDescription>
            Your latest support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientTickets.length > 0 ? (
              clientTickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">Status: {ticket.status.replace('_', ' ')}</p>
                  </div>
                  <Link to="/tickets">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">No tickets found</p>
                  <p className="text-sm text-muted-foreground">Create your first support ticket</p>
                </div>
                <Link to="/tickets">
                  <Button variant="ghost" size="sm">
                    Create
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/tickets">
            <Button variant="outline" size="sm">
              View All Tickets
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
