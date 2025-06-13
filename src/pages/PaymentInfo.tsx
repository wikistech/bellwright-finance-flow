import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CreditCard, Building, MapPin, Phone } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentInfo() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from navigation state
  const { userId, userEmail, firstName, lastName } = location.state || {};

  useEffect(() => {
    // If no user data, redirect to register
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Registration Required",
        description: "Please complete registration first.",
      });
      navigate('/register');
    }
  }, [userId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User information missing. Please register again.",
      });
      navigate('/register');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Saving payment information for user:', userId);
      
      // Verify user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('You must be logged in to save payment information. Please log in and try again.');
      }
      
      if (user.id !== userId) {
        console.error('User ID mismatch:', { authUserId: user.id, expectedUserId: userId });
        throw new Error('Authentication error. Please log in again.');
      }
      
      // Save payment method for the authenticated user
      const { error: paymentError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id, // Use the authenticated user's ID
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv,
          cardholder_name: cardholderName,
          payment_pin: paymentPin,
          bank_name: bankName,
          account_number: accountNumber,
          routing_number: routingNumber,
          address: address,
          city: city,
          state: state,
          zip_code: zipCode,
          phone_number: phoneNumber,
          is_default: true
        });

      if (paymentError) {
        console.error('Payment method error:', paymentError);
        throw new Error('Failed to save payment information: ' + paymentError.message);
      }

      console.log('Payment method saved successfully');

      toast({
        title: "Registration Complete!",
        description: "Your account and payment information have been saved successfully. You can now log in.",
      });

      // Redirect to login
      navigate('/login');

    } catch (error: any) {
      console.error('Payment info error:', error);
      toast({
        variant: "destructive",
        title: "Payment Information Error",
        description: error.message || "Failed to save payment information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Complete Your Registration</h1>
          <p className="text-gray-600 mt-2">Add your payment and contact information</p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-1">Account: {userEmail}</p>
          )}
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CreditCard className="h-6 w-6" />
              Payment Information
            </CardTitle>
            <CardDescription className="text-center">
              Secure payment and banking details for your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Card Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Smith"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="paymentPin">Payment PIN</Label>
                    <Input
                      id="paymentPin"
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      value={paymentPin}
                      onChange={(e) => setPaymentPin(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Banking Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="Chase Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      placeholder="021000021"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-finance-primary hover:bg-finance-secondary" 
                disabled={isLoading}
              >
                {isLoading ? "Saving Information..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
