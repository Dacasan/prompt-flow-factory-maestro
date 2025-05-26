
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ClientTicketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type ClientTicketFormValues = z.infer<typeof ClientTicketFormSchema>;

interface ClientTicketFormProps {
  onTicketCreate: (data: ClientTicketFormValues) => void;
  isSubmitting?: boolean;
}

export const ClientTicketForm: React.FC<ClientTicketFormProps> = ({
  onTicketCreate,
  isSubmitting = false,
}) => {
  const form = useForm<ClientTicketFormValues>({
    resolver: zodResolver(ClientTicketFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onTicketCreate)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ticket title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your issue or request" 
                  className="resize-none" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Ticket"
          )}
        </Button>
      </form>
    </Form>
  );
};
