
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
        
        if (error) throw error;
        
        // User is an approved admin
        setIsAdmin(data && data.status === 'approved');
        
        if (data && data.status === 'pending') {
          toast({
            title: "Account Pending Approval",
            description: "Your admin account is pending approval by a superadmin.",
            variant: "default"
          });
        } else if (data && data.status === 'rejected') {
          toast({
            title: "Account Access Denied",
            description: "Your admin account request has been rejected.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
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
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to access this area.",
    });
    return <Navigate to="/" replace />;
  }
  
  // User is logged in and is an approved admin
  return <Outlet />;
};

export default AdminRoute;
