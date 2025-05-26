
import React, { useState } from "react";
import { useInvoices } from "@/domains/invoices/hooks/useInvoices";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Invoices = () => {
  const { 
    invoices, 
    clients,
    orders,
    isLoading, 
    createInvoice,
    isCreating
  } = useInvoices();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateSubmit = (data: any) => {
    createInvoice(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  // Transform orders to match the expected format for InvoiceForm
  const formattedOrders = orders ? orders.map(order => ({
    id: order.id || '',
    clients: order.clients ? {
      name: order.clients.name || ''
    } : undefined,
    services: order.services ? {
      name: order.services.name || ''
    } : undefined,
    total_amount: order.total_amount || 0
  })) : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create Invoice</SheetTitle>
              <SheetDescription>
                Generate a new invoice for a client.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <InvoiceForm
                clients={clients || []}
                orders={formattedOrders}
                onInvoiceCreate={handleCreateSubmit}
                isSubmitting={isCreating}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <InvoicesTable invoices={invoices} />
      )}
    </div>
  );
};
