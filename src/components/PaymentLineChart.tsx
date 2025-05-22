
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
  viewType: string; // Add viewType prop
  yAxisMetric: "percentVolume" | "orderCount";
  paymentStatuses?: string[];
}

const PaymentLineChart: React.FC<PaymentLineChartProps> = ({ 
  data,
  viewType,
  yAxisMetric,
  paymentStatuses = ["success", "failure"]
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
          methodData: {} 
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
        const method = item.paymentMethod;
        if (!acc[dateStr].methodData[method]) {
          acc[dateStr].methodData[method] = {
            amount: 0,
            count: 0
          };
        }
        acc[dateStr].methodData[method].amount += item.amount;
        acc[dateStr].methodData[method].count += 1;
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
            // Calculate percentages based on total
            const methodData = processedGroup.methodData[method];
            if (processedGroup.totalAmount > 0) {
              processedGroup[`${method}VolumePercent`] = (methodData.amount / processedGroup.totalAmount) * 100;
            } else {
              processedGroup[`${method}VolumePercent`] = 0;
            }
            
            // Also store the count
            processedGroup[`${method}Count`] = methodData.count;
          });
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, viewType]);

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

  // Define color mapping for statuses and payment methods
  const statusColors = {
    success: "#10B981", // green
    failure: "#EF4444", // red
    refund: "#F59E0B",  // amber
    total: "#6366F1",   // indigo
    creditCard: "#8B5CF6", // purple
    debitCard: "#EC4899", // pink
    netBanking: "#0EA5E9", // blue
    upi: "#14B8A6", // teal
    wallet: "#F97316", // orange
    emi: "#8B5CF6" // purple
  };

  // Format payment method name for display
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

  // Determine which lines to show based on selected metrics, statuses, and view type
  const getLinesToShow = () => {
    // If we're in payment method view
    if (viewType === "method") {
      // Get unique payment methods from the data
      const paymentMethods = Array.from(
        new Set(data.map(item => item.paymentMethod))
      );
      
      if (yAxisMetric === "percentVolume") {
        return paymentMethods.map(method => ({
          id: method,
          dataKey: `${method}VolumePercent`,
          stroke: statusColors[method] || "#666",
          name: `${formatMethodName(method)} Volume %`,
          visible: true
        }));
      } else { // orderCount
        return paymentMethods.map(method => ({
          id: method,
          dataKey: `${method}Count`,
          stroke: statusColors[method] || "#666",
          name: `${formatMethodName(method)} Orders`,
          visible: true
        }));
      }
    } 
    // Default view - status based
    else {
      switch (yAxisMetric) {
        case "percentVolume":
          return [
            { 
              id: "success", 
              dataKey: "successVolumePercent", 
              stroke: statusColors.success, 
              name: "Success Volume %",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureVolumePercent", 
              stroke: statusColors.failure, 
              name: "Failure Volume %",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundVolumePercent", 
              stroke: statusColors.refund, 
              name: "Refund Volume %",
              visible: paymentStatuses.includes("refund")
            }
          ].filter(line => line.visible);
          
        case "orderCount":
          return [
            { 
              id: "total", 
              dataKey: "totalCount", 
              stroke: statusColors.total, 
              name: "Total Orders",
              visible: paymentStatuses.length > 1
            },
            { 
              id: "success", 
              dataKey: "successCount", 
              stroke: statusColors.success, 
              name: "Successful Orders",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureCount", 
              stroke: statusColors.failure, 
              name: "Failed Orders",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundCount", 
              stroke: statusColors.refund, 
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
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Payment Trend</h2>
        <p className="text-sm text-muted-foreground">
          {viewType === "method" 
            ? (yAxisMetric === "percentVolume" 
              ? "Payment method volume trends over time"
              : "Payment method order counts over time")
            : (yAxisMetric === "percentVolume" 
              ? "Payment status volume trends over time" 
              : "Payment status order counts over time")}
        </p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(tick) => format(new Date(tick), "MMM dd")}
            />
            <YAxis 
              domain={yAxisConfig.yAxisDomain}
              label={{ 
                value: yAxisConfig.yAxisLabel, 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={yAxisConfig.tooltipFormatter}
              labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
            />
            <Legend />
            
            {linesToShow.map((line, index) => (
              <Line
                key={line.id}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                activeDot={{ r: 8 }}
                name={line.name}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PaymentLineChart;
