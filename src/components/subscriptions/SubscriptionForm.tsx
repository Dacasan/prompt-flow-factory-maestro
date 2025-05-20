
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

// Define subscription form schema
const SubscriptionFormSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
  service_id: z.string().uuid("Please select a service"),
});

type SubscriptionFormValues = z.infer<typeof SubscriptionFormSchema>;

interface SubscriptionFormProps {
  onSubmit: (data: SubscriptionFormValues & {
    current_period_start: string;
    current_period_end: string;
  }) => void;
  clients: { id: string; name: string; email: string }[];
  services: { id: string; name: string; price: number; type: string }[];
  isSubmitting?: boolean;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubmit,
  clients,
  services,
  isSubmitting = false,
}) => {
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(SubscriptionFormSchema),
    defaultValues: {
      client_id: "",
      service_id: "",
    },
  });
  
  const selectedServiceId = form.watch("service_id");
  const selectedService = services.find(service => service.id === selectedServiceId);
  
  // Calculate subscription period (1 month from today)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  
  const handleSubmit = (data: SubscriptionFormValues) => {
    onSubmit({
      ...data,
      current_period_start: startDate.toISOString(),
      current_period_end: endDate.toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} (${service.price.toFixed(2)}/month)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="font-medium">${selectedService.price.toFixed(2)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Billing period:</span>
                  <span className="font-medium">
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating subscription...
            </>
          ) : (
            "Create Subscription"
          )}
        </Button>
      </form>
    </Form>
  );
};
