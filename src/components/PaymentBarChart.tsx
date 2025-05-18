import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from "recharts";

interface PaymentBarChartProps {
  data: any[];
  viewType: string;
  chartMetric: string;
  emiTypes?: string[]; // Optional EMI types
  paymentStatuses?: string[]; // Add payment statuses prop
}

// Define CustomTooltipProps interface to fix the TypeScript error
interface CustomTooltipProps extends TooltipProps<any, any> {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const PaymentBarChart: React.FC<PaymentBarChartProps> = ({ 
  data, 
  viewType, 
  chartMetric, 
  emiTypes = [],
  paymentStatuses = [] 
}) => {
  // Format payment method names for display - moved up before it's used
  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      case "shopse": return "Shopse";
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

  // Check if we should show failure reasons chart
  const showFailureReasons = paymentStatuses.length === 1 && paymentStatuses.includes("failure");

  const chartData = useMemo(() => {
    // If failure status is selected, show top 5 failure reasons
    if (showFailureReasons) {
      // Group data by failure reason
      const failureData = data.filter(item => item.status === "failure" && item.failureReason);
      
      const groupedByReason = failureData.reduce((acc, item) => {
        const key = item.failureReason || "Unknown";
        
        if (!acc[key]) {
          acc[key] = {
            reason: key,
            count: 0,
            totalAmount: 0,
            gateway: viewType === "gateway" ? {} : null,
            method: viewType === "method" ? {} : null,
          };
        }
        
        acc[key].count += 1;
        acc[key].totalAmount += item.amount;
        
        // Group by gateway or method depending on viewType
        if (viewType === "gateway" && item.paymentGateway) {
          const gateway = item.paymentGateway;
          if (!acc[key].gateway[gateway]) {
            acc[key].gateway[gateway] = { count: 0, amount: 0 };
          }
          acc[key].gateway[gateway].count += 1;
          acc[key].gateway[gateway].amount += item.amount;
        } else if (viewType === "method" && item.paymentMethod) {
          const method = item.paymentMethod;
          if (!acc[key].method[method]) {
            acc[key].method[method] = { count: 0, amount: 0 };
          }
          acc[key].method[method].count += 1;
          acc[key].method[method].amount += item.amount;
        }
        
        return acc;
      }, {});
      
      // Convert to array and sort by count
      return Object.values(groupedByReason)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5) // Take top 5
        .map((item: any) => ({
          name: item.reason,
          count: item.count,
          volume: item.totalAmount,
          // For tooltip breakdown
          breakdown: viewType === "gateway" ? item.gateway : item.method
        }));
    }
    
    // Otherwise use original chart logic
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
  }, [data, viewType, emiTypes, showFailureReasons]);

  // Determine what to display based on chartMetric and failure status
  const dataKey = showFailureReasons ? "count" : (chartMetric === "volume" ? "volume" : "successRate");
  
  // Format for the tooltip
  const formatTooltip = (value: number, key: string) => {
    if (showFailureReasons && key === "count") {
      return `${value} Transactions`;
    } else if (chartMetric === "volume" || key === "volume") {
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

  // Custom tooltip that shows EMI type if available - fixed with proper type definition
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatTooltip(entry.value, entry.dataKey)}
            </p>
          ))}
          {payload[0].payload.emiType && (
            <p className="text-xs text-muted-foreground mt-1">
              EMI Type: {formatEmiTypeName(payload[0].payload.emiType)}
            </p>
          )}
          {/* Show breakdown for failure reasons */}
          {showFailureReasons && payload[0].payload.breakdown && (
            <div className="mt-2 border-t pt-1 text-xs">
              <p className="font-medium">Breakdown:</p>
              {Object.entries(payload[0].payload.breakdown).map(([key, value]: [string, any]) => (
                <p key={key} className="ml-2">
                  {viewType === "method" ? formatMethodName(key) : key}: {value.count} ({formatTooltip(value.amount, "volume")})
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const barFill = useMemo(() => {
    if (showFailureReasons) return "#EF4444"; // Red for failure reasons
    return chartMetric === "volume" ? "#3B82F6" : "#10B981"; // Blue for volume, green for success rate
  }, [showFailureReasons, chartMetric]);

  const axisLabel = useMemo(() => {
    if (showFailureReasons) return "Number of Failures";
    return chartMetric === "volume" ? "Volume (₹)" : "Success Rate (%)";
  }, [showFailureReasons, chartMetric]);

  const chartTitle = useMemo(() => {
    if (showFailureReasons) return "Top 5 Payment Failure Reasons";
    return chartMetric === "volume" ? "Transaction Volume" : "Success Rate";
  }, [showFailureReasons, chartMetric]);

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
            value: axisLabel, 
            angle: -90, 
            position: "insideLeft" 
          }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey={dataKey} 
          fill={barFill} 
          name={chartTitle}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentBarChart;
