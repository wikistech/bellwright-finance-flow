import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import LoanStatus from '@/components/dashboard/LoanStatus';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ApprovedLoan {
  id: string;
  amount: number;
  loan_type: string;
  status: string;
  approved_at: string;
}

interface UserPayment {
  id: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
}

export default function Index() {
  const { user, isLoading } = useAuth();
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);
  const [userPayments, setUserPayments] = useState<UserPayment[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      console.log('Loading user data for:', user.id);

      const [loansRes, paymentsRes] = await Promise.all([
        supabase.from('loan_applications').select('id, amount, loan_type, status, approved_at').eq('user_id', user.id),
        supabase.from('payments').select('id, amount, payment_type, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      const { data: loans, error: loansError } = loansRes;
      const { data: payments, error: paymentsError } = paymentsRes;

      let approvedLoanTotal = 0;
      if (loansError) {
        console.error('Error loading loans:', loansError);
      } else if (loans) {
        const approved = loans.filter(loan => loan.status === 'approved');
        const pending = loans.filter(loan => loan.status === 'pending');
        
        setApprovedLoans(approved);
        setPendingApplications(pending.length);
        
        approvedLoanTotal = approved.reduce((sum, loan) => sum + Number(loan.amount), 0);
      }

      let approvedDepositsTotal = 0;
      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      } else if (payments) {
        setUserPayments(payments);
        const approvedDeposits = payments.filter(p => p.status === 'completed' && p.payment_type === 'deposit');
        approvedDepositsTotal = approvedDeposits.reduce((sum, p) => sum + Number(p.amount), 0);
      }
      
      const newTotalBalance = approvedLoanTotal + approvedDepositsTotal;
      setTotalBalance(newTotalBalance);
      
      console.log('User dashboard summary:', {
        totalBalance: newTotalBalance,
        approvedLoanTotal,
        approvedDepositsTotal
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-finance-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-finance-primary" />
            <span className="ml-2">Loading your dashboard...</span>
          </div>
        ) : (
          <>
            {/* Dashboard Cards showing real balance */}
            <DashboardCards 
              totalBalance={totalBalance}
              availableCredit={totalBalance > 0 ? totalBalance * 0.8 : 0} // 80% of approved amount available as credit
              pendingApplications={pendingApplications}
            />
            
            {/* Show loan status if user has any loans */}
            {(approvedLoans.length > 0 || pendingApplications > 0) && (
              <LoanStatus />
            )}
            
            {/* Recent transactions - show if user has payments or approved loans */}
            {(totalBalance > 0 || userPayments.length > 0) ? (
              <RecentTransactions />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Bellwright Finance</h3>
                <p className="text-gray-600 mb-4">
                  Your dashboard is ready! Apply for a loan to get started with your financial journey.
                </p>
                <p className="text-sm text-gray-500">
                  Once your loan application is approved by an admin, your balance and available credit will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
