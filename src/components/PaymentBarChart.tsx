
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PaymentBarChartProps {
  data: any[];
  viewType: string;
  chartMetric: string;
}

const PaymentBarChart: React.FC<PaymentBarChartProps> = ({ data, viewType, chartMetric }) => {
  const chartData = useMemo(() => {
    // Group data by gateway or method
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
      name: group.name,
      volume: group.totalAmount,
      successRate: group.totalCount > 0 ? (group.successCount / group.totalCount) * 100 : 0,
    }));
  }, [data, viewType]);

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
        <Tooltip formatter={(value: number) => formatTooltip(value)} />
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
