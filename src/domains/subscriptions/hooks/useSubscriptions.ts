
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/domains/subscriptions/types";

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
    
    return data as (Subscription & {
      clients: { name: string; email: string };
      services: { name: string; price: number; type: string };
    })[];
  };
  
  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  // Get client list for dropdowns
  const getClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email')
      .order('name');
    
    if (error) throw new Error(error.message);
    
    return data;
  };
  
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  
  // Get service list for dropdowns
  const getServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, price, type')
      .eq('is_active', true)
      .eq('type', 'recurring')
      .order('name');
    
    if (error) throw new Error(error.message);
    
    return data;
  };
  
  const { data: services = [] } = useQuery({
    queryKey: ['services-for-subscriptions'],
    queryFn: getServices,
  });
  
  const createSubscription = async (subscriptionData: {
    client_id: string;
    service_id: string;
    status?: string;
    current_period_start: string;
    current_period_end: string;
    stripe_subscription_id?: string;
  }) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
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
  
  const updateSubscription = async (subscriptionData: {
    id: string;
    status?: string;
    current_period_end?: string;
    stripe_subscription_id?: string;
  }) => {
    const { id, ...rest } = subscriptionData;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  const updateSubscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      toast.success('Subscription updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating subscription: ${error.message}`);
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
    
    return data;
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
    clients,
    services,
    isLoading,
    error,
    createSubscription: createSubscriptionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
}
