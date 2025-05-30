
import React, { useState } from "react";
import { useTickets } from "@/domains/tickets/hooks/useTickets";
import { useSupportChat } from "@/domains/support/hooks/useSupportChat";
import { SupportChat } from "@/components/support/SupportChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export const Support = () => {
  const { tickets, isLoading: isLoadingTickets } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { 
    messages, 
    sendMessage, 
    isLoading: isLoadingMessages, 
    isSending 
  } = useSupportChat(selectedTicketId || undefined);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Management</h1>
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
                  No tickets found
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
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{ticket.title}</p>
                          <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {ticket.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Client: {ticket.clients?.name || 'Unknown'}
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
                  Choose a support ticket to view and respond to messages
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
