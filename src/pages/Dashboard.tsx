
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ShoppingBag, TicketCheck, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "admin:member";

  // Mock data for the dashboard
  const stats = [
    { title: "Active Orders", value: "5", icon: ShoppingBag, href: "/orders", color: "bg-blue-50 text-blue-600" },
    { title: "Pending Tasks", value: "12", icon: CheckSquare, href: "/tasks", color: "bg-amber-50 text-amber-600" },
    { title: "Open Tickets", value: "3", icon: TicketCheck, href: "/tickets", color: "bg-red-50 text-red-600" },
    { title: "Unpaid Invoices", value: "2", icon: FileText, href: "/invoices", color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || "User"}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <Link to={stat.href}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">Task {i + 1}</p>
                  <p className="text-sm text-muted-foreground">Due in {i + 1} days</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Link to="/tasks">
              <Button variant="outline" size="sm">
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">Ticket {i + 1}</p>
                  <p className="text-sm text-muted-foreground">Created {i + 1} days ago</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
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

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Order #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Client {i + 1}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm mr-4">${(100 * (i + 1)).toFixed(2)}</span>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
