
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PaymentBarChartProps {
  data: any[];
  viewType: string;
  chartMetric: string;
  emiTypes?: string[]; // Add emiTypes as an optional prop
}

const PaymentBarChart: React.FC<PaymentBarChartProps> = ({ data, viewType, chartMetric, emiTypes = [] }) => {
  // Format payment method names for display - moved up before it's used
  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      default: return method;
    }
  };

  // Format EMI type names for display
  const formatEmiTypeName = (emiType: string) => {
    switch (emiType) {
      case "standard": return "Standard EMI";
      case "noCost": return "No Cost EMI";
      default: return emiType;
    }
  };

  const chartData = useMemo(() => {
    // Check if we need to group by EMI type
    const shouldGroupByEmi = emiTypes.length > 0 && 
      data.some(item => item.emiType && emiTypes.includes(item.emiType));
    
    // If EMI types are selected, we'll group differently
    if (shouldGroupByEmi) {
      // First filter to only card payments with selected EMI types
      const emiFilteredData = data.filter(item => 
        (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard") && 
        item.emiType && 
        emiTypes.includes(item.emiType)
      );
      
      // Group by EMI type and payment method/gateway
      const groupedData = emiFilteredData.reduce((acc, item) => {
        const groupKey = viewType === "gateway" ? item.paymentGateway : item.paymentMethod;
        const emiKey = `${groupKey}-${item.emiType}`;
        
        if (!acc[emiKey]) {
          acc[emiKey] = {
            name: viewType === "method" ? formatMethodName(groupKey) : groupKey,
            emiType: item.emiType,
            emiTypeName: formatEmiTypeName(item.emiType),
            totalAmount: 0,
            successCount: 0,
            totalCount: 0,
          };
        }
        
        acc[emiKey].totalAmount += item.amount;
        acc[emiKey].totalCount += 1;
        if (item.status === "success") {
          acc[emiKey].successCount += 1;
        }
        
        return acc;
      }, {});

      // Convert to array and calculate percentages
      return Object.values(groupedData).map((group: any) => ({
        name: `${group.name} (${group.emiTypeName})`,
        originalName: group.name,
        emiType: group.emiType,
        volume: group.totalAmount,
        successRate: group.totalCount > 0 ? (group.successCount / group.totalCount) * 100 : 0,
      }));
    } else {
      // Original grouping logic when no EMI filters are applied
      const groupBy = viewType === "gateway" ? "paymentGateway" : "paymentMethod";
      
      const groupedData = data.reduce((acc, item) => {
        const key = item[groupBy];
        
        if (!acc[key]) {
          acc[key] = {
            name: key,
            totalAmount: 0,
            successCount: 0,
            totalCount: 0,
          };
        }
        
        acc[key].totalAmount += item.amount;
        acc[key].totalCount += 1;
        if (item.status === "success") {
          acc[key].successCount += 1;
        }
        
        return acc;
      }, {});
      
      // Convert to array and calculate percentages
      return Object.values(groupedData).map((group: any) => ({
        name: viewType === "method" ? formatMethodName(group.name) : group.name,
        volume: group.totalAmount,
        successRate: group.totalCount > 0 ? (group.successCount / group.totalCount) * 100 : 0,
      }));
    }
  }, [data, viewType, emiTypes]);

  // Determine what to display based on chartMetric
  const dataKey = chartMetric === "volume" ? "volume" : "successRate";
  
  // Format for the tooltip
  const formatTooltip = (value: number) => {
    if (chartMetric === "volume") {
      if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
      } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} Lakhs`;
      } else {
        return `₹${value.toFixed(2)}`;
      }
    } else {
      return `${value.toFixed(1)}%`;
    }
  };

  // Custom tooltip that shows EMI type if available
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatTooltip(entry.value)}
            </p>
          ))}
          {payload[0].payload.emiType && (
            <p className="text-xs text-muted-foreground mt-1">
              EMI Type: {formatEmiTypeName(payload[0].payload.emiType)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
        <YAxis 
          label={{ 
            value: chartMetric === "volume" ? "Volume (₹)" : "Success Rate (%)", 
            angle: -90, 
            position: "insideLeft" 
          }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey={dataKey} 
          fill={chartMetric === "volume" ? "#3B82F6" : "#10B981"} 
          name={chartMetric === "volume" ? "Transaction Volume" : "Success Rate"}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentBarChart;
