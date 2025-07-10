import { useState, useCallback } from 'react';

export interface UseAuthResult {
  isAuthenticated: boolean;
  user: any;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const signIn = useCallback(async (provider: string) => {
    // Will be implemented with capacitor-auth-manager
    console.log('Sign in with', provider);
  }, []);

  const signOut = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}