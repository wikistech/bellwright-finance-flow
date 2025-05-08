
import Layout from '@/components/layout/Layout';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import LoanStatus from '@/components/dashboard/LoanStatus';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back to your Bellwright Finance dashboard.
          </p>
        </div>
        
        <DashboardCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div className="lg:col-span-1">
            <LoanStatus />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
