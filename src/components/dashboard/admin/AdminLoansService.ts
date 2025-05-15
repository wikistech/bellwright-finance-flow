
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LoanApplication {
  id: string;
  user_id: string;
  loanType: string;
  amount: number;
  term: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export const handleApproveLoan = async (loanId: string, loans: LoanApplication[], setLoans: React.Dispatch<React.SetStateAction<LoanApplication[]>>) => {
  try {
    const { error } = await supabase
      .from('loan_applications')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId);
    
    if (error) throw error;
    
    // Update the local state
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'approved' } 
        : loan
    ));
    
    toast({
      title: "Loan Approved",
      description: "The loan application has been approved successfully.",
    });
  } catch (error: any) {
    console.error("Error approving loan:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to approve the loan. Please try again.",
    });
  }
};

export const handleRejectLoan = async (loanId: string, loans: LoanApplication[], setLoans: React.Dispatch<React.SetStateAction<LoanApplication[]>>) => {
  try {
    const { error } = await supabase
      .from('loan_applications')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId);
    
    if (error) throw error;
    
    // Update the local state
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'rejected' } 
        : loan
    ));
    
    toast({
      title: "Loan Rejected",
      description: "The loan application has been rejected.",
    });
  } catch (error: any) {
    console.error("Error rejecting loan:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to reject the loan. Please try again.",
    });
  }
};
