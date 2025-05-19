
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CheckSquare,
  TicketCheck,
  FileText,
  CreditCard,
  Settings,
  Menu,
  X,
  MessageSquare,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin" || user?.role === "admin:member";
  
  const items: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Services",
      href: "/services",
      icon: ShoppingBag,
      adminOnly: true,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: ShoppingBag,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      title: "Tickets",
      href: "/tickets",
      icon: TicketCheck,
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: FileText,
    },
    {
      title: "Subscriptions",
      href: "/subscriptions",
      icon: CreditCard,
    },
    {
      title: "Marketing",
      href: "/marketing",
      icon: BarChart3,
      adminOnly: true,
    },
    {
      title: "Team",
      href: "/team",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Support",
      href: "/support",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              FluxFlow
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      <div className="flex flex-col flex-1 py-4 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {items.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon size={20} className={cn("flex-shrink-0", isActive && "text-primary-700")} />
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        {!collapsed && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {user.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.full_name || "Usuario"}</span>
                <span className="text-xs text-gray-500">{user.role || "Sin rol"}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8 border border-gray-200">
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {user?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {collapsed && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-2">
                <LogOut size={18} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
