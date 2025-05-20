
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "admin:member" | "client" | "client:member";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir
  if (requiredRole && user.role !== requiredRole) {
    const isAdminAccessing = user.role === "admin" && 
      (requiredRole === "admin:member" || requiredRole === "client" || requiredRole === "client:member");
    
    // Los administradores pueden acceder a cualquier ruta
    if (!isAdminAccessing) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
