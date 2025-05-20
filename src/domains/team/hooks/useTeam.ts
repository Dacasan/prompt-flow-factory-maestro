
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useTeam() {
  const queryClient = useQueryClient();
  
  const getTeamMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };
  
  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers,
  });
  
  const inviteTeamMember = async ({ email, role }: { email: string; role: string }) => {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // In a real app, would send an invitation email here
    
    return data;
  };
  
  const inviteTeamMemberMutation = useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast.error(`Error sending invitation: ${error.message}`);
    }
  });
  
  const updateTeamMember = async (memberData: any) => {
    const { id, ...data } = memberData;
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  const updateTeamMemberMutation = useMutation({
    mutationFn: updateTeamMember,
    onSuccess: () => {
      toast.success('Team member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating team member: ${error.message}`);
    }
  });
  
  const removeTeamMember = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  const removeTeamMemberMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      toast.success('Team member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast.error(`Error removing team member: ${error.message}`);
    }
  });
  
  // Add a team property that returns the team members for compatibility
  const team = teamMembers;
  
  return {
    teamMembers,
    team, // Add this line to expose team members as 'team'
    isLoading,
    error,
    inviteTeamMember: inviteTeamMemberMutation.mutate,
    updateTeamMember: updateTeamMemberMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
  };
}
