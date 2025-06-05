
import React, { useMemo } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card } from "@/components/ui/card";

interface PaymentLineChartProps {
  data: any[];
  viewType: string;
  yAxisMetric: "percentVolume" | "orderCount";
  paymentStatuses?: string[];
  paymentMethods?: string[];
}

const PaymentLineChart: React.FC<PaymentLineChartProps> = ({ 
  data,
  viewType,
  yAxisMetric,
  paymentStatuses = ["success", "failure"],
  paymentMethods = []
}) => {
  // Prepare the data for the line chart
  const chartData = useMemo(() => {
    // Group data by date
    const dateGroups = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalAmount: 0,
          successAmount: 0,
          failureAmount: 0,
          refundAmount: 0,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          refundCount: 0,
          // Initialize payment method specific data
          methodData: {},
          gatewayData: {}
        };
      }
      
      // Increment totals
      acc[dateStr].totalAmount += item.amount;
      acc[dateStr].totalCount += 1;
      
      // Status-specific tracking
      if (item.status === "success") {
        acc[dateStr].successAmount += item.amount;
        acc[dateStr].successCount += 1;
      } else if (item.status === "failure") {
        acc[dateStr].failureAmount += item.amount;
        acc[dateStr].failureCount += 1;
      }
      
      if (item.isRefunded) {
        acc[dateStr].refundAmount += item.amount;
        acc[dateStr].refundCount += 1;
      }
      
      // Track data by payment method for "method" view
      if (viewType === "method") {
        // Group credit and debit cards under "cards" when cards filter is selected
        let method = item.paymentMethod;
        if (paymentMethods.includes("cards") && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
          method = "cards";
        }
        
        if (!acc[dateStr].methodData[method]) {
          acc[dateStr].methodData[method] = {
            amount: 0,
            count: 0
          };
        }
        acc[dateStr].methodData[method].amount += item.amount;
        acc[dateStr].methodData[method].count += 1;
      } else if (viewType === "gateway") {
        // Track data by payment gateway
        const gateway = item.paymentGateway;
        if (!acc[dateStr].gatewayData[gateway]) {
          acc[dateStr].gatewayData[gateway] = {
            amount: 0,
            count: 0
          };
        }
        acc[dateStr].gatewayData[gateway].amount += item.amount;
        acc[dateStr].gatewayData[gateway].count += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and process data
    return Object.values(dateGroups)
      .map((group: any) => {
        const processedGroup = { ...group };
        
        // Calculate percentages for status view
        if (processedGroup.totalAmount > 0) {
          processedGroup.successVolumePercent = (processedGroup.successAmount / processedGroup.totalAmount) * 100;
          processedGroup.failureVolumePercent = (processedGroup.failureAmount / processedGroup.totalAmount) * 100;
          processedGroup.refundVolumePercent = (processedGroup.refundAmount / processedGroup.totalAmount) * 100;
        } else {
          processedGroup.successVolumePercent = 0;
          processedGroup.failureVolumePercent = 0;
          processedGroup.refundVolumePercent = 0;
        }
        
        // Calculate percentages for payment methods (method view)
        if (viewType === "method" && processedGroup.methodData) {
          const methods = Object.keys(processedGroup.methodData);
          
          methods.forEach(method => {
            const methodData = processedGroup.methodData[method];
            if (processedGroup.totalAmount > 0) {
              processedGroup[`${method}VolumePercent`] = (methodData.amount / processedGroup.totalAmount) * 100;
            } else {
              processedGroup[`${method}VolumePercent`] = 0;
            }
            
            processedGroup[`${method}Count`] = methodData.count;
          });
        } else if (viewType === "gateway" && processedGroup.gatewayData) {
          // Calculate percentages for payment gateways
          const gateways = Object.keys(processedGroup.gatewayData);
          
          gateways.forEach(gateway => {
            const gatewayData = processedGroup.gatewayData[gateway];
            if (processedGroup.totalAmount > 0) {
              processedGroup[`${gateway}VolumePercent`] = (gatewayData.amount / processedGroup.totalAmount) * 100;
            } else {
              processedGroup[`${gateway}VolumePercent`] = 0;
            }
            
            processedGroup[`${gateway}Count`] = gatewayData.count;
          });
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, viewType, paymentMethods]);

  // Empty state check
  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No data available for the selected filters</p>
        </div>
      </Card>
    );
  }

  // Define color mapping for statuses, payment methods, and gateways
  const colors = {
    success: "#10B981",
    failure: "#EF4444",
    refund: "#F59E0B",
    total: "#6366F1",
    creditCard: "#8B5CF6",
    debitCard: "#EC4899",
    netBanking: "#0EA5E9",
    upi: "#14B8A6",
    wallet: "#F97316",
    emi: "#8B5CF6",
    cards: "#9333EA",
    Razorpay: "#3B82F6",
    PayU: "#10B981"
  };

  // Format names for display
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

  // Determine which lines to show based on selected metrics, statuses, and view type
  const getLinesToShow = () => {
    // If we're in payment method view
    if (viewType === "method") {
      // Get unique payment methods from the data, but handle cards grouping
      let paymentMethodsToShow = Array.from(
        new Set(data.map(item => {
          // Group credit and debit cards under "cards" when cards filter is selected
          if (paymentMethods.includes("cards") && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
            return "cards";
          }
          return item.paymentMethod;
        }))
      );
      
      // If specific payment methods are selected, filter to only show those
      if (paymentMethods.length > 0) {
        const expandedMethods = [];
        for (const method of paymentMethods) {
          if (method === "cards") {
            expandedMethods.push("cards");
          } else {
            expandedMethods.push(method);
          }
        }
        paymentMethodsToShow = paymentMethodsToShow.filter(method => expandedMethods.includes(method));
      }
      
      if (yAxisMetric === "percentVolume") {
        return paymentMethodsToShow.map(method => ({
          id: method,
          dataKey: `${method}VolumePercent`,
          stroke: colors[method] || "#666",
          name: `${formatMethodName(method)} Volume %`,
          visible: true
        }));
      } else {
        return paymentMethodsToShow.map(method => ({
          id: method,
          dataKey: `${method}Count`,
          stroke: colors[method] || "#666",
          name: `${formatMethodName(method)} Orders`,
          visible: true
        }));
      }
    } 
    // Gateway view
    else if (viewType === "gateway") {
      const gateways = Array.from(
        new Set(data.map(item => item.paymentGateway))
      );
      
      if (yAxisMetric === "percentVolume") {
        return gateways.map(gateway => ({
          id: gateway,
          dataKey: `${gateway}VolumePercent`,
          stroke: colors[gateway] || "#666",
          name: `${gateway} Volume %`,
          visible: true
        }));
      } else {
        return gateways.map(gateway => ({
          id: gateway,
          dataKey: `${gateway}Count`,
          stroke: colors[gateway] || "#666",
          name: `${gateway} Orders`,
          visible: true
        }));
      }
    }
    // Default status-based view
    else {
      switch (yAxisMetric) {
        case "percentVolume":
          return [
            { 
              id: "success", 
              dataKey: "successVolumePercent", 
              stroke: colors.success, 
              name: "Success Volume %",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureVolumePercent", 
              stroke: colors.failure, 
              name: "Failure Volume %",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundVolumePercent", 
              stroke: colors.refund, 
              name: "Refund Volume %",
              visible: paymentStatuses.includes("refund")
            }
          ].filter(line => line.visible);
          
        case "orderCount":
          return [
            { 
              id: "total", 
              dataKey: "totalCount", 
              stroke: colors.total, 
              name: "Total Orders",
              visible: paymentStatuses.length > 1
            },
            { 
              id: "success", 
              dataKey: "successCount", 
              stroke: colors.success, 
              name: "Successful Orders",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureCount", 
              stroke: colors.failure, 
              name: "Failed Orders",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundCount", 
              stroke: colors.refund, 
              name: "Refunded Orders",
              visible: paymentStatuses.includes("refund")
            }
          ].filter(line => line.visible);
          
        default:
          return [];
      }
    }
  };

  const linesToShow = getLinesToShow();

  // Determine y-axis configuration based on selected metric
  const getYAxisConfig = () => {
    switch (yAxisMetric) {
      case "percentVolume":
        return {
          yAxisDomain: [0, 100],
          yAxisLabel: "Percentage of Volume",
          tooltipFormatter: (value: number) => `${value.toFixed(1)}%`
        };
        
      case "orderCount":
        return {
          yAxisDomain: ['auto', 'auto'],
          yAxisLabel: "Number of Orders",
          tooltipFormatter: (value: number) => value.toString()
        };
        
      default:
        return {
          yAxisDomain: [0, 100],
          yAxisLabel: "Percentage",
          tooltipFormatter: (value: number) => `${value.toFixed(1)}%`
        };
    }
  };

  const yAxisConfig = getYAxisConfig();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(tick) => format(new Date(tick), "MMM dd")}
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          domain={yAxisConfig.yAxisDomain}
          label={{ 
            value: yAxisConfig.yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          stroke="#64748b"
          fontSize={12}
        />
        <Tooltip 
          formatter={yAxisConfig.tooltipFormatter}
          labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px'
          }}
        />
        
        {linesToShow.map((line) => (
          <Line
            key={line.id}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            activeDot={{ r: 6 }}
            name={line.name}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PaymentLineChart;
