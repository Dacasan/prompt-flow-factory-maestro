
import React, { useState } from "react";
import { useTickets } from "@/domains/tickets/hooks/useTickets";
import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketsTable } from "@/components/tickets/TicketsTable";
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

export const Tickets = () => {
  const { 
    tickets, 
    clients,
    team,
    isLoading, 
    createTicket,
    updateTicketStatus,
    isCreating, 
    isUpdating
  } = useTickets();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleCreateSubmit = (data: any) => {
    createTicket(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };
  
  const handleUpdateStatus = (id: string, status: string) => {
    updateTicketStatus({
      id,
      status
    });
  };

  // Transform tickets to match the TicketsTable expected format with proper typing
  const formattedTickets = tickets.map(ticket => ({
    id: ticket.id, // id is now required in ExtendedTicket
    title: ticket.title || '',
    description: ticket.description,
    status: ticket.status || 'open',
    client_id: ticket.client_id || '',
    created_by: ticket.created_by,
    assigned_to: ticket.assigned_to,
    created_at: ticket.created_at || '',
    clients: ticket.clients,
    profiles: ticket.profiles,
    assigned: ticket.assigned
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create Ticket</SheetTitle>
              <SheetDescription>
                Fill out the ticket information in the form below.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <TicketForm
                clients={clients || []}
                team={team || []}
                onTicketCreate={handleCreateSubmit}
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
        <TicketsTable
          tickets={formattedTickets}
          team={team || []}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
