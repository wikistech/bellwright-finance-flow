
import Layout from '@/components/layout/Layout';
import LoanForm from '@/components/forms/LoanForm';

const Loans = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to apply for a new loan with Bellwright Finance.
          </p>
        </div>
        
        <LoanForm />
      </div>
    </Layout>
  );
};

export default Loans;
