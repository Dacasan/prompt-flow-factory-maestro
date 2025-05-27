
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

// Demo messages for now - in a real app, these would come from the database
const demoMessages = (clientId: string, adminId: string): Message[] => [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    sender: {
      id: adminId,
      name: 'Support Agent',
      role: 'admin' as const
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 24) // 24 minutes ago
  },
  {
    id: '2',
    content: 'I have a question about my recent invoice.',
    sender: {
      id: clientId,
      name: 'Client',
      role: 'client' as const
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 23) // 23 minutes ago
  },
  {
    id: '3',
    content: 'Sure! I can help you with that. What specific information do you need about your invoice?',
    sender: {
      id: adminId,
      name: 'Support Agent',
      role: 'admin' as const
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
  }
];

export function useSupportChat(clientId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // In a real app, this would fetch messages from the database
  // For now, we'll use demo data
  const getMessages = async (): Promise<Message[]> => {
    // In a real implementation, we'd fetch from the database
    // const { data, error } = await supabase
    //   .from('chat_messages')
    //   .select('*')
    //   .eq(user?.role === 'client' ? 'client_id' : 'id', clientId || user?.client_id)
    //   .order('created_at', { ascending: true });
    
    // if (error) throw new Error(error.message);
    // return data;
    
    // For demo purposes, return mock data
    return demoMessages(
      clientId || user?.client_id || 'client-id', 
      'admin-id'
    );
  };
  
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['support-chat', clientId || user?.client_id],
    queryFn: getMessages,
  });
  
  const sendMessage = async (content: string): Promise<Message> => {
    if (!user) throw new Error("User must be logged in to send messages");
    
    // In a real app, this would save to the database
    // const { data, error } = await supabase
    //   .from('chat_messages')
    //   .insert({
    //     content,
    //     user_id: user.id,
    //     client_id: clientId || user.client_id,
    //     created_at: new Date().toISOString()
    //   })
    //   .select()
    //   .single();
    
    // if (error) throw new Error(error.message);
    // return data;
    
    // For demo purposes, return a mock message
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: user.id,
        name: user.full_name || 'User',
        avatar: user.avatar_url,
        role: (user.role === 'client' ? 'client' : 'admin') as 'client' | 'admin'
      },
      timestamp: new Date()
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newMessage;
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async (content) => {
      // Optimistic update
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        sender: {
          id: user?.id || '',
          name: user?.full_name || 'User',
          avatar: user?.avatar_url,
          role: (user?.role === 'client' ? 'client' : 'admin') as 'client' | 'admin'
        },
        timestamp: new Date()
      };
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['support-chat', clientId || user?.client_id] });
      
      // Save previous messages
      const previousMessages = queryClient.getQueryData<Message[]>([
        'support-chat', 
        clientId || user?.client_id
      ]);
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ['support-chat', clientId || user?.client_id], 
        [...(previousMessages || []), newMessage]
      );
      
      return { previousMessages };
    },
    onError: (err, _, context) => {
      toast.error(`Failed to send message: ${err.message}`);
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['support-chat', clientId || user?.client_id], 
          context.previousMessages
        );
      }
    },
    onSuccess: (newMessage) => {
      // Update cache with the actual message from the server
      queryClient.setQueryData(
        ['support-chat', clientId || user?.client_id], 
        (old: Message[] | undefined) => {
          if (!old) return [newMessage];
          // Replace the temporary message with the real one or append it
          const filtered = old.filter(msg => msg.id !== `temp-${Date.now()}`);
          return [...filtered, newMessage];
        }
      );
      
      // In a real app with realtime, we'd instead refresh the entire list
      // queryClient.invalidateQueries({ queryKey: ['support-chat', clientId || user?.client_id] });
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
