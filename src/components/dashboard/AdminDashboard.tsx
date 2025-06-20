import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { UsersTable } from "@/components/dashboard/admin/UsersTable";
import { LoansTable } from "@/components/dashboard/admin/LoansTable";
import { PaymentsTable } from "@/components/dashboard/admin/PaymentsTable";
import { AdminTabsNav } from "@/components/dashboard/admin/AdminTabsNav";
import { loadUserProfiles, loadLoanApplications, loadPaymentMethods } from "@/components/dashboard/admin/AdminDataService";
import { handleApproveLoan, handleRejectLoan } from "@/components/dashboard/admin/AdminLoansService";
import { handleApprovePayment, handleRejectPayment } from "@/components/dashboard/admin/AdminPaymentsService";
import { supabase } from "@/integrations/supabase/client";

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

interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  cardholder_name: string;
  card_number: string;
  payment_type: string;
  status: string;
  created_at: string;
  expiry_date?: string | null;
  cvv?: string | null;
  payment_pin?: string | null;
}

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'loans' | 'payments'>('users');
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users data
        const usersResult = await loadUserProfiles();
        if (!usersResult.error) {
          setProfiles(usersResult.data);
        }
        
        // Load loan applications
        const loansResult = await loadLoanApplications();
        if (!loansResult.error) {
          setLoans(loansResult.data);
        }

        // Load payment methods
        const paymentsResult = await loadPaymentMethods();
        if (!paymentsResult.error) {
          setPayments(paymentsResult.data);
        }

        // Load payment transactions
        try {
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

          if (transactionsError) {
            console.error('Error loading transactions:', transactionsError);
          } else {
            setTransactions(transactionsData || []);
            console.log('Loaded transactions:', transactionsData?.length || 0);
          }
        } catch (error) {
          console.error('Error loading payment transactions:', error);
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
  
  const onApprove = (loanId: string) => handleApproveLoan(loanId, loans, setLoans);
  const onReject = (loanId: string) => handleRejectLoan(loanId, loans, setLoans);

  const onApprovePayment = (paymentId: string) => handleApprovePayment(paymentId, transactions, setTransactions, toast);
  const onRejectPayment = (paymentId: string) => handleRejectPayment(paymentId, transactions, setTransactions, toast);
  
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
          <AdminTabsNav activeTab={activeTab} onTabChange={setActiveTab} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeTab === 'users' && <UsersTable profiles={profiles} />}
        {activeTab === 'loans' && <LoansTable loans={loans} onApprove={onApprove} onReject={onReject} />}
        {activeTab === 'payments' && <PaymentsTable payments={payments} transactions={transactions} onApprove={onApprovePayment} onReject={onRejectPayment} />}
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
