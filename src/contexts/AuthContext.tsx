import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerAdmin: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  registerSuperAdmin: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
  checkIsSuperAdmin: () => Promise<boolean>;
  approveAdmin: (adminId: string) => Promise<void>;
  rejectAdmin: (adminId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back",
            description: "You have successfully signed in.",
          });
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
          navigate('/login');
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
  
  // Clean up auth state helper
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
      });
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "There was an error creating your account.",
      });
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message || "There was an error signing out.",
      });
      throw error;
    }
  };
  
  // Admin registration function
  const registerAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Check if admin email already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
        
      if (existingAdmin) {
        throw new Error('An admin with this email already exists.');
      }
      
      // Sign up the user first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role: 'admin'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Add the user to the admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([{ 
            id: data.user.id,
            email: email.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            status: 'pending'
          }]);
        
        if (adminError) {
          throw adminError;
        }
        
        toast({
          title: "Admin Registration Successful",
          description: "Your admin account has been created. You must be approved by a superadmin before you can log in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "There was an error creating your admin account.",
      });
      throw error;
    }
  };
  
  // New SuperAdmin registration function
  const registerSuperAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Check if superadmin email already exists
      const { data: existingSuperAdmin, error: checkError } = await supabase
        .from('superadmin_users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
        
      if (existingSuperAdmin) {
        throw new Error('A superadmin with this email already exists.');
      }
      
      // Sign up the user first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role: 'superadmin'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Add the user to the superadmin_users table
        const { error: superadminError } = await supabase
          .from('superadmin_users')
          .insert([{ 
            id: data.user.id,
            email: email.toLowerCase(),
            first_name: firstName,
            last_name: lastName
          }]);
        
        if (superadminError) {
          throw superadminError;
        }
        
        toast({
          title: "Superadmin Registration Successful",
          description: "Your superadmin account has been created. You may now log in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "There was an error creating your superadmin account.",
      });
      throw error;
    }
  };
  
  // Check admin status function
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('status')
        .eq('email', user.email)
        .single();
      
      if (error) throw error;
      return data && data.status === 'approved';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };
  
  // New check superadmin status function
  const checkIsSuperAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('superadmin_users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking superadmin status:', error);
      return false;
    }
  };
  
  // New approve admin function
  const approveAdmin = async (adminId: string): Promise<void> => {
    try {
      const isSuperAdmin = await checkIsSuperAdmin();
      
      if (!isSuperAdmin) {
        throw new Error('Only superadmins can approve admin accounts.');
      }
      
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejected_at: null
        })
        .eq('id', adminId);
      
      if (error) throw error;
      
      toast({
        title: "Admin Approved",
        description: "The admin account has been approved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "There was an error approving the admin account.",
      });
      throw error;
    }
  };
  
  // New reject admin function
  const rejectAdmin = async (adminId: string): Promise<void> => {
    try {
      const isSuperAdmin = await checkIsSuperAdmin();
      
      if (!isSuperAdmin) {
        throw new Error('Only superadmins can reject admin accounts.');
      }
      
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'rejected',
          approved_by: user?.id,
          rejected_at: new Date().toISOString(),
          approved_at: null
        })
        .eq('id', adminId);
      
      if (error) throw error;
      
      toast({
        title: "Admin Rejected",
        description: "The admin account has been rejected.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "There was an error rejecting the admin account.",
      });
      throw error;
    }
  };
  
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    registerAdmin,
    registerSuperAdmin,
    checkIsAdmin,
    checkIsSuperAdmin,
    approveAdmin,
    rejectAdmin
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
