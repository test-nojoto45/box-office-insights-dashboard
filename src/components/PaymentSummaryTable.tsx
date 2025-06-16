
import React from "react";
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
  lob: string;
  businessType: string;
  paymentGateway: string;
  insurer: string;
  paymentMethod: string;
  amount: number;
  status: string;
  isRefunded: boolean;
}

interface PaymentSummaryTableProps {
  data: PaymentData[];
}

const PaymentSummaryTable: React.FC<PaymentSummaryTableProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>LOB</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 10).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell className="capitalize">{item.lob}</TableCell>
              <TableCell className="uppercase">{item.businessType}</TableCell>
              <TableCell>{item.paymentGateway}</TableCell>
              <TableCell className="capitalize">{item.paymentMethod}</TableCell>
              <TableCell>{formatCurrency(item.amount)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'success' ? 'bg-green-100 text-green-800' :
                  item.status === 'failure' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentSummaryTable;
