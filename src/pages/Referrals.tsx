
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Referrals = () => {
  const { toast } = useToast();
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://bellwright-finance.com/refer?id=USER123');
    toast({
      title: "Link Copied",
      description: "Referral link has been copied to clipboard",
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground mt-2">
            Earn rewards by referring friends and family to Bellwright Finance.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-finance-primary to-finance-accent text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Reward Program</CardTitle>
            <CardDescription className="text-white text-opacity-80">
              Get $50 for each friend who signs up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">$320</div>
            <p className="mt-2 opacity-80">You've earned so far</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full bg-white text-finance-primary hover:bg-gray-100"
              onClick={copyReferralLink}
            >
              Copy Referral Link
            </Button>
          </CardFooter>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">John Smith</CardTitle>
                <CardDescription>Joined May 2, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-finance-primary flex items-center justify-center text-white mr-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">Active Customer</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-right w-full">
                  <div className="text-sm text-muted-foreground">Reward</div>
                  <div className="font-medium text-finance-success">$50.00</div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Referrals;
