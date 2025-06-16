
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
  paymentGateway: string;
  amount: number;
  status: string;
}

interface PaymentGatewayTableProps {
  data: PaymentData[];
}

const PaymentGatewayTable: React.FC<PaymentGatewayTableProps> = ({ data }) => {
  const gatewayStats = useMemo(() => {
    const stats: Record<string, { count: number; volume: number; successRate: number }> = {};
    
    data.forEach(item => {
      const gateway = item.paymentGateway;
      if (!stats[gateway]) {
        stats[gateway] = { count: 0, volume: 0, successRate: 0 };
      }
      stats[gateway].count += 1;
      stats[gateway].volume += item.amount;
    });

    // Calculate success rates
    Object.keys(stats).forEach(gateway => {
      const successCount = data.filter(item => 
        item.paymentGateway === gateway && item.status === 'success'
      ).length;
      stats[gateway].successRate = stats[gateway].count > 0 
        ? (successCount / stats[gateway].count) * 100 
        : 0;
    });

    return Object.entries(stats).map(([gateway, stat]) => ({
      gateway,
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
            <TableHead>Payment Gateway</TableHead>
            <TableHead>Transaction Count</TableHead>
            <TableHead>Total Volume</TableHead>
            <TableHead>Success Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gatewayStats.map((stat) => (
            <TableRow key={stat.gateway}>
              <TableCell>{stat.gateway}</TableCell>
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

export default PaymentGatewayTable;
