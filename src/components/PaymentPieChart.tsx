
import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface PaymentPieChartProps {
  data: any[];
  viewType: string;
}

// Define CustomTooltipProps interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
  "#82CA9D", "#F66D44", "#6495ED", "#40E0D0", "#9370DB"
];

const PaymentPieChart: React.FC<PaymentPieChartProps> = ({ data, viewType }) => {
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

  // Group failure reasons
  const chartData = useMemo(() => {
    // Filter for failure transactions
    const failureData = data.filter(item => item.status === "failure" && item.failureReason);
    
    // Group by failure reason
    const groupedByReason = failureData.reduce((acc: any, item: any) => {
      const reason = item.failureReason || "Unknown";
      
      if (!acc[reason]) {
        acc[reason] = {
          name: reason,
          value: 0,
          count: 0,
          amount: 0,
          breakdown: {}
        };
      }
      
      acc[reason].count += 1;
      acc[reason].amount += item.amount;
      acc[reason].value += 1; // For pie chart
      
      // Track breakdown by gateway or method
      const breakdownKey = viewType === "gateway" ? 
        item.paymentGateway || "Unknown" : 
        item.paymentMethod || "Unknown";
      
      if (!acc[reason].breakdown[breakdownKey]) {
        acc[reason].breakdown[breakdownKey] = {
          count: 0,
          amount: 0
        };
      }
      
      acc[reason].breakdown[breakdownKey].count += 1;
      acc[reason].breakdown[breakdownKey].amount += item.amount;
      
      return acc;
    }, {});
    
    // Convert to array and sort by count
    const reasonsArray = Object.values(groupedByReason)
      .sort((a: any, b: any) => b.count - a.count);
    
    // Take top 5
    const top5 = reasonsArray.slice(0, 5);
    
    // If there are more than 5, create an "Others" category
    if (reasonsArray.length > 5) {
      const others = reasonsArray.slice(5).reduce((acc: any, item: any) => {
        acc.count += item.count;
        acc.amount += item.amount;
        acc.value += item.value;
        
        // Combine breakdown data
        Object.entries(item.breakdown).forEach(([key, value]: [string, any]) => {
          if (!acc.breakdown[key]) {
            acc.breakdown[key] = { count: 0, amount: 0 };
          }
          acc.breakdown[key].count += value.count;
          acc.breakdown[key].amount += value.amount;
        });
        
        return acc;
      }, {
        name: "Others",
        value: 0,
        count: 0,
        amount: 0,
        breakdown: {}
      });
      
      top5.push(others);
    }
    
    // Calculate percentages
    const total = top5.reduce((sum: number, item: any) => sum + item.count, 0);
    return top5.map(item => ({
      ...item,
      percentage: (item.count / total) * 100
    }));
  }, [data, viewType]);

  // Format for the tooltip
  const formatAmount = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} Lakhs`;
    } else {
      return `₹${value.toFixed(2)}`;
    }
  };

  // Custom tooltip
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>Count: {data.count} ({data.percentage.toFixed(1)}%)</p>
          <p>Amount: {formatAmount(data.amount)}</p>
          
          {Object.keys(data.breakdown).length > 0 && (
            <div className="mt-2 border-t pt-1 text-xs">
              <p className="font-medium">Breakdown:</p>
              {Object.entries(data.breakdown).map(([key, value]: [string, any]) => (
                <p key={key} className="ml-2">
                  {viewType === "method" ? formatMethodName(key) : key}: {value.count} ({formatAmount(value.amount)})
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter
  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 text-xs">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value} ({chartData[index].percentage.toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderCustomizedLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PaymentPieChart;
