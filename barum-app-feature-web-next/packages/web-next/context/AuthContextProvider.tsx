'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import supabase from '../lib/supabaseClient';
import SupabaseAuthService, { SignInCredentials, SignUpCredentials } from '../services/SupabaseAuthService';
import { QUERY_GET_ME } from '../api/queries';

// User type
interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  role?: {
    name: string;
    permissions: { name: string }[];
  };
  account?: string;
  permissions?: string[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<any>;
  signUp: (credentials: SignUpCredentials) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Query user data when authenticated
  const { data: userData, refetch: refetchUser } = useQuery(QUERY_GET_ME, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data?.me) {
        const formattedUser = formatUserDetails(data.me);
        setUser(formattedUser);
      }
    },
    onError: (error) => {
      console.error('Error fetching user:', error);
      // If user not found, sign out
      if (error.graphQLErrors?.some((e: any) => e.extensions?.code === 'USER_NOT_FOUND')) {
        handleSignOut();
      }
    },
  });

  const formatUserDetails = (userDetails: any): User | null => {
    if (!userDetails) return null;

    try {
      const {
        avatar,
        email,
        id,
        firstname,
        lastname,
        role,
        account,
      } = userDetails;

      return {
        avatar,
        email,
        id,
        firstname,
        lastname,
        account: account?.id,
        role: role?.name,
        permissions: role?.permissions?.map((permission: any) => permission.name) || [],
      };
    } catch (error) {
      console.error('Error formatting user details:', error);
      return null;
    }
  };

  const signIn = async (credentials: SignInCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have valid Supabase configuration
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Supabase configuration is not set up. Please configure your environment variables.');
      }

      const { session } = await SupabaseAuthService.signInWithPassword(credentials);

      if (!session) {
        throw new Error('No session returned from Supabase');
      }

      setIsAuthenticated(true);
      
      // Refetch user data
      await refetchUser();

      router.push('/dashboard');
      return session;
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const { session } = await SupabaseAuthService.signUp(credentials);

      if (session) {
        setIsAuthenticated(true);
        await refetchUser();
        router.push('/dashboard');
      }

      return session;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await SupabaseAuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Legacy methods for backward compatibility
  const login = async (email: string, password: string) => {
    await signIn({ email, password });
  };

  const logout = () => {
    handleSignOut();
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await SupabaseAuthService.signInWithGoogle();
      // The redirect happens automatically from Supabase
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check auth state on load and setup listener
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);

        // Check if we have valid Supabase configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
          console.warn('Supabase configuration not set up. Using mock authentication.');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Get current session
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setIsAuthenticated(true);
          // User data will be fetched by the useQuery hook
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Only set up auth listener if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);

          if (event === 'SIGNED_IN' && session) {
            setIsAuthenticated(true);
            await refetchUser();
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setUser(null);
          }
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [refetchUser]);

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading: loading,
    signIn,
    signUp,
    signOut: handleSignOut,
    signInWithGoogle,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
};
