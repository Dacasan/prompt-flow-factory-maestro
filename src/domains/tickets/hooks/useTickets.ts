
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from "@/domains/team/hooks/useTeam";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { Ticket } from "../types";

export interface ExtendedTicket {
  id: string;
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
    
    const typedData = (data || []).map(ticket => {
      const safeProfilesData = () => {
        if (ticket.profiles == null) return undefined;
        if (typeof ticket.profiles !== 'object') return undefined;
        if (ticket.profiles && 'error' in ticket.profiles) return undefined;
        
        const profiles = ticket.profiles as Record<string, unknown>;
        return {
          full_name: (profiles.full_name as string) || '',
          avatar_url: profiles.avatar_url as string | undefined
        };
      };
      
      const safeAssignedData = () => {
        if (ticket.assigned == null) return undefined;
        if (typeof ticket.assigned !== 'object') return undefined;
        if (ticket.assigned && 'error' in ticket.assigned) return undefined;
        
        const assigned = ticket.assigned as Record<string, unknown>;
        return {
          full_name: (assigned.full_name as string) || '',
          avatar_url: assigned.avatar_url as string | undefined
        };
      };
      
      const safeClientsData = () => {
        if (ticket.clients == null) return undefined;
        if (typeof ticket.clients !== 'object') return undefined;
        if (ticket.clients && 'error' in ticket.clients) return undefined;
        
        const clients = ticket.clients as Record<string, unknown>;
        return {
          name: (clients.name as string) || '',
          email: (clients.email as string) || ''
        };
      };
      
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
    client_id?: string;
    assigned_to?: string;
  }) => {
    // Get the first admin user to assign tickets to
    const { data: adminUser } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'admin:member'])
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: ticketData.title,
        description: ticketData.description || null,
        client_id: ticketData.client_id || user?.client_id || '',
        created_by: user?.id,
        assigned_to: adminUser?.id || null,
        status: 'open'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
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
  
  const reassignTicket = async ({ id, assigned_to }: { id: string; assigned_to: string }) => {
    const { data, error } = await supabase
      .from('tickets')
      .update({ assigned_to })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  // Single mutation for all ticket operations
  const ticketMutation = useMutation({
    mutationFn: async (action: any) => {
      switch (action.type) {
        case 'create':
          return createTicket(action.data);
        case 'updateStatus':
          return updateTicketStatus(action.data);
        case 'reassign':
          return reassignTicket(action.data);
        default:
          throw new Error('Unknown action type');
      }
    },
    onSuccess: (data, variables) => {
      const messages = {
        create: 'Ticket created successfully',
        updateStatus: 'Ticket status updated',
        reassign: 'Ticket reassigned successfully'
      };
      toast.success(messages[variables.type as keyof typeof messages]);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error, variables) => {
      const action = variables.type;
      toast.error(`Error ${action === 'create' ? 'creating' : action === 'updateStatus' ? 'updating' : 'reassigning'} ticket: ${error.message}`);
    }
  });
  
  return {
    tickets,
    clients,
    team,
    isLoading,
    error,
    createTicket: (data: any, options?: any) => ticketMutation.mutate({ type: 'create', data }, options),
    updateTicketStatus: (data: any, options?: any) => ticketMutation.mutate({ type: 'updateStatus', data }, options),
    reassignTicket: (data: any, options?: any) => ticketMutation.mutate({ type: 'reassign', data }, options),
    isCreating: ticketMutation.isPending,
    isUpdating: ticketMutation.isPending,
    isReassigning: ticketMutation.isPending,
  };
}
