
import React from "react";
import { Service } from "@/domains/services/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Package, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicePricingCardProps {
  service: Service;
  onPurchase?: (service: Service) => void;
  isPurchasing?: boolean;
}

const getServiceIcon = (iconName?: string) => {
  switch (iconName) {
    case "package":
      return <Package className="h-6 w-6" />;
    case "zap":
      return <Zap className="h-6 w-6" />;
    case "clock":
      return <Clock className="h-6 w-6" />;
    default:
      return <Package className="h-6 w-6" />;
  }
};

export const ServicePricingCard: React.FC<ServicePricingCardProps> = ({
  service,
  onPurchase,
  isPurchasing = false,
}) => {
  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { service_id: service.id }
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    }
  };

  const isRecurring = service.type === 'recurring';

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isRecurring ? 'border-primary shadow-md' : ''
    }`}>
      {isRecurring && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
          Popular
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {getServiceIcon(service.icon)}
        </div>
        <CardTitle className="text-xl font-bold">{service.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {service.description || "Premium service offering"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-primary">
            ${service.price.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRecurring ? `per ${service.duration} days` : 'one-time'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">Professional service delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">
              {isRecurring ? 'Ongoing support' : `${service.duration} days delivery`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">Quality guarantee</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Badge variant={isRecurring ? "default" : "outline"}>
            {isRecurring ? 'Recurring' : 'One Time'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <>Processing...</>
          ) : (
            <>
              {isRecurring ? 'Subscribe Now' : 'Buy Now'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
