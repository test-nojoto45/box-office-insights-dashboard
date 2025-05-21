
import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, parseISO } from "date-fns";

interface PaymentLineChartProps {
  data: any[];
  viewType: string;
  chartMetric: string;
  emiTypes?: string[];
  paymentStatuses?: string[];
}

// Define CustomTooltipProps interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const PaymentLineChart: React.FC<PaymentLineChartProps> = ({
  data,
  viewType,
  chartMetric,
  emiTypes = [],
  paymentStatuses = []
}) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      case "emi": return "EMI";
      default: return method;
    }
  };

  // Prepare the data grouped by date
  const chartData = useMemo(() => {
    // Group data by date
    const groupedByDate = data.reduce((acc: any, item: any) => {
      const date = item.date?.substring(0, 10) || "Unknown";
      
      if (!acc[date]) {
        acc[date] = {
          date,
          totalVolume: 0,
          successVolume: 0,
          failureVolume: 0,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          policyCount: 0,
          refundCount: 0,
          refundVolume: 0
        };
      }
      
      // Add data to the date group
      acc[date].totalCount += 1;
      acc[date].totalVolume += item.amount;
      
      if (item.status === "success") {
        acc[date].successCount += 1;
        acc[date].successVolume += item.amount;
      } else if (item.status === "failure") {
        acc[date].failureCount += 1;
        acc[date].failureVolume += item.amount;
      } else if (item.status === "refund") {
        acc[date].refundCount += 1;
        acc[date].refundVolume += item.amount;
      }
      
      // Count policies
      if (item.hasPolicy) {
        acc[date].policyCount += 1;
      }
      
      return acc;
    }, {});

    // Convert to array and calculate percentages
    const result = Object.values(groupedByDate).map((dateGroup: any) => ({
      ...dateGroup,
      successPercentage: dateGroup.totalCount > 0 ? (dateGroup.successCount / dateGroup.totalCount) * 100 : 0,
      failurePercentage: dateGroup.totalCount > 0 ? (dateGroup.failureCount / dateGroup.totalCount) * 100 : 0,
      refundPercentage: dateGroup.totalCount > 0 ? (dateGroup.refundCount / dateGroup.totalCount) * 100 : 0,
      volumePercentage: data.length > 0 ? 
        (dateGroup.totalVolume / data.reduce((sum: number, item: any) => sum + item.amount, 0)) * 100 : 0
    }));

    // Sort by date
    return result.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [data]);

  // Get the metric to display based on chartMetric
  const getDataKey = () => {
    switch (chartMetric) {
      case "percentVolume":
        return "volumePercentage";
      case "successRate":
        return "successPercentage";
      case "failureRate":
        return "failurePercentage";
      case "policyCount":
        return "policyCount";
      case "refundRate":
        return "refundPercentage";
      default:
        return "volumePercentage";
    }
  };

  // Format for the tooltip
  const formatTooltip = (value: number, dataKey: string) => {
    if (dataKey.includes("Percentage")) {
      return `${value.toFixed(1)}%`;
    } else if (dataKey === "totalVolume" || dataKey === "successVolume" || dataKey === "failureVolume" || dataKey === "refundVolume") {
      if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
      } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} Lakhs`;
      } else {
        return `₹${value.toFixed(2)}`;
      }
    } else {
      return value.toString();
    }
  };

  // Custom tooltip
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p>
            {chartMetric === "percentVolume" ? "Volume Percentage" : 
             chartMetric === "successRate" ? "Success Rate" : 
             chartMetric === "failureRate" ? "Failure Rate" :
             chartMetric === "policyCount" ? "Number of Policies" : 
             chartMetric === "refundRate" ? "Refund Rate" : "Volume"}: 
            {" "}{formatTooltip(payload[0].value, getDataKey())}
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            <p>Total Transactions: {dataItem.totalCount}</p>
            <p>Volume: {formatTooltip(dataItem.totalVolume, "totalVolume")}</p>
            <p>Success: {dataItem.successCount} ({dataItem.successPercentage.toFixed(1)}%)</p>
            <p>Failure: {dataItem.failureCount} ({dataItem.failurePercentage.toFixed(1)}%)</p>
            {dataItem.refundCount > 0 && (
              <p>Refunds: {dataItem.refundCount} ({dataItem.refundPercentage.toFixed(1)}%)</p>
            )}
            <p>Policies: {dataItem.policyCount}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get the title for the chart
  const getChartTitle = () => {
    switch (chartMetric) {
      case "percentVolume":
        return "Percentage of Volume Processed";
      case "successRate":
        return "Success Rate (%)";
      case "failureRate":
        return "Failure Rate (%)";
      case "policyCount":
        return "Number of Policies";
      case "refundRate":
        return "Refund Rate (%)";
      default:
        return "Percentage of Volume Processed";
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} 
          angle={-45} 
          textAnchor="end" 
          height={70} 
        />
        <YAxis
          label={{ 
            value: getChartTitle(), 
            angle: -90, 
            position: "insideLeft" 
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={getDataKey()} 
          name={getChartTitle()}
          stroke="#3B82F6" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PaymentLineChart;
