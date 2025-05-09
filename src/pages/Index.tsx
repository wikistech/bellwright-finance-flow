
import { useIsMobile } from '@/hooks/use-mobile';
import Layout from '@/components/layout/Layout';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import LoanStatus from '@/components/dashboard/LoanStatus';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Welcome back to your Bellwright Finance dashboard.
          </p>
        </div>
        
        <DashboardCards />
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="w-full">
            <RecentTransactions />
          </div>
          <div className="w-full">
            <LoanStatus />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
