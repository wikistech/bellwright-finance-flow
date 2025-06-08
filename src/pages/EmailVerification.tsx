import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useRegistration } from '@/contexts/RegistrationContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function EmailVerification() {
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registrationData, updateRegistrationData } = useRegistration();
  
  // Automatically verify when all 5 digits are entered
  useEffect(() => {
    if (code.length === 5) {
      handleVerify();
    }
  }, [code]);
  
  // Check for verification code on mount
  useEffect(() => {
    if (!registrationData.email) {
      return;
    }
    
    // If no verification code in context, attempt to load from database
    if (!registrationData.verificationCode) {
      const loadVerificationCode = async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            const { data: codeData, error } = await supabase
              .from('verification_codes')
              .select('code')
              .eq('user_id', userData.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (error) throw error;
            
            if (codeData) {
              updateRegistrationData({ verificationCode: codeData.code });
            } else {
              // No code found, generate and send a new one
              await handleResendCode();
            }
          }
        } catch (error) {
          console.error("Error loading verification code:", error);
          // Generate and send a new code if loading fails
          handleResendCode();
        }
      };
      
      loadVerificationCode();
    }
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Generate a new code when timer expires
          handleResendCode();
          return 5 * 60; // Reset to 5 minutes
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [registrationData.email, registrationData.verificationCode, updateRegistrationData]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // If no email in context, redirect to register
  if (!registrationData.email) {
    return <Navigate to="/register" replace />;
  }
  
  // If already verified, redirect to payment setup
  if (registrationData.isVerified) {
    return <Navigate to="/payment-setup" replace />;
  }
  
  const handleVerify = async () => {
    if (code.length !== 5) return;
    setIsSubmitting(true);
    
    try {
      // Validate code against what's in context
      if (code === registrationData.verificationCode) {
        // Mark verification code as verified in database
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          const { error } = await supabase
            .from('verification_codes')
            .update({ verified: true })
            .eq('user_id', userData.user.id)
            .eq('code', code);
          
          if (error) throw error;
        }
        
        // Update registration context
        updateRegistrationData({ isVerified: true });
        
        toast({
          title: "Verification Successful",
          description: "Your email has been verified successfully.",
        });
        
        // Navigate to payment setup
        navigate('/payment-setup');
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
        });
        setCode("");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      // Generate new code - simple 5 digit code
      const newCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Update in database
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const { error } = await supabase
          .from('verification_codes')
          .insert([
            { 
              user_id: userData.user.id, 
              code: newCode,
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            }
          ]);
        
        if (error) throw error;
      }
      
      // Update in context
      updateRegistrationData({ verificationCode: newCode });
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been generated.",
      });
      
      // Reset timer
      setTimeLeft(5 * 60);
    } catch (error: any) {
      console.error("Error resending code:", error);
      toast({
        variant: "destructive",
        title: "Failed to Resend Code",
        description: error.message || "There was an error generating a new verification code. Please try again.",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-4 left-4 text-gray-600 hover:text-finance-primary transition-colors">
        <span className="flex items-center">
          <ArrowRight className="mr-1 rotate-180" />
          Back to Home
        </span>
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Bellwright Finance</h1>
          <p className="text-gray-600 mt-2">Verify your email address</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Mail className="h-6 w-6 text-finance-primary" />
              Email Verification
            </CardTitle>
            <CardDescription className="text-center">
              Please enter the 5-digit verification code sent to {registrationData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Code expires in: {formatTime(timeLeft)}</span>
                </div>
                
                <div className="my-4 p-4 border rounded-md border-amber-200 bg-amber-50 w-full">
                  <p className="text-sm flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    Please check your inbox and spam folder for the verification email
                  </p>
                </div>

                <InputOTP
                  maxLength={5}
                  value={code}
                  onChange={setCode}
                  pattern="^[0-9]{1,5}$"
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} index={index} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleVerify}
                  className="w-full bg-finance-primary hover:bg-finance-secondary"
                  disabled={code.length !== 5 || isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-finance-primary"
                    onClick={handleResendCode}
                    disabled={timeLeft > 4 * 60} // Disable for first minute
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
