
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
}

const PaymentLineChart: React.FC<PaymentLineChartProps> = ({ 
  data,
  yAxisMetric
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
      .map(group => {
        const processedGroup = { ...group } as any;
        
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

  // Determine y-axis configuration based on selected metric
  const getYAxisConfig = () => {
    switch (yAxisMetric) {
      case "percentVolume":
        return {
          lines: [
            { dataKey: "successVolumePercent", stroke: "#10B981", name: "Success Volume %" },
            { dataKey: "failureVolumePercent", stroke: "#EF4444", name: "Failure Volume %" },
            { dataKey: "refundVolumePercent", stroke: "#F59E0B", name: "Refund Volume %" }
          ],
          yAxisDomain: [0, 100],
          yAxisLabel: "Percentage of Volume",
          tooltipFormatter: (value: number) => `${value.toFixed(1)}%`
        };
        
      case "orderCount":
        return {
          lines: [
            { dataKey: "totalCount", stroke: "#6366F1", name: "Total Orders" },
            { dataKey: "successCount", stroke: "#10B981", name: "Successful Orders" },
            { dataKey: "failureCount", stroke: "#EF4444", name: "Failed Orders" },
            { dataKey: "refundCount", stroke: "#F59E0B", name: "Refunded Orders" }
          ],
          yAxisDomain: ['auto', 'auto'],
          yAxisLabel: "Number of Orders",
          tooltipFormatter: (value: number) => value.toString()
        };
        
      default:
        return {
          lines: [
            { dataKey: "successVolumePercent", stroke: "#10B981", name: "Success Volume %" }
          ],
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
            
            {yAxisConfig.lines.map((line, index) => (
              <Line
                key={index}
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
