'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

type User = { email: string; profile?: any } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>(null!);

export const useAuth = () => useContext(AuthContext);

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  async function syncUserToBackend() {
    if (!clerkUser || !isSignedIn) return;
    
    try {
      const sessionToken = await getToken();
      if (!sessionToken) return;

      // Sync user to backend
      const response = await fetch(`${BASE}/api/auth/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          clerkUserId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress
        }),
      });
      
      if (!response.ok) {
        // Backend sync not available, continuing with client-only auth
      }
    } catch (err) {
      // Silently fail - backend is optional for client-side functionality
      // Backend not available
    }
  }

  async function refreshMe() {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const sessionToken = await getToken();
      if (!sessionToken) return;

      setToken(sessionToken);

      const r = await fetch(`${BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      
      if (!r.ok) {
        // Use Clerk user data as fallback
        setUser({ 
          email: clerkUser.primaryEmailAddress?.emailAddress || '', 
          profile: {} 
        });
        return;
      }
      
      const me = await r.json();
      if (me?.email) {
        setUser({ email: me.email, profile: me.profile || {} });
      }
    } catch (err) {
      // Use Clerk user data as fallback when backend is unavailable
      // Backend not available, using Clerk user data
      if (clerkUser.primaryEmailAddress?.emailAddress) {
        setUser({ 
          email: clerkUser.primaryEmailAddress.emailAddress, 
          profile: {} 
        });
      }
      setUser(null);
    }
  }

  function logout() {
    signOut();
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      syncUserToBackend().then(() => refreshMe());
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      setToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  const value: AuthCtx = { user, token, isLoaded, isSignedIn, logout, refreshMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
