
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const SuperAdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isCheckingSuperAdmin, setIsCheckingSuperAdmin] = useState(true);
  const { toast } = useToast();
  
  // Fixed superadmin email
  const SUPERADMIN_EMAIL = 'wikistech07@gmail.com';
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) {
        setIsCheckingSuperAdmin(false);
        return;
      }
      
      try {
        // Check if the logged in user email matches the superadmin email
        const isValidSuperAdmin = user.email === SUPERADMIN_EMAIL;
        setIsSuperAdmin(isValidSuperAdmin);
      } catch (error) {
        console.error('Error checking superadmin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsCheckingSuperAdmin(false);
      }
    };
    
    if (user) {
      checkSuperAdminStatus();
    } else {
      setIsCheckingSuperAdmin(false);
    }
  }, [user]);
  
  if (isLoading || isCheckingSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to superadmin login if not logged in
    return <Navigate to="/superadmin/login" replace />;
  }
  
  if (!isSuperAdmin) {
    // User is logged in but not the superadmin
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have superadmin permissions to access this area.",
    });
    return <Navigate to="/" replace />;
  }
  
  // User is logged in and is the superadmin
  return <Outlet />;
};

export default SuperAdminRoute;
