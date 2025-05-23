
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  createClient, 
  updateClient, 
  deleteClient, 
  sendMagicLink,
  createUserAccount 
} from "../services/clientsService";
import type { ClientFormData } from "../types";

export function useClientMutations() {
  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientFormData) => {
      const { password, ...clientDbData } = clientData;
      
      // First create the client in the database
      const client = await createClient(clientDbData);
      
      // Then create a user account if password is provided
      if (password) {
        try {
          await createUserAccount(clientData.email, password, {
            full_name: clientData.name,
            role: 'client',
            client_id: client.id
          });
        } catch (authError: any) {
          toast.error(`Client created but couldn't create user: ${authError.message}`);
        }
      }
      
      return client;
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
      const { id, password, ...data } = clientData;
      const updatedClient = await updateClient(id, data);
      
      // Update user password if provided
      if (password) {
        try {
          // Find users associated with this client's email
          const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', data.email)
            .limit(1);
          
          if (userError) {
            throw new Error(userError.message);
          }
          
          if (users && users.length > 0) {
            // This will need to be handled differently as admin.updateUserById is not available in the client
            toast.warning(`Password update requires admin privileges`);
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
