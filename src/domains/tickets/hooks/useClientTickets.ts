
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/domains/auth/hooks/useAuth";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  client_id: string;
}

export function useClientTickets() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const getTickets = async (): Promise<Ticket[]> => {
    if (!user?.client_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('id, title, description, status, created_at, client_id')
      .eq('client_id', user.client_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
    
    return data || [];
  };
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['client-tickets', user?.client_id],
    queryFn: getTickets,
    enabled: !!user?.client_id,
  });
  
  const createSupportTicket = async (title: string, description: string): Promise<Ticket> => {
    if (!user?.client_id) throw new Error("No client ID available");
    
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        client_id: user.client_id,
        created_by: user.id,
        status: 'open'
      })
      .select('id, title, description, status, created_at, client_id')
      .single();
    
    if (error) throw new Error(error.message);
    
    return data;
  };
  
  const createTicketMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description: string }) => 
      createSupportTicket(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tickets'] });
      toast.success('Support ticket created successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create ticket: ${err.message}`);
    }
  });
  
  return {
    tickets,
    isLoading,
    createTicket: createTicketMutation.mutate,
    isCreating: createTicketMutation.isPending
  };
}
