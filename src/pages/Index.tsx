
import { useIsMobile } from '@/hooks/use-mobile';
import Layout from '@/components/layout/Layout';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import LoanStatus from '@/components/dashboard/LoanStatus';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const Index = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Admin check could be more sophisticated in a real app
  // This is just a placeholder to demonstrate the concept
  const isAdmin = user?.email?.includes('admin');
  
  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Welcome back to your Bellwright Finance dashboard.
          </p>
        </div>
        
        <UserDashboard />
        
        <DashboardCards />
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="w-full">
            <RecentTransactions />
          </div>
          <div className="w-full">
            <LoanStatus />
          </div>
        </div>
        
        {isAdmin && (
          <>
            <Separator className="my-6" />
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <AdminDashboard />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
