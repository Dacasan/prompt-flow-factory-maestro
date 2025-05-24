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
      .in('role', ['admin', 'admin:member'])
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
    // Create user account in Supabase Auth first
    if (password) {
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || email.split('@')[0],
            role: role
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });
      
      if (authError) {
        throw new Error(`Failed to create user account: ${authError.message}`);
      }
      
      // Confirm the user's email using admin API to allow immediate login
      if (authUser.user) {
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authUser.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('Error confirming user email:', confirmError);
          toast.warning('User created but email verification failed. User may need to verify email manually.');
        }
      }
      
      // The user profile will be automatically created by the database trigger
      
      // Create invitation record for tracking
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          token: crypto.randomUUID(),
          status: 'accepted' // Mark as accepted since user was created directly
        })
        .select()
        .single();
      
      if (invitationError) {
        console.error('Error creating invitation record:', invitationError);
        // Return a mock invitation response if invitation creation fails
        return {
          id: crypto.randomUUID(),
          email,
          role,
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          status: 'accepted'
        } as InvitationResponse;
      }
      
      return invitation as InvitationResponse;
    } else {
      // Create invitation without user account (magic link flow)
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
      
      // Create a mock invite link for demo purposes
      const inviteLink = `${window.location.origin}/auth?invitation=${data.token}`;
      
      return {
        ...data,
        inviteLink
      } as InvitationResponse;
    }
  };
  
  const inviteTeamMemberMutation = useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      toast.success('Team member invited successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast.error(`Error inviting team member: ${error.message}`);
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
    // First delete the user from auth (this will cascade to profiles due to RLS)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      // If auth deletion fails, try deleting from profiles table directly
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (profileError) {
        throw new Error(profileError.message);
      }
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
  
  const team = teamMembers;
  
  return {
    teamMembers,
    team,
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
