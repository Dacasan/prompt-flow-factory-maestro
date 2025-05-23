
import { supabase } from "@/integrations/supabase/client";
import type { Client, ClientFormData } from "../types";

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Client[];
}

export async function createClient(clientData: Omit<ClientFormData, "password">) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || null,
      address: clientData.address || null,
      logo_url: clientData.logo_url || null,
      stripe_customer_id: null
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Client;
}

export async function updateClient(id: string, clientData: Omit<ClientFormData, "password">) {
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || null,
      address: clientData.address || null,
      logo_url: clientData.logo_url || null,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Client;
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) throw error;
  
  return { success: true, message: "Magic link sent successfully" };
}

export async function createUserAccount(email: string, password: string, metadata: object) {
  // Create user directly with signUp
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}
