
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  type: "deposit" | "withdrawal" | "payment";
}

const transactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-05-07",
    description: "Deposit from Bank Account",
    amount: 5000.00,
    status: "completed",
    type: "deposit",
  },
  {
    id: "t2",
    date: "2025-05-06",
    description: "Loan Payment",
    amount: -1250.00,
    status: "completed",
    type: "payment",
  },
  {
    id: "t3",
    date: "2025-05-05",
    description: "Referral Bonus",
    amount: 120.00,
    status: "completed",
    type: "deposit",
  },
  {
    id: "t4",
    date: "2025-05-03",
    description: "Withdrawal to Bank Account",
    amount: -2500.00,
    status: "pending",
    type: "withdrawal",
  },
  {
    id: "t5",
    date: "2025-05-01",
    description: "Loan Disbursement",
    amount: 10000.00,
    status: "completed",
    type: "deposit",
  },
];

export function RecentTransactions() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="flex items-center">
                  {transaction.amount > 0 ? (
                    <ArrowDown className="mr-1 h-3 w-3 text-finance-success" />
                  ) : (
                    <ArrowUp className="mr-1 h-3 w-3 text-finance-danger" />
                  )}
                  <span className={transaction.amount > 0 ? "text-finance-success" : "text-finance-danger"}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${transaction.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${transaction.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                      ${transaction.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default RecentTransactions;
