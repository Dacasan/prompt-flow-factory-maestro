
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Schema for form validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Auth() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/" />;
  }

  // Function to sign in with magic link or password
  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      if (showPasswordField && data.password) {
        // Authentication with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (error) throw error;
        
        toast.success("Successfully signed in");
      } else {
        // Authentication with magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (error) throw error;
        
        toast.success("Access link sent to your email");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Error signing in");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to toggle password field visibility
  const togglePasswordField = () => {
    setShowPasswordField(!showPasswordField);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">
            AdWebCRM
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            {showPasswordField && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="link" 
                onClick={togglePasswordField}
                className="p-0"
              >
                {showPasswordField ? "Use magic link" : "Use password"}
              </Button>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showPasswordField ? "Signing in..." : "Sending..."}
                </>
              ) : (
                showPasswordField ? "Sign in" : "Send access link"
              )}
            </Button>
          </form>
        </CardContent>
        <div className="p-6 pt-0">
          <div className="text-center text-sm text-gray-500">
            By continuing, you agree to our terms of service and privacy policy.
          </div>
        </div>
      </Card>
    </div>
  );
}
