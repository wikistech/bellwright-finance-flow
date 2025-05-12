
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { generateVerificationCode, sendVerificationEmail } from '@/utils/verification';
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
  
  // Generate verification code on mount
  useEffect(() => {
    if (!registrationData.email) {
      return;
    }
    
    if (!registrationData.verificationCode) {
      const newCode = generateVerificationCode();
      updateRegistrationData({ verificationCode: newCode });
      
      // Send verification code to user's email
      sendVerificationEmail(registrationData.email, newCode)
        .then(() => {
          toast({
            title: "Verification Code Sent",
            description: `A verification code has been sent to ${registrationData.email}`,
          });
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Failed to Send Code",
            description: "There was an error sending the verification code. Please try again.",
          });
        });
    }
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Generate a new code when timer expires
          const newCode = generateVerificationCode();
          updateRegistrationData({ verificationCode: newCode });
          sendVerificationEmail(registrationData.email, newCode);
          toast({
            title: "New Code Sent",
            description: "Your verification code has expired. A new code has been sent to your email.",
          });
          return 5 * 60; // Reset to 5 minutes
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [registrationData.email, registrationData.verificationCode, toast, updateRegistrationData]);
  
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
    setIsSubmitting(true);
    
    try {
      if (code === registrationData.verificationCode) {
        // Store verification in Supabase
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          const { error } = await supabase
            .from('verification_codes')
            .insert([
              { 
                user_id: userData.user.id, 
                code: registrationData.verificationCode,
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                verified: true
              }
            ]);
          
          if (error) throw error;
        }
        
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
    } catch (error) {
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
  
  const handleResendCode = () => {
    const newCode = generateVerificationCode();
    updateRegistrationData({ verificationCode: newCode });
    sendVerificationEmail(registrationData.email, newCode)
      .then(() => {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        });
        setTimeLeft(5 * 60); // Reset timer to 5 minutes
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to Resend Code",
          description: "There was an error sending the verification code. Please try again.",
        });
      });
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

                <InputOTP
                  maxLength={5}
                  value={code}
                  onChange={setCode}
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
