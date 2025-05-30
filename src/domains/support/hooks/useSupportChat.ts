
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

export function useSupportChat(ticketId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get messages from the database
  const getMessages = async (): Promise<Message[]> => {
    if (!ticketId) {
      return [];
    }

    const { data, error } = await supabase
      .from('support_messages')
      .select(`
        id,
        content,
        created_at,
        sender:profiles!support_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return (data || []).map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: {
        id: msg.sender.id,
        name: msg.sender.full_name || 'Unknown User',
        avatar: msg.sender.avatar_url,
        role: msg.sender.role === 'client' ? 'client' : 'admin'
      },
      timestamp: new Date(msg.created_at)
    }));
  };
  
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['support-messages', ticketId],
    queryFn: getMessages,
    enabled: !!ticketId,
  });
  
  const sendMessage = async (content: string): Promise<Message> => {
    if (!user) throw new Error("User must be logged in to send messages");
    if (!ticketId) throw new Error("No ticket ID available");
    
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        content,
        sender_id: user.id,
        ticket_id: ticketId,
      })
      .select(`
        id,
        content,
        created_at,
        sender:profiles!support_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      content: data.content,
      sender: {
        id: data.sender.id,
        name: data.sender.full_name || 'Unknown User',
        avatar: data.sender.avatar_url,
        role: data.sender.role === 'client' ? 'client' : 'admin'
      },
      timestamp: new Date(data.created_at)
    };
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ 
        queryKey: ['support-messages', ticketId] 
      });
      toast.success('Message sent successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to send message: ${err.message}`);
    }
  });
  
  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending
  };
}
