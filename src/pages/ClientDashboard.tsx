
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, FileText, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/domains/orders/hooks/useOrders";
import { useTickets } from "@/domains/tickets/hooks/useTickets";

export const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { tickets } = useTickets();

  // Filter orders for current client
  const clientOrders = orders.filter(order => order.client_id === user?.client_id);
  const recentOrders = clientOrders.slice(0, 3);
  const openTickets = tickets.filter(ticket => 
    ticket.client_id === user?.client_id && ticket.status === 'open'
  );

  const quickActions = [
    {
      title: "Browse Services",
      description: "View our available services and make purchases",
      icon: <ShoppingBag className="h-6 w-6" />,
      action: () => navigate("/client/services"),
      color: "bg-blue-500"
    },
    {
      title: "My Orders",
      description: "Track your current and past orders",
      icon: <Package className="h-6 w-6" />,
      action: () => navigate("/orders"),
      color: "bg-green-500"
    },
    {
      title: "Invoices",
      description: "View and download your invoices",
      icon: <FileText className="h-6 w-6" />,
      action: () => navigate("/invoices"),
      color: "bg-orange-500"
    },
    {
      title: "Support",
      description: "Get help with your account or services",
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => navigate("/tickets"),
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Hello {user?.full_name || user?.email}, manage your services and orders from here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-4`}>
                {action.icon}
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription className="text-sm">
                {action.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">Order #{order.id?.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.services?.name} - ${order.total_amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {order.status}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground self-start sm:self-center">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm break-all">{user?.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm font-medium">Total Orders:</span>
              <span className="text-sm">{clientOrders.length}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-sm font-medium">Open Tickets:</span>
              <span className="text-sm">{openTickets.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
