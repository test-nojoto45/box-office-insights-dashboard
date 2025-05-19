
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps, Cell } from "recharts";

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
      case "emi": return "EMI";
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

  // Define colors for different payment gateways and methods
  const colorMap = {
    "Razorpay": "#9b87f5", // Primary Purple
    "PayU": "#F97316", // Bright Orange
    "creditCard": "#0EA5E9", // Ocean Blue
    "debitCard": "#1EAEDB", // Bright Blue
    "netBanking": "#33C3F0", // Sky Blue
    "upi": "#7E69AB", // Secondary Purple
    "wallet": "#6E59A5", // Tertiary Purple
    "shopse": "#8B5CF6", // Vivid Purple
    "emi": "#ea384c", // Red
    "default": "#3B82F6", // Default Blue
    "failure": "#ea384c", // Red for failure
    "Others": "#8E9196", // Neutral Gray for Others category
  };

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
      const sortedData = Object.values(groupedByReason)
        .sort((a: any, b: any) => b.count - a.count);
      
      // Top 5 items
      const top5 = sortedData.slice(0, 5);
      
      // Create "Others" category if there are more than 5 items
      if (sortedData.length > 5) {
        const others = sortedData.slice(5).reduce((acc: any, item: any) => {
          acc.count += item.count;
          acc.totalAmount += item.totalAmount;
          
          // Combine gateway or method data
          if (viewType === "gateway" && item.gateway) {
            Object.entries(item.gateway).forEach(([key, value]: [string, any]) => {
              if (!acc.gateway[key]) {
                acc.gateway[key] = { count: 0, amount: 0 };
              }
              acc.gateway[key].count += value.count;
              acc.gateway[key].amount += value.amount;
            });
          } else if (viewType === "method" && item.method) {
            Object.entries(item.method).forEach(([key, value]: [string, any]) => {
              if (!acc.method[key]) {
                acc.method[key] = { count: 0, amount: 0 };
              }
              acc.method[key].count += value.count;
              acc.method[key].amount += value.amount;
            });
          }
          
          return acc;
        }, {
          reason: "Others",
          count: 0,
          totalAmount: 0,
          gateway: viewType === "gateway" ? {} : null,
          method: viewType === "method" ? {} : null,
        });
        
        // Add Others to the array
        top5.push(others);
      }
      
      return top5.map((item: any) => ({
        name: item.reason,
        count: item.count,
        volume: item.totalAmount,
        // Calculate failure percentage for each reason
        failurePercentage: (item.count / failureData.length) * 100,
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
        (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard" || item.paymentMethod === "emi") && 
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
            groupKey, // Store original key for color mapping
          };
        }
        
        acc[emiKey].totalAmount += item.amount;
        acc[emiKey].totalCount += 1;
        if (item.status === "success") {
          acc[emiKey].successCount += 1;
        }
        
        return acc;
      }, {});

      // Convert to array, calculate percentages, and get top 5
      const dataArray = Object.values(groupedData).map((group: any) => ({
        name: `${group.name} (${group.emiTypeName})`,
        originalName: group.name,
        groupKey: group.groupKey,
        emiType: group.emiType,
        volume: group.totalAmount,
        successRate: group.totalCount > 0 ? (group.successCount / group.totalCount) * 100 : 0,
      }));
      
      // Sort by volume
      const sortedData = dataArray.sort((a: any, b: any) => b.volume - a.volume);
      
      // Get top 5
      const top5 = sortedData.slice(0, 5);
      
      // Create "Others" category if there are more than 5 items
      if (sortedData.length > 5) {
        const others = sortedData.slice(5).reduce((acc: any, item: any) => {
          acc.volume += item.volume;
          acc.successCount += item.successRate * item.volume / 100; // Weighted success rate
          acc.totalVolume += item.volume;
          return acc;
        }, {
          name: "Others",
          originalName: "Others",
          groupKey: "Others",
          volume: 0,
          successCount: 0,
          totalVolume: 0,
        });
        
        others.successRate = others.totalVolume > 0 ? 
          (others.successCount / others.totalVolume) * 100 : 0;
        
        // Add Others to the array
        top5.push(others);
      }
      
      return top5;
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
      
      // Convert to array, calculate percentages
      const dataArray = Object.values(groupedData).map((group: any) => ({
        name: viewType === "method" ? formatMethodName(group.name) : group.name,
        groupKey: group.name, // Store original key for color mapping
        volume: group.totalAmount,
        successRate: group.totalCount > 0 ? (group.successCount / group.totalCount) * 100 : 0,
      }));
      
      // Sort by volume
      const sortedData = dataArray.sort((a: any, b: any) => b.volume - a.volume);
      
      // Get top 5
      const top5 = sortedData.slice(0, 5);
      
      // Create "Others" category if there are more than 5 items
      if (sortedData.length > 5) {
        const others = sortedData.slice(5).reduce((acc: any, item: any) => {
          acc.volume += item.volume;
          acc.successCount += item.successRate * item.volume / 100; // Weighted success rate
          acc.totalVolume += item.volume;
          return acc;
        }, {
          name: "Others",
          groupKey: "Others",
          volume: 0,
          successCount: 0,
          totalVolume: 0,
        });
        
        others.successRate = others.totalVolume > 0 ? 
          (others.successCount / others.totalVolume) * 100 : 0;
        
        // Add Others to the array
        top5.push(others);
      }
      
      return top5;
    }
  }, [data, viewType, emiTypes, showFailureReasons]);

  // Determine what to display based on chartMetric and failure status
  const dataKey = useMemo(() => {
    if (showFailureReasons) {
      return chartMetric === "volume" ? "volume" : "failurePercentage";
    } else {
      return chartMetric === "volume" ? "volume" : "successRate";
    }
  }, [showFailureReasons, chartMetric]);
  
  // Format for the tooltip
  const formatTooltip = (value: number, key: string) => {
    if (key === "failurePercentage") {
      return `${value.toFixed(1)}%`;
    } else if (key === "count") {
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
          {showFailureReasons && payload[0].payload.breakdown && label === "Others" && (
            <div className="mt-2 border-t pt-1 text-xs">
              <p className="font-medium">Includes multiple failure reasons</p>
            </div>
          )}
          {/* Show breakdown for failure reasons */}
          {showFailureReasons && payload[0].payload.breakdown && label !== "Others" && (
            <div className="mt-2 border-t pt-1 text-xs">
              <p className="font-medium">Breakdown:</p>
              {Object.entries(payload[0].payload.breakdown).map(([key, value]: [string, any]) => (
                <p key={key} className="ml-2">
                  {viewType === "method" ? formatMethodName(key) : key}: {value.count} ({formatTooltip(value.amount, "volume")})
                </p>
              ))}
            </div>
          )}
          {/* Add extra info for Others category */}
          {label === "Others" && !showFailureReasons && (
            <p className="text-xs text-muted-foreground mt-1">
              Combines all remaining entries beyond top 5
            </p>
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
    if (showFailureReasons) {
      return chartMetric === "volume" ? "Volume (₹)" : "Failure Percentage (%)";
    }
    return chartMetric === "volume" ? "Volume (₹)" : "Success Rate (%)";
  }, [showFailureReasons, chartMetric]);

  const chartTitle = useMemo(() => {
    if (showFailureReasons) {
      return chartMetric === "volume" ? "Transaction Volume" : "Failure Percentage";
    }
    return chartMetric === "volume" ? "Transaction Volume" : "Success Rate";
  }, [showFailureReasons, chartMetric]);

  // Get the color for a data item based on its gateway or method
  const getBarColor = (entry: any) => {
    if (showFailureReasons) return colorMap.failure;
    
    if (entry.name === "Others" || entry.groupKey === "Others") {
      return colorMap.Others;
    }
    
    const key = entry.groupKey;
    return colorMap[key] || colorMap.default;
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
            value: axisLabel, 
            angle: -90, 
            position: "insideLeft" 
          }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey={dataKey} 
          name={chartTitle}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentBarChart;
