
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Referrals = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Not Available</h1>
          <p className="text-muted-foreground mt-2">
            The referrals feature has been disabled. Please contact support for more information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Referrals Temporarily Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is currently being updated. Please check back later or contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Referrals;
