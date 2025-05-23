
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from "@/domains/team/hooks/useTeam";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { Ticket } from "../types";

export interface ExtendedTicket {
  id: string; // Making id required explicitly
  title: string;
  description?: string | null;
  status: string;
  client_id: string;
  created_by?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
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
    
    // Ensure all returned tickets have the required id field and handle possible null values
    const typedData = (data || []).map(ticket => {
      // Helper function to safely access properties
      const safeProfilesData = () => {
        // Check if profiles is null or undefined first
        if (!ticket.profiles) {
          return undefined;
        }
        
        if (typeof ticket.profiles !== 'object') {
          return undefined;
        }
        
        // Check if it's an error object (Supabase returns specific error objects for failed joins)
        if ('error' in ticket.profiles) {
          return undefined;
        }
        
        // Cast to any to safely access properties
        const profiles = ticket.profiles as any;
        return {
          full_name: profiles?.full_name || '',
          avatar_url: profiles?.avatar_url
        };
      };
      
      const safeAssignedData = () => {
        // Check if assigned is null or undefined first
        if (!ticket.assigned) {
          return undefined;
        }
        
        if (typeof ticket.assigned !== 'object') {
          return undefined;
        }
        
        // Check if it's an error object
        if ('error' in ticket.assigned) {
          return undefined;
        }
        
        // Cast to any to safely access properties
        const assigned = ticket.assigned as any;
        return {
          full_name: assigned?.full_name || '',
          avatar_url: assigned?.avatar_url
        };
      };
      
      const safeClientsData = () => {
        if (!ticket.clients) {
          return undefined;
        }
        
        if (typeof ticket.clients !== 'object') {
          return undefined;
        }
        
        // Check if it's an error object
        if ('error' in ticket.clients) {
          return undefined;
        }
        
        const clients = ticket.clients as any;
        return {
          name: clients?.name || '',
          email: clients?.email || ''
        };
      };
      
      // Explicitly construct the ticket object with all required fields
      return {
        id: ticket.id,
        title: ticket.title || '',
        description: ticket.description,
        status: ticket.status || 'open',
        client_id: ticket.client_id,
        created_by: ticket.created_by,
        assigned_to: ticket.assigned_to,
        created_at: ticket.created_at || '',
        updated_at: ticket.updated_at || '',
        clients: safeClientsData(),
        profiles: safeProfilesData(),
        assigned: safeAssignedData()
      } as ExtendedTicket;
    });
    
    return typedData;
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
