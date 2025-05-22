
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
  yAxisMetric: "percentVolume" | "orderCount";
  paymentStatuses?: string[]; // Add paymentStatuses prop
}

const PaymentLineChart: React.FC<PaymentLineChartProps> = ({ 
  data,
  yAxisMetric,
  paymentStatuses = ["success", "failure"] // Default to showing all statuses
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
          refundCount: 0
        };
      }
      
      acc[dateStr].totalAmount += item.amount;
      acc[dateStr].totalCount += 1;
      
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
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(dateGroups)
      .map((group: any) => {
        const processedGroup = { ...group };
        
        // Calculate percentages
        if (processedGroup.totalAmount > 0) {
          processedGroup.successVolumePercent = (processedGroup.successAmount / processedGroup.totalAmount) * 100;
          processedGroup.failureVolumePercent = (processedGroup.failureAmount / processedGroup.totalAmount) * 100;
          processedGroup.refundVolumePercent = (processedGroup.refundAmount / processedGroup.totalAmount) * 100;
        } else {
          processedGroup.successVolumePercent = 0;
          processedGroup.failureVolumePercent = 0;
          processedGroup.refundVolumePercent = 0;
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

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

  // Define color mapping for statuses
  const statusColors = {
    success: "#10B981", // green
    failure: "#EF4444", // red
    refund: "#F59E0B",  // amber
    total: "#6366F1"    // indigo
  };

  // Determine which lines to show based on selected metrics and statuses
  const getLinesToShow = () => {
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
          {yAxisMetric === "percentVolume" 
            ? "Payment volume percentage trends over time" 
            : "Order count trends over time"}
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
