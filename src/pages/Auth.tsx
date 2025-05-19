
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Esquema para validación de formularios
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Auth() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { register: signupRegister, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Si el usuario ya está autenticado, redirigirlo al dashboard
  if (user) {
    return <Navigate to="/" />;
  }

  // Función para iniciar sesión con email mágico
  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      toast.success("Se ha enviado un enlace de acceso a tu correo");
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para registrarse con email mágico
  const handleSignup = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: window.location.origin,
          // Por defecto, los nuevos usuarios tendrán el rol 'client'
          data: {
            full_name: data.email.split('@')[0],
            role: 'client',
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Se ha enviado un enlace de acceso a tu correo");
    } catch (error: any) {
      console.error("Error de registro:", error);
      toast.error(error.message || "Error al registrarse");
    } finally {
      setIsSubmitting(false);
    }
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
            FluxFlow
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu cuenta o regístrate para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    placeholder="nombre@ejemplo.com"
                    type="email"
                    autoComplete="email"
                    {...loginRegister("email")}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-red-500">{loginErrors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de acceso"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignupSubmit(handleSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    placeholder="nombre@ejemplo.com"
                    type="email"
                    autoComplete="email"
                    {...signupRegister("email")}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-red-500">{signupErrors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y políticas de privacidad.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
