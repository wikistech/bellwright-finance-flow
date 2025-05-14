
import { supabase } from "@/integrations/supabase/client";

// Define the Profile type
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
    return null;
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

// Create a profile if it doesn't exist
export const createProfileIfNotExists = async (
  userId: string, 
  firstName: string, 
  lastName: string, 
  email: string
): Promise<boolean> => {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // If profile exists, no need to create
    if (existingProfile) return true;
    
    // Create new profile
    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email
        }
      ]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in createProfileIfNotExists:', error);
    return false;
  }
};
