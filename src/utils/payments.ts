
import { supabase } from "@/integrations/supabase/client";

export type PaymentData = {
  amount: number;
  cardholderName: string;
  cardNumber: string; // We'll store a masked version
  paymentType: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
};

export const submitPayment = async (paymentData: PaymentData) => {
  try {
    // Mask the card number for security
    const maskedCardNumber = maskCardNumber(paymentData.cardNumber);
    
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error("User must be logged in to submit a payment");
    }
    
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          ...paymentData,
          cardNumber: maskedCardNumber,
          user_id: userData.user.id,
          created_at: new Date().toISOString(),
        },
      ])
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error submitting payment:", error);
    throw error;
  }
};

// Helper to mask card number for security
function maskCardNumber(cardNumber: string): string {
  // Remove spaces
  const cleaned = cardNumber.replace(/\D/g, '');
  // Keep first 4 and last 4 digits, mask the rest
  return cleaned.substring(0, 4) + 
         '*'.repeat(cleaned.length - 8) + 
         cleaned.substring(cleaned.length - 4);
}
