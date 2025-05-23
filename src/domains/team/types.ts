
export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface InvitationData {
  email: string;
  role: string;
  full_name?: string;
  password?: string;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
  status?: string;
  client_id?: string;
  invited_by?: string;
  inviteLink?: string;
}
