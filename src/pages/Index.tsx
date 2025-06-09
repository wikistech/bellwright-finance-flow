
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

export default function Index() {
  const { user, isLoading } = useAuth();
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
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
      // Get approved loans for this user
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('id, amount, loan_type, status, approved_at')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (loansError) {
        console.error('Error loading loans:', loansError);
      } else {
        setApprovedLoans(loans || []);
        
        // Calculate total balance from approved loans
        const total = (loans || []).reduce((sum, loan) => sum + Number(loan.amount), 0);
        setTotalBalance(total);
      }
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
              pendingApplications={0} // Will be calculated from pending loans if needed
            />
            
            {/* Show loan status if user has loans */}
            {approvedLoans.length > 0 && (
              <LoanStatus />
            )}
            
            {/* Recent transactions - only show if user has approved loans */}
            {totalBalance > 0 ? (
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
