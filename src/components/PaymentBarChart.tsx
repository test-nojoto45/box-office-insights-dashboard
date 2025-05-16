
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PaymentBarChartProps {
  data: any[];
  chartMetric: string;
}

const PaymentBarChart: React.FC<PaymentBarChartProps> = ({ data, chartMetric }) => {
  const chartData = useMemo(() => {
    // First group data by payment gateway
    const gatewayGroups = data.reduce((acc, item) => {
      const gateway = item.paymentGateway;
      
      if (!acc[gateway]) {
        acc[gateway] = {
          name: gateway,
          methods: {},
          totalAmount: 0,
          totalCount: 0,
          successCount: 0
        };
      }
      
      // Then group by payment method within each gateway
      const methodKey = item.paymentMethod;
      if (!acc[gateway].methods[methodKey]) {
        acc[gateway].methods[methodKey] = {
          name: methodKey,
          totalAmount: 0,
          successCount: 0,
          totalCount: 0
        };
      }
      
      // Update gateway level counts
      acc[gateway].totalAmount += item.amount;
      acc[gateway].totalCount += 1;
      if (item.status === "success") {
        acc[gateway].successCount += 1;
      }
      
      // Update method level counts
      acc[gateway].methods[methodKey].totalAmount += item.amount;
      acc[gateway].methods[methodKey].totalCount += 1;
      if (item.status === "success") {
        acc[gateway].methods[methodKey].successCount += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array with nested data structure for the chart
    return Object.values(gatewayGroups).map((gateway: any) => {
      const methods = Object.values(gateway.methods).map((method: any) => ({
        name: method.name,
        volume: method.totalAmount,
        successRate: method.totalCount > 0 ? (method.successCount / method.totalCount) * 100 : 0,
      }));
      
      return {
        name: gateway.name,
        volume: gateway.totalAmount,
        successRate: gateway.totalCount > 0 ? (gateway.successCount / gateway.totalCount) * 100 : 0,
        methods: methods
      };
    });
  }, [data]);

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

  // Custom tooltip to show payment method breakdown
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const gatewayData = chartData.find(g => g.name === label);
      
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-gray-600">
            {chartMetric === "volume" ? "Total Volume: " : "Success Rate: "}
            <span className="font-medium">
              {formatTooltip(payload[0].value)}
            </span>
          </p>
          
          <div className="mt-2">
            <p className="font-bold text-sm">Payment Methods:</p>
            <ul className="mt-1 space-y-1">
              {gatewayData?.methods.map((method: any, idx: number) => (
                <li key={idx} className="text-xs flex justify-between">
                  <span>{method.name}</span>
                  <span className="ml-4 font-medium">{formatTooltip(method[dataKey])}</span>
                </li>
              ))}
            </ul>
          </div>
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
