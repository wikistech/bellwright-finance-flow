
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsCheckingAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('status')
          .eq('email', user.email)
          .single();
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminStatus(null);
        } else if (data) {
          setAdminStatus(data.status);
          setIsAdmin(data.status === 'approved');
          
          if (data.status === 'pending') {
            toast({
              title: "Account Pending Approval",
              description: "Your admin account is pending approval by a superadmin.",
              variant: "default"
            });
          } else if (data.status === 'rejected') {
            toast({
              title: "Account Access Denied",
              description: "Your admin account request has been rejected.",
              variant: "destructive"
            });
          }
        } else {
          setIsAdmin(false);
          setAdminStatus(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminStatus(null);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    if (user) {
      checkAdminStatus();
    } else {
      setIsCheckingAdmin(false);
    }
  }, [user, toast]);
  
  if (isLoading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to admin login if not logged in
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!isAdmin) {
    // User is logged in but not an approved admin
    if (adminStatus === 'pending') {
      toast({
        title: "Access Pending",
        description: "Your admin account is awaiting approval from a superadmin.",
        variant: "default"
      });
    } else if (adminStatus === 'rejected') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your admin account has been rejected.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area.",
      });
    }
    return <Navigate to="/admin/login" replace />;
  }
  
  // User is logged in and is an approved admin
  return <Outlet />;
};

export default AdminRoute;
