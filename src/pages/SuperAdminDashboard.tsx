
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, FileText, LogOut, CreditCard, Home, 
  UserCheck, UserX, Shield, AlertTriangle, Trash2, Search
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as superadmin
    const superAdminSession = sessionStorage.getItem('superadmin_authenticated');
    const superAdminEmail = sessionStorage.getItem('superadmin_email');
    
    if (superAdminSession !== 'true' || superAdminEmail !== 'wikistech07@gmail.com') {
      navigate('/superadmin/login');
      return;
    }
    
    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  useEffect(() => {
    // Filter admins based on search query
    if (searchQuery.trim() === '') {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter(admin => {
        const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.toLowerCase();
        const email = admin.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);
  
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
        setFilteredAdmins(adminData);
        setAdminCount(adminData.length);
        setPendingAdmins(adminData.filter(admin => admin.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = () => {
    // Clear superadmin session
    sessionStorage.removeItem('superadmin_authenticated');
    sessionStorage.removeItem('superadmin_email');
    
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
    navigate('/superadmin/login');
  };
  
  const handleApproveAdmin = async (adminId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'superadmin'
        })
        .eq('id', adminId);
      
      if (error) throw error;
      
      toast({
        title: 'Admin Approved',
        description: 'Admin account has been approved successfully.',
      });
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error approving admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve admin account.',
      });
    }
  };
  
  const handleRejectAdmin = async (adminId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', adminId);
      
      if (error) throw error;
      
      toast({
        title: 'Admin Rejected',
        description: 'Admin account has been rejected.',
      });
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject admin account.',
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    try {
      // First delete from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (adminError) throw adminError;

      // Then delete the user from Supabase auth
      const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
      
      // Note: We don't throw on authError as the admin record might not exist in auth
      if (authError) {
        console.warn('Could not delete from auth:', authError);
      }
      
      toast({
        title: 'Admin Deleted',
        description: `Admin account for ${adminEmail} has been permanently deleted.`,
      });
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete admin account.',
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Admin Account Management</h3>
                <p className="text-sm text-gray-500">Approve, reject or delete admin account requests</p>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                Loading admin accounts...
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {searchQuery ? 'No admin accounts found matching your search' : 'No admin accounts found'}
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
                  {filteredAdmins.map((admin) => (
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
                          
                          {/* Delete button for all statuses */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the admin account for {admin.email}. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
