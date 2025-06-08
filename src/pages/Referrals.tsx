
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Gift } from 'lucide-react';

const Referrals = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn rewards together
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-finance-primary/10 rounded-full w-fit">
              <Clock className="h-8 w-8 text-finance-primary" />
            </div>
            <CardTitle className="text-2xl">Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              Our referral program is currently under development. Soon you'll be able to:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-finance-primary mb-2" />
                <h3 className="font-semibold">Invite Friends</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Share your unique referral link
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Gift className="h-6 w-6 text-finance-primary mb-2" />
                <h3 className="font-semibold">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Get bonuses for successful referrals
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-finance-primary mb-2" />
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Monitor your referral activities
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Stay tuned for updates! We'll notify you when the referral program launches.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Referrals;
