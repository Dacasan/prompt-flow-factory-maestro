
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
      const { id, password, ...clientFields } = clientData;
      const updatedClient = await updateClient(id, clientFields);
      
      // Update user password if provided
      if (password) {
        try {
          // Find users associated with this client's email
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', clientFields.email)
            .limit(1);
          
          if (error) {
            throw new Error(error.message);
          }
          
          // Use a simple type definition to avoid deep type inference
          const profileData: { id: string }[] = data ?? [];
          
          if (profileData.length > 0) {
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

/**
 * Creates a client with authentication
 */
export async function createClientWithAuth(data: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}) {
  try {
    // 1. Create the user in Supabase Auth
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: 'client'
        }
      }
    });

    if (signUpError) throw new Error(signUpError.message);

    // 2. Create the client in business table
    const clientRecord = await createClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      logo_url: data.logo_url
    });

    toast.success("Client created successfully");
    return clientRecord;
  } catch (err: any) {
    toast.error(`Error creating client: ${err.message}`);
    throw err;
  }
}
