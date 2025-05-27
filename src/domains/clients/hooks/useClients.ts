
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients } from "../services/clientsService";
import { useClientMutations } from "./useClientMutations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useClients() {
  const queryClient = useQueryClient();
  
  const { 
    createClient,
    updateClient,
    deleteClient,
    sendMagicLink,
    isCreating,
    isUpdating,
    isDeleting,
    isSendingMagicLink
  } = useClientMutations();
  
  const fetchClients = async () => {
    console.log("Fetching clients...");
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching clients:", error);
      toast.error(`Error fetching clients: ${error.message}`);
      throw error;
    }
    
    console.log("Fetched clients:", data);
    return data || [];
  };
  
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    sendMagicLink,
    isCreating,
    isUpdating,
    isDeleting,
    isSendingMagicLink
  };
}
