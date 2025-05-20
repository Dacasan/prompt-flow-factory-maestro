
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember, InvitationData, Invitation } from "../types";

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
    
    // Cast the data to TeamMember[] and ensure all required fields are present
    const teamMembers = data?.map(profile => ({
      ...profile,
      email: profile.email || '', // Ensure email is defined
      last_sign_in_at: profile.last_sign_in_at || null
    })) as TeamMember[];
    
    return teamMembers;
  };

  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers,
  });

  const inviteTeamMember = async (invitationData: InvitationData) => {
    // Generate a random token for invitation
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Set expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: user } = await supabase.auth.getUser();
    
    // Create invitation
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email: invitationData.email,
        role: invitationData.role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: user.user?.id,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // In a real application, you would send an email with the invitation link
    // For this demo, we'll just return the token
    return { ...(data as Invitation), inviteLink: `${window.location.origin}/auth?token=${token}` };
  };

  const inviteTeamMemberMutation = useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (data) => {
      toast.success(`Team member invited successfully! Token: ${data.token}`);
      queryClient.invalidateQueries({ queryKey: ['team'] });
      
      // In a real app, you'd send an email here
      console.log("Invitation link:", data.inviteLink);
    },
    onError: (error: Error) => {
      toast.error(`Error inviting team member: ${error.message}`);
    }
  });

  return {
    teamMembers,
    isLoading,
    error,
    inviteTeamMember: inviteTeamMemberMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
  };
}
