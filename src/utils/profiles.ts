
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  updated_at?: string; // Make updated_at optional
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error; // Throw the error to handle it in the component
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};
