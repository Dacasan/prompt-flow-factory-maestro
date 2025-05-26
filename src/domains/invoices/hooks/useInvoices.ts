
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useOrders } from "@/domains/orders/hooks/useOrders";

export type ExtendedInvoice = {
  id: string;
  number: string;
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  clients?: { name: string };
  pdf_url?: string;
};

export function useInvoices() {
  const queryClient = useQueryClient();
  const { clients } = useClients();
  const { orders } = useOrders();
  
  const getInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients:client_id (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform data to match ExtendedInvoice type
    return data.map(invoice => ({
      id: invoice.id,
      number: `INV-${invoice.id.slice(0, 8)}`,
      status: invoice.status || 'pending',
      issue_date: invoice.created_at,
      due_date: invoice.due_date || invoice.created_at,
      total_amount: invoice.amount || 0,
      clients: invoice.clients,
      pdf_url: null
    })) as ExtendedInvoice[];
  };
  
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });
  
  const createInvoice = async (invoiceData: {
    client_id: string;
    order_id?: string | null;
    issue_date: Date;
    due_date: Date;
    items: Array<{description: string; quantity: number; unit_price: number}>;
    tax_rate: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
  }) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        client_id: invoiceData.client_id,
        order_id: invoiceData.order_id,
        due_date: invoiceData.due_date.toISOString(),
        amount: invoiceData.total_amount,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating invoice: ${error.message}`);
    }
  });
  
  return {
    invoices,
    clients,
    orders,
    isLoading,
    error,
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
  };
}
