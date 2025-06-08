
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const paymentSetupSchema = z.object({
  cardholderName: z
    .string()
    .min(3, { message: 'Cardholder name is required' }),
  cardNumber: z
    .string()
    .min(16, { message: 'Card number must be at least 16 digits' })
    .max(19, { message: 'Card number cannot exceed 19 digits' })
    .refine((val) => /^[0-9\s]+$/.test(val), { message: 'Card number must contain only digits' }),
  expiryDate: z
    .string()
    .refine((val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
      message: 'Expiry date must be in MM/YY format',
    }),
  cvv: z
    .string()
    .min(3, { message: 'CVV must be at least 3 digits' })
    .max(4, { message: 'CVV cannot exceed 4 digits' })
    .refine((val) => /^[0-9]+$/.test(val), { message: 'CVV must contain only digits' }),
  paymentPin: z
    .string()
    .min(4, { message: 'Payment PIN must be at least 4 digits' })
    .max(6, { message: 'Payment PIN cannot exceed 6 digits' })
    .refine((val) => /^[0-9]+$/.test(val), { message: 'Payment PIN must contain only digits' }),
});

type PaymentSetupValues = z.infer<typeof paymentSetupSchema>;

export default function PaymentSetup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const form = useForm<PaymentSetupValues>({
    resolver: zodResolver(paymentSetupSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentPin: '',
    },
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    // Format with spaces every 4 digits
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    form.setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    form.setValue('expiryDate', value);
  };

  const onSubmit = async (data: PaymentSetupValues) => {
    setIsSubmitting(true);
    
    try {
      // Save payment information to database
      const { error } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: user.id,
            cardholder_name: data.cardholderName,
            card_number: data.cardNumber.replace(/\s/g, ''),
            expiry_date: data.expiryDate,
            cvv: data.cvv,
            payment_pin: data.paymentPin,
            is_default: true
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Payment Method Added",
        description: "Your payment information has been successfully saved.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error saving payment information:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save payment information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Payment Setup</h1>
          <p className="text-gray-600 mt-2">
            Add your payment details for future transactions.
          </p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription>
              Add a payment method to your account. This information is securely stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Smith" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="1234 5678 9012 3456"
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="MM/YY"
                            onChange={handleExpiryDateChange}
                            maxLength={5}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="123"
                            maxLength={4}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="paymentPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment PIN</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Set your payment PIN"
                          maxLength={6}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Create a secure PIN (4-6 digits) to authorize future transactions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-finance-primary hover:bg-finance-secondary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Payment Information"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>© 2025 Bellwright Finance. All rights reserved.</p>
        </div>
      </div>
    </motion.div>
  );
}
