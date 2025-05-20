
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Client, ClientFormData } from "../types";

export function useClients() {
  const queryClient = useQueryClient();
  
  const getClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Client[];
  };

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const createClient = async (clientData: ClientFormData) => {
    const { password, ...clientDbData } = clientData;
    
    // First create the client in the database
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientDbData.name,
        email: clientDbData.email,
        phone: clientDbData.phone || null,
        address: clientDbData.address || null,
        logo_url: clientDbData.logo_url || null,
        stripe_customer_id: null
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Then create a user account if password is provided
    if (password) {
      const { error: authError } = await supabase.auth.admin.createUser({
        email: clientData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: clientData.name,
          role: 'client',
          client_id: data.id
        }
      });
      
      if (authError) {
        // Since the client was created but user wasn't, we should handle this case
        // In a real app, you might want to delete the client or flag it for review
        toast.error(`Client created but couldn't create user: ${authError.message}`);
      }
    }
    
    return data as Client;
  };

  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error(`Error creating client: ${error.message}`);
    }
  });

  const updateClient = async (clientData: ClientFormData & { id: string }) => {
    const { id, password, ...data } = clientData;
    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        logo_url: data.logo_url || null,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Update user password if provided
    if (password) {
      // Find the user associated with this client
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('client_id', id)
        .single();
      
      if (profiles?.id) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          profiles.id,
          { password }
        );
        
        if (authError) {
          toast.error(`Client updated but couldn't update password: ${authError.message}`);
        }
      }
    }
    
    return updatedClient as Client;
  };

  const updateClientMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      toast.success("Client updated successfully");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error(`Error updating client: ${error.message}`);
    }
  });

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error(`Error deleting client: ${error.message}`);
    }
  });

  return {
    clients,
    isLoading,
    error,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
}
