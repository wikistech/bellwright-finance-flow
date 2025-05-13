
import { useState, useEffect, useCallback } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Clock, AlertCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useIsMobile } from '@/hooks/use-mobile';

interface VerificationCodeModalProps {
  open: boolean;
  email: string;
  verificationCode: string;
  onOpenChange: (open: boolean) => void;
  onResendCode: () => void;
  onVerifySuccess: () => void;
}

export function VerificationCodeModal({
  open,
  email,
  verificationCode,
  onOpenChange,
  onResendCode,
  onVerifySuccess,
}: VerificationCodeModalProps) {
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Format time as mm:ss
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Automatically verify when all 5 digits are entered
  useEffect(() => {
    if (code.length === 5) {
      handleVerify();
    }
  }, [code]);

  // Handle timer countdown
  useEffect(() => {
    if (!open) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onResendCode();
          toast({
            title: "Verification Code Expired",
            description: "A new code has been sent to your email.",
          });
          return 30 * 60; // Reset to 30 minutes
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onResendCode, toast]);

  // Handle code verification
  const handleVerify = () => {
    if (code.length !== 5) return;
    
    setIsSubmitting(true);
    
    if (code === verificationCode) {
      toast({
        title: "Verification Successful",
        description: "Your email has been verified successfully.",
      });
      setIsSubmitting(false);
      onVerifySuccess();
    } else {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
      });
      setIsSubmitting(false);
      setCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-finance-primary" />
            Email Verification
          </DialogTitle>
          <DialogDescription>
            Please enter the 5-digit verification code sent to {email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Code expires in: {formatTime(timeLeft)}</span>
            </div>

            <div className="my-4 p-4 border rounded-md border-amber-200 bg-amber-50">
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
                onClick={onResendCode}
                disabled={timeLeft > 29 * 60} // Disable for first minute
              >
                Resend Code
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VerificationCodeModal;
