
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  createClient, 
  updateClient, 
  deleteClient, 
  sendMagicLink
} from "../services/clientsService";
import type { ClientFormData } from "../types";

export function useClientMutations() {
  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormData) => {
      const { password, ...clientDbData } = clientData;
      
      // First create the user in Supabase Auth
      if (password) {
        const { data: authUser, error: authError } = await supabase.auth.signUp({
          email: clientData.email,
          password: password,
          options: {
            data: {
              full_name: clientData.name,
              role: 'client'
            }
          }
        });

        if (authError) {
          throw new Error(`Failed to create user account: ${authError.message}`);
        }

        // Create the client in the database
        const client = await createClient(clientDbData);
        
        // Update the user's profile with client_id
        if (authUser.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ client_id: client.id })
            .eq('id', authUser.user.id);
          
          if (profileError) {
            console.error('Error updating profile with client_id:', profileError);
          }
        }
        
        return client;
      } else {
        // Create client without auth account
        return await createClient(clientDbData);
      }
    },
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      toast.error(`Error creating client: ${error.message}`);
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormData & { id: string }) => {
      const { id, password, ...clientFields } = clientData;
      const updatedClient = await updateClient(id, clientFields);
      
      // Update user password if provided
      if (password) {
        try {
          // Find the user profile for this client
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('client_id', id)
            .eq('role', 'client')
            .single();
          
          if (profileError) {
            throw new Error(`Could not find user profile: ${profileError.message}`);
          }
          
          if (profile) {
            // Note: Password updates require admin privileges in production
            toast.warning(`Password update requires admin privileges. Please use the admin panel.`);
          }
        } catch (authError: any) {
          toast.error(`Client updated but couldn't update password: ${authError.message}`);
        }
      }
      
      return updatedClient;
    },
    onSuccess: () => {
      toast.success("Client updated successfully");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating client: ${error.message}`);
    }
  });

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
