import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType, ROLE_PERMISSIONS, ROLE_DASHBOARDS } from '../types/auth';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    // Try to get additional user data from our users table
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      name: userData?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: (userData?.role || 'admin') as UserRole,
      department: userData?.department || 'Unknown',
      permissions: ROLE_PERMISSIONS[(userData?.role || 'admin') as UserRole] || [],
      isActive: true,
      createdAt: supabaseUser.created_at,
      lastLogin: new Date().toISOString()
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user && mounted) {
          const appUser = await convertSupabaseUser(session.user);
          setUser(appUser);
        }
      } catch (err) {
        console.error('Error in getSession:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const appUser = await convertSupabaseUser(session.user);
          setUser(appUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const appUser = await convertSupabaseUser(data.user);
        setUser(appUser);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      // Create user profile in our users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: 'admin', // default role
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return data;
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    signUp,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility functions for role-based access
export const hasPermission = (user: User | null, resource: string, action: string): boolean => {
  if (!user) return false;
  
  return user.permissions.some(permission => 
    permission.resource === resource && permission.action === action
  );
};

export const canAccessDashboard = (user: User | null, dashboardName: string): boolean => {
  if (!user) return false;
  
  const userDashboards = ROLE_DASHBOARDS[user.role];
  return userDashboards.includes(dashboardName);
};

export const getUserRoleName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'salesman':
      return 'Salesman';
    case 'manager':
      return 'Manager';
    case 'supply_chain':
      return 'Supply Chain';
    default:
      return 'Unknown';
  }
};
