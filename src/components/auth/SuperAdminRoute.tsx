
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const SuperAdminRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Fixed superadmin email for validation
  const SUPERADMIN_EMAIL = 'wikistech07@gmail.com';
  
  useEffect(() => {
    // Check if user has valid superadmin session
    const checkSuperAdminAuth = () => {
      const superAdminSession = sessionStorage.getItem('superadmin_authenticated');
      const superAdminEmail = sessionStorage.getItem('superadmin_email');
      
      if (superAdminSession === 'true' && superAdminEmail === SUPERADMIN_EMAIL) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkSuperAdminAuth();
  }, []);
  
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // User is not authenticated as superadmin
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have superadmin permissions to access this area.",
    });
    return <Navigate to="/superadmin/login" replace />;
  }
  
  // User is authenticated as superadmin
  return <Outlet />;
};

export default SuperAdminRoute;
