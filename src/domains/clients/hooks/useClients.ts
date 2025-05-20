
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
      try {
        // Create user directly with signUp instead of using admin.generateLink
        const { error: authError } = await supabase.auth.signUp({
          email: clientData.email,
          password: password,
          options: {
            data: {
              full_name: clientData.name,
              role: 'client',
              client_id: data.id
            }
          }
        });
        
        if (authError) {
          // Since the client was created but user wasn't, we should handle this case
          toast.error(`Client created but couldn't create user: ${authError.message}`);
        }
      } catch (authError: any) {
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
    onError: (error: any) => {
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
      try {
        // Find the user associated with this client's email
        const { data: authUser, error: findError } = await supabase.auth.admin.getUserByEmail(
          data.email
        );
        
        if (!findError && authUser?.user) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.user.id,
            { password }
          );
          
          if (updateError) {
            toast.error(`Client updated but couldn't update password: ${updateError.message}`);
          }
        }
      } catch (authError: any) {
        toast.error(`Client updated but couldn't update password: ${authError.message}`);
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast.error(`Error deleting client: ${error.message}`);
    }
  });

  // Send magic link to client
  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
    
    return { success: true, message: "Magic link sent successfully" };
  };

  const sendMagicLinkMutation = useMutation({
    mutationFn: sendMagicLink,
    onSuccess: () => {
      toast.success(`Magic link sent successfully!`);
    },
    onError: (error: any) => {
      toast.error(`Error sending magic link: ${error.message}`);
    }
  });

  return {
    clients,
    isLoading,
    error,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    sendMagicLink: sendMagicLinkMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    isSendingMagicLink: sendMagicLinkMutation.isPending
  };
}
