
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, FileText, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Hello {user?.user_metadata?.full_name || user?.email}, manage your services and orders from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
