
import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  amount: number;
  cardholderName: string;
  cardNumber: string;
  paymentType: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
}

export const submitPayment = async (paymentData: PaymentData) => {
  console.log('Submitting payment:', paymentData);
  
  try {
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      throw new Error('You must be logged in to make a payment');
    }

    console.log('Authenticated user:', user.id);

    // Insert payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: paymentData.amount,
        cardholderName: paymentData.cardholderName,
        cardNumber: paymentData.cardNumber,
        paymentType: paymentData.paymentType,
        description: paymentData.description || 'Payment',
        status: paymentData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Payment insert error:', error);
      throw new Error(`Failed to process payment: ${error.message}`);
    }

    console.log('Payment processed successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Payment submission error:', error);
    throw error;
  }
};
