
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client } from "@/domains/clients/types";
import { Service } from "@/domains/services/types";
import { DatePicker } from "@/components/ui/date-picker";

// Define the order form schema without total_amount
const OrderFormSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  service_id: z.string().min(1, "Service is required"),
  estimated_delivery_date: z.date().optional(),
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

interface OrderFormProps {
  clients: Client[];
  services: Service[];
  onOrderCreate: (data: OrderFormValues & { total_amount: number }) => void;
  isSubmitting?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  clients,
  services,
  onOrderCreate,
  isSubmitting = false,
}) => {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      client_id: "",
      service_id: "",
    },
  });

  const watchServiceId = form.watch("service_id");
  const selectedService = services.find(s => s.id === watchServiceId);

  const handleSubmit = (data: OrderFormValues) => {
    if (selectedService) {
      onOrderCreate({
        ...data,
        total_amount: selectedService.price
      });
    }
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
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
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
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">Selected Service Price: ${selectedService.price}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="estimated_delivery_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Estimated Delivery Date</FormLabel>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
                className="w-full"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !selectedService} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Order"
          )}
        </Button>
      </form>
    </Form>
  );
};
