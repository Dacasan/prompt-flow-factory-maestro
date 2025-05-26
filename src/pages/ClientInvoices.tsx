
import React from "react";
import { useInvoices } from "@/domains/invoices/hooks/useInvoices";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/domains/auth/hooks/useAuth";

export const ClientInvoices = () => {
  const { invoices, isLoading } = useInvoices();
  const { user } = useAuth();

  // Filter invoices for the current client
  const clientInvoices = invoices.filter(invoice => 
    invoice.clients && user?.client_id && invoice.clients.name
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Invoices</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <InvoicesTable invoices={clientInvoices} />
      )}
    </div>
  );
};
