
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
}

interface LoanApplication {
  id: string;
  user_id: string;
  loanType: string;
  amount: number;
  term: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  created_at: string;
}

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'loans' | 'payments'>('users');
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users data
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error loading users:", authError);
          // Still attempt to load other data even if users fail to load
        } else {
          // Format the user data
          const userProfiles: UserProfile[] = (authUsers?.users || []).map(user => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name
          }));
          
          setProfiles(userProfiles);
        }
        
        // Load loan applications
        const { data: loanData, error: loanError } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (loanError) {
          console.error("Error loading loans:", loanError);
        } else {
          setLoans(loanData || []);
        }

        // Load payment methods
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_methods')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (paymentError) {
          console.error("Error loading payments:", paymentError);
        } else {
          setPayments(paymentData || []);
        }
        
      } catch (error: any) {
        console.error("Error in admin dashboard:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin data. You may not have admin permissions.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const handleApprove = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);
      
      if (error) throw error;
      
      // Update the local state
      setLoans(loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, status: 'approved' } 
          : loan
      ));
      
      toast({
        title: "Loan Approved",
        description: "The loan application has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving loan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve the loan. Please try again.",
      });
    }
  };
  
  const handleReject = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);
      
      if (error) throw error;
      
      // Update the local state
      setLoans(loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, status: 'rejected' } 
          : loan
      ));
      
      toast({
        title: "Loan Rejected",
        description: "The loan application has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject the loan. Please try again.",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Admin Dashboard</span>
          <div className="flex space-x-2">
            <Button 
              variant={activeTab === 'users' ? "default" : "outline"} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </Button>
            <Button 
              variant={activeTab === 'loans' ? "default" : "outline"} 
              onClick={() => setActiveTab('loans')}
            >
              Loan Applications
            </Button>
            <Button 
              variant={activeTab === 'payments' ? "default" : "outline"} 
              onClick={() => setActiveTab('payments')}
            >
              Payment Methods
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeTab === 'users' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      {`${profile.first_name || ""} ${profile.last_name || ""}`}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        
        {activeTab === 'loans' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No loan applications found
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.fullName}</TableCell>
                    <TableCell>
                      {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
                    </TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(loan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          loan.status === 'approved' 
                            ? 'bg-green-500' 
                            : loan.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }
                      >
                        {loan.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loan.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center text-green-500 border-green-500 hover:bg-green-50"
                            onClick={() => handleApprove(loan.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleReject(loan.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {loan.status !== 'pending' && (
                        <span className="text-gray-500 italic">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {activeTab === 'payments' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cardholder</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Added On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No payment methods found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.cardholder_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        {payment.card_number}
                      </div>
                    </TableCell>
                    <TableCell>{payment.expiry_date}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
