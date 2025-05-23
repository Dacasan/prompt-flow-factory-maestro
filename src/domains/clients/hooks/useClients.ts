
import { useQuery } from "@tanstack/react-query";
import { getClients } from "../services/clientsService";
import { useClientMutations } from "./useClientMutations";
import { supabase } from "@/integrations/supabase/client";

export function useClients() {
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
  
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
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
