
import React from "react";
import { useSupportChat } from "@/domains/support/hooks/useSupportChat";
import { SupportChat } from "@/components/support/SupportChat";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/domains/auth/hooks/useAuth";

export const ClientSupport = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, isSending } = useSupportChat();

  if (!user?.client_id) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No client profile found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
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
  );
};
