
import React, { useEffect } from "react";
import { useServices } from "@/domains/services/hooks/useServices";
import { ServicePricingCard } from "@/components/services/ServicePricingCard";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ClientServices = () => {
  const { services, isLoading } = useServices();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');
      const serviceId = searchParams.get('service_id');
      
      if (success === 'true' && sessionId && serviceId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) throw new Error("User not authenticated");

          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: {
              session_id: sessionId,
              service_id: serviceId,
              user_id: userData.user.id
            }
          });

          if (error) throw error;

          if (data.success) {
            toast.success('Payment successful! Your order has been created.');
            // Clear URL parameters
            window.history.replaceState({}, document.title, '/client/services');
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Failed to verify payment');
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose from our premium services designed to help your business grow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service) => (
          <ServicePricingCard
            key={service.id}
            service={service}
          />
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
          <p className="text-muted-foreground">
            Our services are currently being updated. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
};
