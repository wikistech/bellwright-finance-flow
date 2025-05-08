
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Loan {
  id: string;
  type: string;
  amount: number;
  amountPaid: number;
  interestRate: number;
  term: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

const loans: Loan[] = [
  {
    id: "loan1",
    type: "Personal Loan",
    amount: 10000,
    amountPaid: 3000,
    interestRate: 8.5,
    term: 24,
    nextPaymentDate: "2025-06-15",
    nextPaymentAmount: 450,
  },
  {
    id: "loan2",
    type: "Business Loan",
    amount: 5000,
    amountPaid: 500,
    interestRate: 6.5,
    term: 12,
    nextPaymentDate: "2025-06-22",
    nextPaymentAmount: 433,
  }
];

export function LoanStatus() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Current Loans</h2>
      <div className="grid grid-cols-1 gap-6">
        {loans.map((loan) => {
          const percentagePaid = (loan.amountPaid / loan.amount) * 100;
          
          return (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.type}</CardTitle>
                    <CardDescription>
                      {formatCurrency(loan.amount)} at {loan.interestRate}% for {loan.term} months
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Outstanding</div>
                    <div className="font-medium">
                      {formatCurrency(loan.amount - loan.amountPaid)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(percentagePaid)}% paid</span>
                  </div>
                  <Progress value={percentagePaid} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Next Payment Date</div>
                    <div className="font-medium">{formatDate(loan.nextPaymentDate)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Next Payment Amount</div>
                    <div className="font-medium">{formatCurrency(loan.nextPaymentAmount)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default LoanStatus;
