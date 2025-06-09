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
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { LoanApplicationData, submitLoanApplication } from '@/utils/loans';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const loanFormSchema = z.object({
  loanType: z.string({
    required_error: "Please select a loan type",
  }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), { message: "Must be a valid number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" }),
  term: z.number().min(1).max(60),
  fullName: z.string().min(3, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  address: z.string().min(5, { message: "Address is required" }),
  employment: z.string({
    required_error: "Please select your employment status",
  }),
  income: z
    .string()
    .min(1, { message: "Income is required" })
    .refine((val) => !isNaN(Number(val)), { message: "Must be a valid number" })
    .refine((val) => Number(val) > 0, { message: "Income must be greater than 0" }),
  purpose: z.string().min(10, { message: "Please provide the purpose of your loan" }),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

export function LoanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termValue, setTermValue] = useState(12);
  const [showDepositAlert, setShowDepositAlert] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loanType: "",
      amount: "",
      term: 12,
      fullName: "",
      email: user?.email || "",
      phone: "",
      address: "",
      employment: "",
      income: "",
      purpose: "",
    },
  });

  async function onSubmit(data: LoanFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to apply for a loan.",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert string values to numbers
      const loanData: LoanApplicationData = {
        loanType: data.loanType,
        amount: parseFloat(data.amount),
        term: data.term,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        employment: data.employment,
        income: parseFloat(data.income),
        purpose: data.purpose,
      };
      
      await submitLoanApplication(loanData);
      
      // Show deposit requirement alert
      setShowDepositAlert(true);
      
      toast({
        title: "Loan Application Submitted",
        description: "Your loan application has been received. Please make the required deposit to proceed.",
      });
      
      // Redirect to payment page after a brief delay
      setTimeout(() => {
        navigate('/payments');
      }, 3000);
    } catch (error) {
      console.error("Error submitting loan application:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your loan application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTermChange = (value: number[]) => {
    setTermValue(value[0]);
    form.setValue("term", value[0]);
  };

  if (showDepositAlert) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Deposit Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">
              <strong>Important:</strong> Before your loan can be processed, you must first make a deposit of $15 or more. 
              This deposit serves as a security requirement for loan processing.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              You will now be redirected to the payment page where you can make your deposit. 
              After completing the payment, please wait for admin approval of your loan application.
            </p>
            
            <Button 
              onClick={() => navigate('/payments')} 
              className="w-full bg-finance-primary hover:bg-finance-secondary"
            >
              Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Apply for a Loan</CardTitle>
        <CardDescription>
          Complete the form below to apply for a loan. After submission, you'll need to make a deposit of $15 or more before processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> A minimum deposit of $15 is required after loan application submission for processing to begin.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Loan Details</h3>
              
              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="business">Business Loan</SelectItem>
                        <SelectItem value="mortgage">Mortgage</SelectItem>
                        <SelectItem value="education">Education Loan</SelectItem>
                        <SelectItem value="auto">Auto Loan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount</FormLabel>
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
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (Months): {termValue}</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        min={1}
                        max={60}
                        step={1}
                        value={[termValue]}
                        onValueChange={handleTermChange}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1</span>
                      <span>60</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="john@example.com" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(123) 456-7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St, City, State, Zip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial Information</h3>
              
              <FormField
                control={form.control}
                name="employment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="self_employed">Self-employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
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
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Loan</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Briefly explain why you need this loan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-finance-primary hover:bg-finance-secondary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoanForm;
