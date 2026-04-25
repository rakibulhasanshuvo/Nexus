"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // MOCK AUTH: Automatically log in as Admin
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000000',
    app_metadata: {},
    user_metadata: {
      full_name: 'Admin',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;

  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    // let isMounted = true;

    /* AUTH SYSTEM COMMENTED OUT FOR NOW
    // If supabase client is null (missing env vars), just stop loading
    if (!supabase) {
      if (isMounted) setIsLoading(false);
      return;
    }

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });
    */

    return () => {
      // isMounted = false;
      // subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Mock sign out clicked");
    // if (supabase) {
    //   await supabase.auth.signOut();
    // }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
