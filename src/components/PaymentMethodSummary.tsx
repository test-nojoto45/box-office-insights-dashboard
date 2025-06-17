
import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentMethodSummaryProps {
  data: any[];
}

const PaymentMethodSummary: React.FC<PaymentMethodSummaryProps> = ({ data }) => {
  // Process data to get payment method summaries
  const processPaymentMethodData = () => {
    const methodStats = {};
    
    data.forEach(item => {
      let method = item.paymentMethod;
      if (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard") {
        method = "cards";
      }
      
      if (!methodStats[method]) {
        methodStats[method] = {
          totalTransactions: 0,
          totalVolume: 0,
          successCount: 0,
          failureCount: 0,
          amounts: []
        };
      }
      
      methodStats[method].totalTransactions += 1;
      methodStats[method].totalVolume += item.amount || 0;
      methodStats[method].amounts.push(item.amount || 0);
      
      if (item.status === "success") {
        methodStats[method].successCount += 1;
      } else if (item.status === "failure") {
        methodStats[method].failureCount += 1;
      }
    });
    
    return Object.entries(methodStats).map(([method, stats]: [string, any]) => {
      const averageTicketSize = stats.amounts.length > 0 
        ? stats.amounts.reduce((sum, amt) => sum + amt, 0) / stats.amounts.length 
        : 0;
      
      const successPercentage = stats.totalTransactions > 0 
        ? (stats.successCount / stats.totalTransactions) * 100 
        : 0;
      
      const failurePercentage = stats.totalTransactions > 0 
        ? (stats.failureCount / stats.totalTransactions) * 100 
        : 0;
      
      return {
        method,
        totalTransactions: stats.totalTransactions,
        averageTicketSize,
        totalVolumeProcessed: stats.totalVolume,
        successPercentage,
        failurePercentage
      };
    });
  };

  const summaryData = processPaymentMethodData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      case "emi": return "EMI";
      case "cards": return "Cards";
      default: return method;
    }
  };

  return (
    <Card className="p-6 shadow-sm border-slate-200">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Payment Method Summary</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Total Transactions</TableHead>
              <TableHead className="text-right">Average Ticket Size</TableHead>
              <TableHead className="text-right">Total Volume Processed</TableHead>
              <TableHead className="text-right">Success %</TableHead>
              <TableHead className="text-right">Failure %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row) => (
              <TableRow key={row.method}>
                <TableCell className="font-medium">
                  {formatMethodName(row.method)}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalTransactions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.averageTicketSize)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.totalVolumeProcessed)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600 font-medium">
                    {row.successPercentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600 font-medium">
                    {row.failurePercentage.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default PaymentMethodSummary;
