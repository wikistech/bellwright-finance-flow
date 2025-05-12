
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PaymentForm from '@/components/forms/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Payments = () => {
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*');

        if (error) throw error;
        setSavedPaymentMethods(data || []);
      } catch (error: any) {
        console.error('Error loading payment methods:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load payment methods',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">
            Make a secure payment to your account or pay off your loans.
          </p>
        </div>

        <Tabs defaultValue="makePayment">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="makePayment">Make Payment</TabsTrigger>
            <TabsTrigger value="savedMethods">Saved Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="makePayment">
            <PaymentForm savedMethods={savedPaymentMethods} />
          </TabsContent>

          <TabsContent value="savedMethods">
            <Card>
              <CardHeader>
                <CardTitle>Saved Payment Methods</CardTitle>
                <CardDescription>
                  Select from your saved payment methods for quick checkout
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-finance-primary" />
                  </div>
                ) : savedPaymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {savedPaymentMethods.map((method) => (
                      <Card key={method.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{method.cardholder_name}</p>
                            <p className="text-sm text-gray-500">
                              •••• {method.card_number.slice(-4)} • Expires {method.expiry_date}
                            </p>
                          </div>
                          {method.is_default && (
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              Default
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No saved payment methods found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Payments;
