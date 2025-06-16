
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentData {
  id: string;
  date: Date;
  paymentMethod: string;
  amount: number;
  status: string;
  emiType?: string;
}

interface PaymentMethodTableProps {
  data: PaymentData[];
  emiTypes: string[];
  cardTypes: string[];
}

const PaymentMethodTable: React.FC<PaymentMethodTableProps> = ({ data, emiTypes, cardTypes }) => {
  const methodStats = useMemo(() => {
    const stats: Record<string, { count: number; volume: number; successRate: number }> = {};
    
    data.forEach(item => {
      const method = item.paymentMethod;
      if (!stats[method]) {
        stats[method] = { count: 0, volume: 0, successRate: 0 };
      }
      stats[method].count += 1;
      stats[method].volume += item.amount;
    });

    // Calculate success rates
    Object.keys(stats).forEach(method => {
      const successCount = data.filter(item => 
        item.paymentMethod === method && item.status === 'success'
      ).length;
      stats[method].successRate = stats[method].count > 0 
        ? (successCount / stats[method].count) * 100 
        : 0;
    });

    return Object.entries(stats).map(([method, stat]) => ({
      method,
      ...stat
    }));
  }, [data]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Method</TableHead>
            <TableHead>Transaction Count</TableHead>
            <TableHead>Total Volume</TableHead>
            <TableHead>Success Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methodStats.map((stat) => (
            <TableRow key={stat.method}>
              <TableCell className="capitalize">{stat.method}</TableCell>
              <TableCell>{stat.count}</TableCell>
              <TableCell>{formatCurrency(stat.volume)}</TableCell>
              <TableCell>{stat.successRate.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentMethodTable;
