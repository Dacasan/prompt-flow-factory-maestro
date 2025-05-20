
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/domains/orders/types";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useServices } from "@/domains/services/hooks/useServices";

export type ExtendedOrder = Order & {
  clients?: { name: string; email: string };
  services?: { name: string; price: number; type: string };
};

export function useOrders() {
  const queryClient = useQueryClient();
  const { clients } = useClients();
  const { services } = useServices();
  
  const getOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients:client_id (name, email),
        services:service_id (name, price, type)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as ExtendedOrder[];
  };
  
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
  
  const createOrder = async (orderData: {
    client_id: string;
    service_id: string;
    total_amount: number;
    estimated_delivery_date?: Date;
  }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        client_id: orderData.client_id,
        service_id: orderData.service_id,
        total_amount: orderData.total_amount,
        estimated_delivery_date: orderData.estimated_delivery_date ? orderData.estimated_delivery_date.toISOString() : null,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Order;
  };
  
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating order: ${error.message}`);
    }
  });
  
  const updateOrderStatus = async ({ id, status }: { id: string; status: string }) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Order;
  };
  
  const updateOrderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      toast.success(`Order ${data.status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating order: ${error.message}`);
    }
  });
  
  return {
    orders,
    clients,
    services,
    isLoading,
    error,
    createOrder: createOrderMutation.mutate,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderStatusMutation.isPending,
  };
}
