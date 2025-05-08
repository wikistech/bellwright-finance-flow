
import Layout from '@/components/layout/Layout';
import PaymentForm from '@/components/forms/PaymentForm';

const Payments = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">
            Make a secure payment to your account or pay off your loans.
          </p>
        </div>
        
        <PaymentForm />
      </div>
    </Layout>
  );
};

export default Payments;
