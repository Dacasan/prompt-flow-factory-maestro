
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
    
    return data as ExtendedInvoice[];
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
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        client_id: invoiceData.client_id,
        order_id: invoiceData.order_id,
        number: invoiceNumber,
        issue_date: invoiceData.issue_date.toISOString(),
        due_date: invoiceData.due_date.toISOString(),
        total_amount: invoiceData.total_amount,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Create invoice items
    const itemsWithInvoiceId = invoiceData.items.map(item => ({
      invoice_id: data.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);
    
    if (itemsError) {
      console.error('Failed to create invoice items:', itemsError);
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
