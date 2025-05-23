
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, InvitationResponse } from "@/domains/team/types";

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
    
    return data as TeamMember[];
  };
  
  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers,
  });
  
  const inviteTeamMember = async ({ email, role, full_name, password }: { email: string; role: string; full_name?: string; password?: string }) => {
    // First create the invitation
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
    
    // If password is provided, create a user account directly
    if (password) {
      try {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: full_name || email,
              role: role
            }
          }
        });
        
        if (authError) {
          throw new Error(authError.message);
        }
      } catch (signupError: any) {
        throw new Error(`Invitation created but couldn't create user: ${signupError.message}`);
      }
    }
    
    // Create a mock invite link for demo purposes
    const inviteLink = `${window.location.origin}/auth?invitation=${data.token}`;
    
    return {
      ...data,
      inviteLink
    } as InvitationResponse;
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
  
  // Send magic link to team member
  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
    
    return { success: true, message: "Magic link sent successfully" };
  };

  const sendMagicLinkMutation = useMutation({
    mutationFn: sendMagicLink,
    onSuccess: () => {
      toast.success(`Magic link sent successfully!`);
    },
    onError: (error: any) => {
      toast.error(`Error sending magic link: ${error.message}`);
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
    sendMagicLink: sendMagicLinkMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
    isSendingMagicLink: sendMagicLinkMutation.isPending
  };
}
