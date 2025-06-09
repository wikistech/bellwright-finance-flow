
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Search, UserCheck, UserX, Eye, CreditCard } from 'lucide-react';

interface UserWithDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_verified: boolean;
  loan_applications?: any[];
  payment_methods?: any[];
  payment_history?: any[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          navigate('/admin/login');
          return;
        }
        
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', userData.user.id)
          .eq('status', 'approved')
          .single();
        
        if (error || !adminData) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have admin privileges.',
          });
          navigate('/admin/login');
          return;
        }
        
        // Load users data
        loadUsers();
      } catch (error) {
        console.error('Admin check error:', error);
        navigate('/admin/login');
      }
    };
    
    checkAdmin();
  }, [navigate, toast]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = user.full_name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Get all loan applications to find unique users
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('user_id, email, full_name, created_at')
        .order('created_at', { ascending: false });
      
      if (loanError) throw loanError;
      
      // Get verification status
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_codes')
        .select('user_id, verified');
      
      if (verificationError) throw verificationError;
      
      // Create verification map
      const verificationMap = new Map();
      verificationData?.forEach(entry => {
        if (entry.verified) {
          verificationMap.set(entry.user_id, true);
        }
      });
      
      // Create unique users map
      const usersMap = new Map<string, UserWithDetails>();
      
      loanData?.forEach(loan => {
        if (!usersMap.has(loan.user_id)) {
          usersMap.set(loan.user_id, {
            id: loan.user_id,
            email: loan.email,
            full_name: loan.full_name,
            created_at: loan.created_at,
            is_verified: verificationMap.get(loan.user_id) || false,
          });
        }
      });
      
      const uniqueUsers = Array.from(usersMap.values());
      setUsers(uniqueUsers);
      setFilteredUsers(uniqueUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Load Users',
        description: 'There was an error loading the user list.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      // Load loan applications
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Load payment methods
      const { data: paymentMethods, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId);

      // Load payment history
      const { data: paymentHistory, error: historyError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          loan_applications: loanData || [],
          payment_methods: paymentMethods || [],
          payment_history: paymentHistory || []
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const viewUserDetails = async (user: UserWithDetails) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    await loadUserDetails(user.id);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-finance-primary">User Management</h1>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button asChild variant="ghost">
            <Link to="/admin/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
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
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-800 bg-amber-50 hover:bg-amber-50">
                          <UserX className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{selectedUser.full_name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedUser.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2">
                        {selectedUser.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-800 bg-amber-50">Unverified</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Applications */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Loan Applications ({selectedUser.loan_applications?.length || 0})</h3>
                {selectedUser.loan_applications && selectedUser.loan_applications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.loan_applications.map((loan) => (
                      <div key={loan.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{loan.loan_type} - {formatCurrency(loan.amount)}</h4>
                            <p className="text-sm text-gray-600">{loan.purpose}</p>
                            <p className="text-xs text-gray-500 mt-1">Applied: {formatDate(loan.created_at)}</p>
                          </div>
                          <Badge className={
                            loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                            loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }>
                            {loan.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No loan applications</p>
                )}
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Payment Methods</h4>
                    {selectedUser.payment_methods && selectedUser.payment_methods.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.payment_methods.map((payment) => (
                          <div key={payment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{payment.cardholder_name}</span>
                              <span className="text-sm text-gray-500">
                                {maskCardNumber(payment.card_number)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Expires: {payment.expiry_date} • Added: {formatDate(payment.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No payment methods on file</p>
                    )}
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Payment History</h4>
                    {selectedUser.payment_history && selectedUser.payment_history.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.payment_history.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{formatCurrency(payment.amount)}</span>
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {payment.description} • {formatDate(payment.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No payment history</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
