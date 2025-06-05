
import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card } from "@/components/ui/card";

// Define interfaces for our data
interface FailureReason {
  reason: string;
  count: number;
  color: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChartDataItem;
  }>;
}

interface PaymentPieChartProps {
  data: any[];
  paymentStatuses: string[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded-md shadow">
        <p className="font-medium">{data.name}</p>
        <p>{`Count: ${data.value}`}</p>
        <p>{`Percentage: ${((data.value / payload.reduce((sum, entry) => sum + (entry.value || 0), 0)) * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

// Main component
const PaymentPieChart: React.FC<PaymentPieChartProps> = ({ data, paymentStatuses }) => {
  // Only show failures
  const showFailureChart = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  if (!showFailureChart) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>Select only "failure" status to view failure reasons chart</p>
        </div>
      </Card>
    );
  }
  
  // Extract failure data and count occurrences
  const failureReasons: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.status === "failure") {
      const reason = item.failureReason || "Other";
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    }
  });
  
  // Convert to array and sort by count (descending), then take top 5
  const sortedReasons = Object.entries(failureReasons)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Define colors for top 5 reasons
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
  
  // Format data for the pie chart
  const chartData: ChartDataItem[] = sortedReasons.map(([reason, count], index) => ({
    name: reason,
    value: count,
    color: colors[index] || "#FF9F40"
  }));
  
  // If no failure data
  if (chartData.length === 0) {
    return (
      <Card className="p-6 shadow-sm border-slate-200">
        <div className="text-center py-8">
          <p>No failure data available for the selected filters</p>
        </div>
      </Card>
    );
  }
  
  const totalFailures = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card className="p-6 shadow-sm border-slate-200">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Top 5 Failure Reasons</h2>
        <p className="text-sm text-slate-600">
          Distribution of payment failures by reason (showing top 5 only)
        </p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="text-sm font-medium">
              {item.value} ({((item.value / totalFailures) * 100).toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PaymentPieChart;
