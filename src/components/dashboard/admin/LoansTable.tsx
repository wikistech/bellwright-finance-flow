
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface LoanApplication {
  id: string;
  user_id: string;
  loanType: string;
  amount: number;
  term: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface LoansTableProps {
  loans: LoanApplication[];
  onApprove: (loanId: string) => Promise<void>;
  onReject: (loanId: string) => Promise<void>;
}

export function LoansTable({ loans, onApprove, onReject }: LoansTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No loan applications found
            </TableCell>
          </TableRow>
        ) : (
          loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell>{loan.fullName}</TableCell>
              <TableCell>
                {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
              </TableCell>
              <TableCell>${loan.amount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(loan.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    loan.status === 'approved' 
                      ? 'bg-green-500' 
                      : loan.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }
                >
                  {loan.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                {loan.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center text-green-500 border-green-500 hover:bg-green-50"
                      onClick={() => onApprove(loan.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center text-red-500 border-red-500 hover:bg-red-50"
                      onClick={() => onReject(loan.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {loan.status !== 'pending' && (
                  <span className="text-gray-500 italic">Processed</span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
