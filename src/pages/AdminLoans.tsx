
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Search, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

interface LoanApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  loan_type: string;
  amount: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  purpose: string;
  employment: string;
  income: number;
  address: string;
}

export default function AdminLoans() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          navigate('/admin');
          return;
        }
        
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        if (error || !adminData) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have admin privileges.',
          });
          navigate('/');
          return;
        }
        
        // Load loans data
        loadLoans();
      } catch (error) {
        console.error('Admin check error:', error);
        navigate('/admin');
      }
    };
    
    checkAdmin();
  }, [navigate, toast]);
  
  const loadLoans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setLoans(data || []);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Load Loans',
        description: 'There was an error loading the loan applications.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const viewLoanDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setIsDetailsOpen(true);
  };
  
  const openUpdateStatus = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setNewStatus(loan.status);
    setIsUpdateOpen(true);
  };
  
  const updateLoanStatus = async () => {
    if (!selectedLoan) return;
    
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ 
          status: newStatus,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', selectedLoan.id);
      
      if (error) throw error;
      
      toast({
        title: 'Status Updated',
        description: `The loan application status has been updated to ${newStatus}.`,
      });
      
      // Refresh the loans list
      loadLoans();
      setIsUpdateOpen(false);
      
      // Send notification email to user (would implement in production)
      console.log(`Notification email would be sent to ${selectedLoan.email} about their ${newStatus} loan`);
      
    } catch (error) {
      console.error('Error updating loan status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating the loan status.',
      });
    }
  };
  
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loan_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-finance-primary">Loan Applications</h1>
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
          
          <div className="flex items-center space-x-4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search loans..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading loan applications...
                  </TableCell>
                </TableRow>
              ) : filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No loan applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{loan.full_name}</div>
                        <div className="text-sm text-gray-500">{loan.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{loan.loan_type}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{loan.term} months</TableCell>
                    <TableCell>{formatDate(loan.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewLoanDetails(loan)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button 
                          variant={loan.status === 'pending' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => openUpdateStatus(loan)}
                        >
                          Update
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
      
      {/* Loan Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>
              Reviewing application from {selectedLoan?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{selectedLoan.full_name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{selectedLoan.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{selectedLoan.phone}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Address:</span>
                      <span className="ml-2 font-medium">{selectedLoan.address}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employment & Income</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Employment:</span>
                      <span className="ml-2 font-medium">{selectedLoan.employment}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Annual Income:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedLoan.income)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Loan Details</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Loan Type:</span>
                      <span className="ml-2 font-medium">{selectedLoan.loan_type}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedLoan.amount)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Term:</span>
                      <span className="ml-2 font-medium">{selectedLoan.term} months</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Purpose:</span>
                      <span className="ml-2 font-medium">{selectedLoan.purpose}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Application Date:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedLoan.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Current Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedLoan.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              openUpdateStatus(selectedLoan!);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Loan Status</DialogTitle>
            <DialogDescription>
              Change the status of this loan application
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Current Status:</span>
              <div>
                {selectedLoan && getStatusBadge(selectedLoan.status)}
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">New Status:</span>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as 'pending' | 'approved' | 'rejected')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateLoanStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
