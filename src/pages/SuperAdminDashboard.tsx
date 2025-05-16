
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, FileText, LogOut, CreditCard, Home, 
  UserCheck, UserX, Shield, AlertTriangle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { approveAdmin, rejectAdmin } = useAuth();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          navigate('/superadmin/login');
          return;
        }
        
        const { data: superadminData, error } = await supabase
          .from('superadmin_users')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        if (error || !superadminData) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have superadmin privileges.',
          });
          navigate('/');
          return;
        }
        
        // Load dashboard data
        loadDashboardData();
      } catch (error) {
        console.error('Superadmin check error:', error);
        navigate('/superadmin/login');
      }
    };
    
    checkSuperAdmin();
  }, [navigate, toast]);
  
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get user count
      const { count: userCountData, error: userError } = await supabase
        .from('verification_codes')
        .select('user_id', { count: 'exact', head: true });
      
      if (!userError) {
        setUserCount(userCountData || 0);
      }
      
      // Get admin data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!adminError && adminData) {
        setAdmins(adminData);
        setAdminCount(adminData.length);
        setPendingAdmins(adminData.filter(admin => admin.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
      });
      navigate('/superadmin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };
  
  const handleApproveAdmin = async (adminId: string) => {
    try {
      await approveAdmin(adminId);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error approving admin:', error);
    }
  };
  
  const handleRejectAdmin = async (adminId: string) => {
    try {
      await rejectAdmin(adminId);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting admin:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:text-gray-200 hover:bg-indigo-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">System Overview</h2>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Main Site
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : userCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Accounts</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : adminCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total admin accounts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{isLoading ? '...' : pendingAdmins}</div>
              <p className="text-xs text-muted-foreground mt-1">Admin accounts awaiting approval</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium">Admin Account Management</h3>
            <p className="text-sm text-gray-500 mb-4">Approve or reject admin account requests</p>
            
            {isLoading ? (
              <div className="py-8 text-center">
                Loading admin accounts...
              </div>
            ) : admins.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No admin accounts found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        {admin.first_name || ''} {admin.last_name || ''}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{formatDate(admin.created_at)}</TableCell>
                      <TableCell>
                        {admin.status === 'pending' && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Pending
                          </Badge>
                        )}
                        {admin.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Approved
                          </Badge>
                        )}
                        {admin.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {admin.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleApproveAdmin(admin.id)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleRejectAdmin(admin.id)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {admin.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectAdmin(admin.id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Revoke Access
                            </Button>
                          )}
                          {admin.status === 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleApproveAdmin(admin.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Grant Access
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
