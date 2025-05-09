
import { supabase } from "@/integrations/supabase/client";

export type LoanApplication = {
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
  status?: 'pending' | 'approved' | 'rejected';
};

export const submitLoanApplication = async (loanData: LoanApplication) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('loan_applications')
      .insert([
        {
          ...loanData,
          user_id: userData.user?.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error submitting loan application:", error);
    throw error;
  }
};

export const getLoanApplications = async () => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    return [];
  }
};

export const getUserLoanApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user loan applications:", error);
    return [];
  }
};
