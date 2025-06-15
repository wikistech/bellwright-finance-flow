
import { supabase } from '@/integrations/supabase/client';

export const handleApprovePayment = async (paymentId: string, transactions: any[], setTransactions: (transactions: any[]) => void, toast: any) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    setTransactions(transactions.map(t => t.id === paymentId ? data : t));
    toast({ title: "Payment Approved", description: "The payment has been marked as completed." });
  } catch (error: any) {
    console.error('Error approving payment:', error);
    toast({ variant: "destructive", title: "Approval Failed", description: error.message });
  }
};

export const handleRejectPayment = async (paymentId: string, transactions: any[], setTransactions: (transactions: any[]) => void, toast: any) => {
    try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    setTransactions(transactions.map(t => t.id === paymentId ? data : t));
    toast({ title: "Payment Rejected", description: "The payment has been marked as failed." });
  } catch (error: any) {
    console.error('Error rejecting payment:', error);
    toast({ variant: "destructive", title: "Rejection Failed", description: error.message });
  }
};
