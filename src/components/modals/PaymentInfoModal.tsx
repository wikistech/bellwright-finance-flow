
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Wallet } from 'lucide-react';

const paymentInfoSchema = z.object({
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

type PaymentInfoValues = z.infer<typeof paymentInfoSchema>;

interface PaymentInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PaymentInfoModal({ open, onOpenChange, onSuccess }: PaymentInfoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<PaymentInfoValues>({
    resolver: zodResolver(paymentInfoSchema),
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

  function onSubmit(data: PaymentInfoValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Payment info submitted:', data);
      toast({
        title: "Payment Information Saved",
        description: "Your payment details have been successfully saved.",
      });
      setIsSubmitting(false);
      onOpenChange(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-finance-primary" />
            Payment Information
          </DialogTitle>
          <DialogDescription>
            Please provide your payment details to complete your registration.
            This information is securely stored for future transactions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          {...field}
                          placeholder="1234 5678 9012 3456"
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="pl-10 font-mono"
                        />
                      </div>
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
                      <div className="relative">
                        <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create a 4-6 digit PIN"
                          maxLength={6}
                          className="pl-10 font-mono"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Create a secure PIN (4-6 digits) to authorize future transactions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-finance-primary hover:bg-finance-secondary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Payment Information"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentInfoModal;
