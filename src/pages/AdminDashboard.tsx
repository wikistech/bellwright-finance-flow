
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, LogOut, CreditCard, Home } from 'lucide-react';

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [pendingLoans, setPendingLoans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication first
    const checkAuthAndLoadData = async () => {
      const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
      console.log('Checking auth on AdminDashboard mount:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        navigate('/admin/login', { replace: true });
        return;
      }
      
      console.log('Authenticated, loading dashboard data');
      setIsCheckingAuth(false);
      
      // Load dashboard data
      await loadDashboardData();
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading dashboard data...');
      
      // Get user count from verification_codes table (proxy for users)
      const { count: userCountData, error: userError } = await supabase
        .from('verification_codes')
        .select('user_id', { count: 'exact', head: true });
      
      if (!userError && userCountData !== null) {
        setUserCount(userCountData);
        console.log('User count loaded:', userCountData);
      }
      
      // Get loan counts
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('status');
      
      if (!loanError && loanData) {
        setLoanCount(loanData.length);
        setPendingLoans(loanData.filter(loan => loan.status === 'pending').length);
        console.log('Loan data loaded:', { total: loanData.length, pending: pendingLoans });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    console.log('Admin signing out');
    sessionStorage.removeItem('admin_authenticated');
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
    navigate('/', { replace: true }); // Navigate to landing page
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-finance-primary">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-finance-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Main Site
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Overview</h2>
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
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="outline">
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/loans">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Loan Applications
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
