
import React, { useState } from "react";
import { useClients } from "@/domains/clients/hooks/useClients";
import { useSupportChat } from "@/domains/support/hooks/useSupportChat";
import { SupportChat } from "@/components/support/SupportChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const Support = () => {
  const { clients, isLoading: isLoadingClients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { 
    messages, 
    sendMessage, 
    isLoading: isLoadingMessages, 
    isSending 
  } = useSupportChat(selectedClientId || undefined);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Chat</h1>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Client List */}
        <Card className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Client Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {isLoadingClients ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground px-4">
                  No clients found
                </div>
              ) : (
                <div className="space-y-1">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      className={cn(
                        "w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                        selectedClientId === client.id && "bg-muted"
                      )}
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarImage src={client.logo_url || undefined} alt={client.name} />
                        <AvatarFallback>
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.email}
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
          {!selectedClientId ? (
            <Card className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a client</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a client from the list to view and send messages
                </p>
              </div>
            </Card>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SupportChat 
              clientId={selectedClientId} 
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
