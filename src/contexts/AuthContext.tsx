
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "../domains/auth/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // This will be replaced with Supabase authentication once integrated
  const { isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      // Mock authentication for now
      // This will be replaced with actual Supabase auth
      console.log("Fetching user session...");
      return null;
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const signOut = async () => {
    // Will be implemented with Supabase
    setUser(null);
  };

  // Value to be provided by the context
  const value = {
    user,
    isLoading,
    error,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
