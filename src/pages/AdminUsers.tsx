
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Search, UserCheck, UserX } from 'lucide-react';

interface UserWithVerification {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_verified: boolean;
  full_name: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithVerification[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
        const fullName = user.full_name.toLowerCase();
        const email = user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Get all verified codes to check verification status
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_codes')
        .select('user_id, verified');
      
      if (verificationError) throw verificationError;
      
      // Create a map of user_id to verification status
      const verificationMap = new Map();
      verificationData?.forEach(entry => {
        if (entry.verified) {
          verificationMap.set(entry.user_id, true);
        }
      });
      
      // Get all auth users (need to use auth admin API in production)
      const { data: userData, error: userError } = await supabase
        .from('verification_codes')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });
      
      if (userError) throw userError;
      
      // Get emails for these users from payment_methods or other tables
      const uniqueUserIds = [...new Set(userData?.map(u => u.user_id) || [])];
      
      const userProfiles: UserWithVerification[] = uniqueUserIds.map(id => {
        const created = userData?.find(u => u.user_id === id)?.created_at || new Date().toISOString();
        return {
          id,
          email: `user_${id.substring(0, 8)}@example.com`,
          created_at: created,
          last_sign_in_at: null,
          is_verified: verificationMap.get(id) || false,
          full_name: `User ${id.substring(0, 8)}`
        };
      });
      
      // Fill in real emails and names where available
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('user_id, cardholder_name');
      
      if (!paymentError && paymentData) {
        paymentData.forEach(payment => {
          const user = userProfiles.find(u => u.id === payment.user_id);
          if (user) {
            user.email = `${payment.cardholder_name.toLowerCase().replace(' ', '.')}@example.com`;
            user.full_name = payment.cardholder_name;
          }
        });
      }
      
      // Get loan application emails and names
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('user_id, email, full_name');
      
      if (!loanError && loanData) {
        loanData.forEach(loan => {
          const user = userProfiles.find(u => u.id === loan.user_id);
          if (user) {
            user.email = loan.email;
            user.full_name = loan.full_name;
          }
        });
      }
      
      setUsers(userProfiles);
      setFilteredUsers(userProfiles);
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
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
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
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
