
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { submitPayment } from '@/utils/payments';

const paymentFormSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: 'Must be a valid number' })
    .refine((val) => Number(val) > 0, { message: 'Amount must be greater than 0' }),
  paymentMethod: z
    .string()
    .optional()
    .nullable(),
  cardholderName: z
    .string()
    .optional()
    .nullable(),
  cardNumber: z
    .string()
    .optional()
    .nullable(),
  expiryDate: z
    .string()
    .optional()
    .nullable(),
  cvv: z
    .string()
    .optional()
    .nullable(),
  paymentPin: z
    .string()
    .min(4, { message: 'Payment PIN must be at least 4 digits' })
    .max(6, { message: 'Payment PIN cannot exceed 6 digits' })
    .refine((val) => /^[0-9]+$/.test(val), { message: 'Payment PIN must contain only digits' }),
  paymentType: z
    .string()
    .default("loan"),
  description: z
    .string()
    .optional()
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  savedMethods?: any[];
}

export function PaymentForm({ savedMethods = [] }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSavedMethod, setUseSavedMethod] = useState(savedMethods.length > 0);
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      paymentMethod: savedMethods.length > 0 ? savedMethods[0]?.id : undefined,
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentPin: '',
      paymentType: 'loan',
      description: 'Loan payment'
    },
  });

  // Update form when saved methods change
  useEffect(() => {
    if (savedMethods.length > 0 && !form.getValues('paymentMethod')) {
      form.setValue('paymentMethod', savedMethods[0]?.id);
      setUseSavedMethod(true);
    }
  }, [savedMethods, form]);

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

  const togglePaymentMethod = (value: string) => {
    setUseSavedMethod(value === 'saved');
    if (value === 'saved' && savedMethods.length > 0) {
      form.setValue('paymentMethod', savedMethods[0]?.id);
    } else {
      form.setValue('paymentMethod', undefined);
    }
  };

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);
    
    try {
      // Process payment
      const paymentData = {
        amount: Number(data.amount),
        cardholderName: useSavedMethod ? 
          savedMethods.find(m => m.id === data.paymentMethod)?.cardholder_name : 
          data.cardholderName || '',
        cardNumber: useSavedMethod ? 
          savedMethods.find(m => m.id === data.paymentMethod)?.card_number : 
          data.cardNumber || '',
        paymentType: data.paymentType || 'loan',
        description: data.description,
        status: 'completed' as 'pending' | 'completed' | 'failed'
      };
      
      await submitPayment(paymentData);
      
      toast({
        title: "Payment Successful",
        description: `$${data.amount} has been successfully processed.`,
      });
      
      form.reset({
        amount: '',
        paymentMethod: savedMethods.length > 0 ? savedMethods[0]?.id : undefined,
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        paymentPin: '',
        paymentType: 'loan',
        description: 'Loan payment'
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="loan">Loan Payment</SelectItem>
                      <SelectItem value="deposit">Account Deposit</SelectItem>
                      <SelectItem value="fee">Service Fee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {savedMethods.length > 0 && (
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={useSavedMethod ? "default" : "outline"}
                    onClick={() => togglePaymentMethod('saved')}
                    className="flex-1"
                  >
                    Use Saved Card
                  </Button>
                  <Button
                    type="button"
                    variant={!useSavedMethod ? "default" : "outline"}
                    onClick={() => togglePaymentMethod('new')}
                    className="flex-1"
                  >
                    Use New Card
                  </Button>
                </div>

                {useSavedMethod && (
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Card</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a card" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {savedMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                •••• {method.card_number.slice(-4)} - {method.cardholder_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
            
            {(!useSavedMethod || savedMethods.length === 0) && (
              <>
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
              </>
            )}
            
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
