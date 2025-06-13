
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  user_id: string;
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  created_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  cardholder_name: string;
  card_number: string;
  payment_type: string;
  status: string;
  created_at: string;
}

interface PaymentsTableProps {
  payments?: PaymentMethod[];
  transactions?: Payment[];
}

export function PaymentsTable({ payments = [], transactions = [] }: PaymentsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCardNumber = (cardNumber: string) => {
    return `•••• ${cardNumber.slice(-4)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show transactions if available, otherwise show payment methods
  const displayData = transactions.length > 0 ? transactions : [];

  return (
    <div className="space-y-6">
      {transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Transactions</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cardholder</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{transaction.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-semibold">${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.cardholder_name}</TableCell>
                    <TableCell>{formatCardNumber(transaction.card_number)}</TableCell>
                    <TableCell className="capitalize">{transaction.payment_type}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Methods ({payments.length})</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Added</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Cardholder Name</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>{payment.cardholder_name}</TableCell>
                    <TableCell>{formatCardNumber(payment.card_number)}</TableCell>
                    <TableCell>{payment.expiry_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {payments.length === 0 && transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No payment data available</p>
        </div>
      )}
    </div>
  );
}
