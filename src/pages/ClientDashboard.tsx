
import React from "react";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TicketIcon, MessageCircle, FileText, Headphones } from "lucide-react";

export const ClientDashboard = () => {
  const { user } = useAuth();

  const quickActionItems = [
    {
      title: "Support Tickets",
      description: "Create a new support ticket",
      icon: TicketIcon,
      href: "/client/tickets",
      color: "bg-blue-500",
    },
    {
      title: "Invoices",
      description: "View your invoice history",
      icon: FileText,
      href: "/client/invoices",
      color: "bg-violet-500",
    },
    {
      title: "Customer Support",
      description: "Contact our support team",
      icon: Headphones,
      href: "/client/support",
      color: "bg-orange-500",
    },
    {
      title: "Live Chat",
      description: "Chat with our team in real time",
      icon: MessageCircle,
      href: "/client/support",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || "Client"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActionItems.map((item) => (
          <Card key={item.title} className="overflow-hidden">
            <div className={`${item.color} h-1`} />
            <CardHeader>
              <CardTitle className="flex items-center">
                <item.icon className="h-5 w-5 mr-2" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link to={item.href}>Go to {item.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent account activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Welcome to your dashboard
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your client portal is ready to use
                  </p>
                </div>
                <div className="ml-auto font-medium">Just now</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Overview</CardTitle>
            <CardDescription>
              Current services and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Active Services
                  </p>
                  <p className="text-sm text-muted-foreground">
                    View your active services and details
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/client/services">View Services</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
