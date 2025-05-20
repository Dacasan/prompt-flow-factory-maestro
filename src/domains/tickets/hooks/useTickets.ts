
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from "@/domains/team/hooks/useTeam";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { Ticket } from "../types";

export interface ExtendedTicket extends Ticket {
  clients?: { 
    name: string; 
    email: string;
  };
  profiles?: { 
    full_name: string; 
    avatar_url?: string;
  };
  assigned?: { 
    full_name: string; 
    avatar_url?: string;
  };
}

export function useTickets() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { team } = useTeam();
  const { clients } = useClients();
  
  const getTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        clients:client_id (name, email),
        profiles:created_by (full_name, avatar_url),
        assigned:assigned_to (full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Cast the data to ExtendedTicket[] to match the expected type
    return data as unknown as ExtendedTicket[];
  };
  
  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });
  
  const createTicket = async (ticketData: {
    title: string;
    description?: string;
    client_id: string;
    assigned_to?: string;
  }) => {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: ticketData.title,
        description: ticketData.description || null,
        client_id: ticketData.client_id,
        created_by: user?.id,
        assigned_to: ticketData.assigned_to || null,
        status: 'open'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      toast.success('Ticket created successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating ticket: ${error.message}`);
    }
  });
  
  const updateTicketStatus = async ({ id, status }: { id: string; status: string }) => {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  const updateTicketStatusMutation = useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: () => {
      toast.success(`Ticket status updated`);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating ticket: ${error.message}`);
    }
  });
  
  return {
    tickets,
    clients,
    team,
    isLoading,
    error,
    createTicket: createTicketMutation.mutate,
    updateTicketStatus: updateTicketStatusMutation.mutate,
    isCreating: createTicketMutation.isPending,
    isUpdating: updateTicketStatusMutation.isPending,
  };
}
