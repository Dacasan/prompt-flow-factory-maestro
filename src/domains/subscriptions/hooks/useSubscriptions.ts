
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/domains/subscriptions/types";

// Type for the extended subscription with related data
export type ExtendedSubscription = Subscription & {
  clients?: { name: string; email: string };
  services?: { name: string; price: number; type: string };
};

export function useSubscriptions() {
  const queryClient = useQueryClient();
  
  const getSubscriptions = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients:client_id (name, email),
        services:service_id (name, price, type)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as ExtendedSubscription[];
  };
  
  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });
  
  const createSubscription = async (subscriptionData: {
    client_id: string;
    service_id: string;
    status?: string;
    current_period_start: string;
    current_period_end: string;
  }) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Subscription;
  };
  
  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      toast.success('Subscription created successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating subscription: ${error.message}`);
    }
  });
  
  const cancelSubscription = async (id: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Subscription;
  };
  
  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: Error) => {
      toast.error(`Error canceling subscription: ${error.message}`);
    }
  });
  
  return {
    subscriptions,
    isLoading,
    error,
    createSubscription: createSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreating: createSubscriptionMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
}
