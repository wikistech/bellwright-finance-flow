
import { supabase } from "@/integrations/supabase/client";

// Interface for loan application data
export interface LoanApplicationData {
  loanType: string;
  amount: number;
  term: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  employment: string;
  income: number;
  purpose: string;
}

// Submit a loan application
export const submitLoanApplication = async (data: LoanApplicationData) => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error("User must be logged in to apply for a loan");
    }
    
    // Submit loan application
    const { error } = await supabase
      .from('loan_applications')
      .insert({
        user_id: userData.user.id,
        loanType: data.loanType,
        amount: data.amount,
        term: data.term,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        employment: data.employment,
        income: data.income,
        purpose: data.purpose,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting loan application:", error);
    throw error;
  }
};

// Get user loan applications
export const getUserLoanApplications = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error("User must be logged in to view loan applications");
    }
    
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching user loan applications:", error);
    throw error;
  }
};

// Get all loan applications (admin only)
export const getAllLoanApplications = async () => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching all loan applications:", error);
    throw error;
  }
};
