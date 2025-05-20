
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember, InvitationData, Invitation } from "../types";

export function useTeam() {
  const queryClient = useQueryClient();
  
  const getTeamMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, auth:id(email, last_sign_in_at)')
      .in('role', ['admin', 'admin:member'])
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Cast and transform the data to ensure all required fields are present
    const teamMembers = data?.map(profile => {
      const authData = (profile.auth || {}) as any;
      return {
        ...profile,
        email: authData.email || '',
        last_sign_in_at: authData.last_sign_in_at || null
      };
    }) as TeamMember[];
    
    return teamMembers;
  };

  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers,
  });

  const inviteTeamMember = async (invitationData: InvitationData) => {
    // Create user directly with signUp instead of using admin.generateLink
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: invitationData.email,
      password: invitationData.password || Math.random().toString(36).substring(2, 12),
      options: {
        data: {
          full_name: invitationData.full_name || invitationData.email.split('@')[0],
          role: invitationData.role
        }
      }
    });
    
    if (signupError) {
      throw new Error(signupError.message);
    }
    
    // Generate invitation token
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
    
    // Return the invitation with a link
    return { 
      ...(data as Invitation), 
      inviteLink: `${window.location.origin}/auth?token=${token}`
    };
  };

  const inviteTeamMemberMutation = useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (data) => {
      toast.success(`Team member invited successfully!`);
      queryClient.invalidateQueries({ queryKey: ['team'] });
      
      // In a real app, you'd send an email here
      console.log("Invitation link:", data.inviteLink);
    },
    onError: (error: Error) => {
      toast.error(`Error inviting team member: ${error.message}`);
    }
  });

  // Send magic link to existing user
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
    onError: (error: Error) => {
      toast.error(`Error sending magic link: ${error.message}`);
    }
  });

  return {
    teamMembers,
    isLoading,
    error,
    inviteTeamMember: inviteTeamMemberMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
    sendMagicLink: sendMagicLinkMutation.mutate,
    isSendingMagicLink: sendMagicLinkMutation.isPending
  };
}
