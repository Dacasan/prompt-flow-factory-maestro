
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/domains/auth/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: 'client' | 'admin';
  };
  timestamp: Date;
}

interface SupportChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const SupportChat: React.FC<SupportChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Support Chat</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = user?.id === message.sender.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className={`h-9 w-9 ${isCurrentUser ? "ml-2" : "mr-2"}`}>
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <CardFooter className="pt-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
