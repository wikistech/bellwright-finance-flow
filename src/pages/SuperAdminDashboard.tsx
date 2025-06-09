
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileText, 
  LogOut, 
  CreditCard, 
  Home, 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface PendingAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [pendingLoans, setPendingLoans] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is superadmin via session storage (since this uses hardcoded credentials)
    const isSuperAdmin = sessionStorage.getItem('superadmin_authenticated') === 'true';
    
    if (!isSuperAdmin) {
      navigate('/superadmin/login');
      return;
    }
    
    loadDashboardData();
  }, [navigate]);
  
  const loadDashboardData = async () => {
    setIsLoading(true);
    console.log('Loading SuperAdmin dashboard data...');
    
    try {
      // Get user count
      const { count: userCountData, error: userError } = await supabase
        .from('verification_codes')
        .select('user_id', { count: 'exact', head: true });
      
      if (!userError) {
        setUserCount(userCountData || 0);
        console.log('User count loaded:', userCountData);
      } else {
        console.error('Error loading user count:', userError);
      }
      
      // Get loan counts
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('status');
      
      if (!loanError && loanData) {
        setLoanCount(loanData.length);
        setPendingLoans(loanData.filter(loan => loan.status === 'pending').length);
        console.log('Loan data loaded:', { total: loanData.length, pending: loanData.filter(loan => loan.status === 'pending').length });
      } else {
        console.error('Error loading loan data:', loanError);
      }

      // Get pending admin registrations
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, first_name, last_name, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('Admin data query result:', { adminData, adminError });

      if (!adminError) {
        setPendingAdmins(adminData || []);
        console.log('Pending admins loaded:', adminData?.length || 0);
      } else {
        console.error('Error loading admin data:', adminError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load pending admin registrations.",
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated.",
    });
  };

  const handleApproveAdmin = async (adminId: string) => {
    try {
      console.log('Approving admin:', adminId);
      
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (error) {
        console.error('Error approving admin:', error);
        throw error;
      }

      toast({
        title: 'Admin Approved',
        description: 'The admin account has been approved successfully.',
      });

      // Reload the pending admins list
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error approving admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve admin. Please try again.',
      });
    }
  };

  const handleRejectAdmin = async (adminId: string) => {
    try {
      console.log('Rejecting admin:', adminId);
      
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (error) {
        console.error('Error rejecting admin:', error);
        throw error;
      }

      toast({
        title: 'Admin Rejected',
        description: 'The admin account has been rejected.',
      });

      // Reload the pending admins list
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error rejecting admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject admin. Please try again.',
      });
    }
  };
  
  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('superadmin_authenticated');
      sessionStorage.removeItem('superadmin_email');
      
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-indigo-600">SuperAdmin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
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
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : loanCount}</div>
              <p className="text-xs text-muted-foreground mt-1">All loan applications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : pendingLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">Loans awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Admin Registrations Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Pending Admin Registrations ({pendingAdmins.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4">Loading pending admins...</div>
            ) : pendingAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending admin registrations</p>
                <p className="text-sm mt-2">New admin registrations will appear here for approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{admin.first_name} {admin.last_name}</h4>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            Registered: {formatDate(admin.created_at)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-amber-600 bg-amber-50">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveAdmin(admin.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectAdmin(admin.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
