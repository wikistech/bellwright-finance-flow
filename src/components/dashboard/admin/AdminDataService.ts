
import { supabase } from "@/integrations/supabase/client";

interface DataLoadResult<T> {
  data: T[];
  error: Error | null;
}

export async function loadUserProfiles(): Promise<DataLoadResult<any>> {
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return { data: [], error: authError };
    }
    
    // Format the user data
    const userProfiles = (authUsers?.users || []).map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name
    }));
    
    return { data: userProfiles, error: null };
  } catch (error: any) {
    console.error("Error loading users:", error);
    return { data: [], error };
  }
}

export async function loadLoanApplications(): Promise<DataLoadResult<any>> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (error: any) {
    console.error("Error loading loans:", error);
    return { data: [], error };
  }
}

export async function loadPaymentMethods(): Promise<DataLoadResult<any>> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (error: any) {
    console.error("Error loading payments:", error);
    return { data: [], error };
  }
}
