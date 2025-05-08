
import { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';

const paymentFormSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: 'Must be a valid number' })
    .refine((val) => Number(val) > 0, { message: 'Amount must be greater than 0' }),
  cardNumber: z
    .string()
    .min(16, { message: 'Card number must be at least 16 digits' })
    .max(19, { message: 'Card number cannot exceed 19 digits' })
    .refine((val) => /^[0-9]+$/.test(val), { message: 'Card number must contain only digits' }),
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
  cardholderName: z
    .string()
    .min(3, { message: 'Cardholder name is required' }),
  paymentPin: z
    .string()
    .min(4, { message: 'Payment PIN must be at least 4 digits' })
    .max(6, { message: 'Payment PIN cannot exceed 6 digits' })
    .refine((val) => /^[0-9]+$/.test(val), { message: 'Payment PIN must contain only digits' }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
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

  function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Payment submitted:', data);
      toast({
        title: "Payment Successful",
        description: `$${data.amount} has been successfully processed.`,
      });
      setIsSubmitting(false);
      form.reset();
    }, 1500);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Make a Payment</CardTitle>
        <CardDescription>
          Make a secure payment to your account or loan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-0 flex h-full items-center text-gray-500">
                      $
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0.00"
                        className="pl-8"
                        type="text"
                        inputMode="decimal"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      placeholder="Enter your payment PIN"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your secure payment PIN to authorize this transaction
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
              {isSubmitting ? "Processing..." : "Make Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default PaymentForm;
