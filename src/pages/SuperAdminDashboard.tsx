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
  UserCheck,
  Clock,
} from 'lucide-react';

interface PendingAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

interface ApprovedAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  approved_at: string;
}

export default function SuperAdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [pendingLoans, setPendingLoans] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [approvedAdmins, setApprovedAdmins] = useState<ApprovedAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingAdmin, setProcessingAdmin] = useState<string | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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
      // Get user count from payment_methods table
      const { count: userCountData, error: userError } = await supabase
        .from('payment_methods')
        .select('user_id', { count: 'exact', head: true });

      if (!userError) {
        setUserCount(userCountData || 0);
      }

      // Get loan counts
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('status');

      if (!loanError && loanData) {
        setLoanCount(loanData.length);
        setPendingLoans(loanData.filter(loan => loan.status === 'pending').length);
      }

      // Get pending admins - only those with status 'pending'
      const { data: pendingAdminData, error: pendingAdminError } = await supabase
        .from('admin_users')
        .select('id, email, first_name, last_name, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingAdminError) {
        console.error('Error loading pending admins:', pendingAdminError);
      } else {
        console.log('Loaded pending admins:', pendingAdminData);
        setPendingAdmins(pendingAdminData || []);
      }

      // Get approved admins - only those with status 'approved'
      const { data: approvedAdminData, error: approvedAdminError } = await supabase
        .from('admin_users')
        .select('id, email, first_name, last_name, status, approved_at')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });

      if (approvedAdminError) {
        console.error('Error loading approved admins:', approvedAdminError);
      } else {
        console.log('Loaded approved admins:', approvedAdminData);
        setApprovedAdmins(approvedAdminData || []);
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
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
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
              disabled={isRefreshing || isLoading}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
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
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : pendingLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Admins</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : approvedAdmins.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active admin accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Admin Registrations Section - now just a read-only list */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Pending Admin Registrations ({pendingAdmins.length})
            </h3>
            {isLoading && pendingAdmins.length === 0 ? (
              <div className="text-center py-4">Loading pending admins...</div>
            ) : !isLoading && pendingAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending admin registrations</p>
                <p className="text-sm mt-2">New admin registrations will appear here for approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{admin.first_name} {admin.last_name}</h4>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            Registered: {formatDate(admin.created_at)}
                          </p>
                        </div>
                        <span className="inline-flex mt-2 sm:mt-0">
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">Pending</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approved Admins Management Section - now read-only */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-500" />
              Approved Admin Accounts ({approvedAdmins.length})
            </h3>
            {isLoading && approvedAdmins.length === 0 ? (
              <div className="text-center py-4">Loading approved admins...</div>
            ) : !isLoading && approvedAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No approved admin accounts</p>
                <p className="text-sm mt-2">Approved admin accounts will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedAdmins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{admin.first_name} {admin.last_name}</h4>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            Approved: {formatDate(admin.approved_at)}
                          </p>
                        </div>
                        <span className="inline-flex mt-2 sm:mt-0">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Approved</span>
                        </span>
                      </div>
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
