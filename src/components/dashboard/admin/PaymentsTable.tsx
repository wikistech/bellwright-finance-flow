
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard } from "lucide-react";

interface PaymentMethod {
  id: string;
  user_id: string;
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  created_at: string;
}

interface PaymentsTableProps {
  payments: PaymentMethod[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cardholder</TableHead>
          <TableHead>Card Number</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Added On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No payment methods found
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.cardholder_name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                  {payment.card_number}
                </div>
              </TableCell>
              <TableCell>{payment.expiry_date}</TableCell>
              <TableCell>
                {new Date(payment.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
