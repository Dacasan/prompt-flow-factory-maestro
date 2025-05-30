
import React, { useState } from "react";
import { useSupportChat } from "@/domains/support/hooks/useSupportChat";
import { useClientTickets } from "@/domains/tickets/hooks/useClientTickets";
import { SupportChat } from "@/components/support/SupportChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Plus, Ticket } from "lucide-react";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const ClientSupport = () => {
  const { user } = useAuth();
  const { tickets, isLoading: isLoadingTickets, createTicket, isCreating } = useClientTickets();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  
  const { messages, sendMessage, isLoading: isLoadingMessages, isSending } = useSupportChat(selectedTicketId || undefined);

  if (!user?.client_id) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No client profile found. Please contact support.</p>
        </div>
      </div>
    );
  }

  const handleCreateTicket = () => {
    if (newTicketTitle.trim() && newTicketDescription.trim()) {
      createTicket({ title: newTicketTitle, description: newTicketDescription });
      setNewTicketTitle("");
      setNewTicketDescription("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ticket title"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
              />
              <Textarea
                placeholder="Describe your issue..."
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
              />
              <Button 
                onClick={handleCreateTicket} 
                disabled={isCreating || !newTicketTitle.trim() || !newTicketDescription.trim()}
                className="w-full"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Tickets List */}
        <Card className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {isLoadingTickets ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground px-4">
                  No support tickets found
                </div>
              ) : (
                <div className="space-y-1">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      className={cn(
                        "w-full flex items-start px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                        selectedTicketId === ticket.id && "bg-muted"
                      )}
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: {ticket.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {!selectedTicketId ? (
            <Card className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a ticket</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a support ticket to view and send messages
                </p>
              </div>
            </Card>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SupportChat 
              messages={messages} 
              onSendMessage={sendMessage}
              isLoading={isSending}
            />
          )}
        </div>
      </div>
    </div>
  );
};
