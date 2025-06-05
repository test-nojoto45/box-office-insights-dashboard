
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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
import { format } from "date-fns";

interface BifurcationChartProps {
  data: any[];
  emiTypes: string[];
  cardTypes: string[];
  onRefresh?: () => void;
}

const BifurcationChart: React.FC<BifurcationChartProps> = ({ 
  data, 
  emiTypes, 
  cardTypes,
  onRefresh 
}) => {
  // Prepare chart data based on selected filters
  const chartData = React.useMemo(() => {
    // Group data by date
    const dateGroups = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          // EMI types
          standardEmi: 0,
          noCostEmi: 0,
          shopseEmi: 0,
          // Card types
          creditCard: 0,
          debitCard: 0
        };
      }
      
      // Count EMI types
      if (emiTypes.length > 0) {
        if (item.emiType === "standard") acc[dateStr].standardEmi += 1;
        if (item.emiType === "noCost") acc[dateStr].noCostEmi += 1;
        if (item.emiType === "shopse") acc[dateStr].shopseEmi += 1;
      }
      
      // Count card types
      if (cardTypes.length > 0) {
        if (item.paymentMethod === "creditCard") acc[dateStr].creditCard += 1;
        if (item.paymentMethod === "debitCard") acc[dateStr].debitCard += 1;
      }
      
      return acc;
    }, {});
    
    return Object.values(dateGroups)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, emiTypes, cardTypes]);

  // Define colors for different lines
  const colors = {
    standardEmi: "#3B82F6",
    noCostEmi: "#10B981", 
    shopseEmi: "#F59E0B",
    creditCard: "#8B5CF6",
    debitCard: "#EC4899"
  };

  // Determine chart title and description
  const getChartInfo = () => {
    if (emiTypes.length > 0 && cardTypes.length > 0) {
      return {
        title: "EMI Type & Card Type Bifurcation",
        description: "Transaction count trends for selected EMI types and card types"
      };
    } else if (emiTypes.length > 0) {
      return {
        title: "EMI Type Bifurcation", 
        description: "Transaction count trends for selected EMI types"
      };
    } else {
      return {
        title: "Card Type Bifurcation",
        description: "Transaction count trends for selected card types"
      };
    }
  };

  const chartInfo = getChartInfo();

  if (chartData.length === 0) {
    return (
      <Card className="p-6 shadow-sm border-slate-200">
        <div className="text-center py-8">
          <p>No data available for bifurcation chart</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border-slate-200">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{chartInfo.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{chartInfo.description}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="flex items-center gap-2 text-figma-blue-DEFAULT border-figma-blue-DEFAULT hover:bg-figma-blue-light/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
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
              label={{ 
                value: "Number of Transactions", 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number) => [value.toString(), '']}
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
            
            {/* EMI Type Lines */}
            {emiTypes.includes("standard") && (
              <Line
                type="monotone"
                dataKey="standardEmi"
                stroke={colors.standardEmi}
                activeDot={{ r: 6 }}
                name="Standard EMI"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {emiTypes.includes("noCost") && (
              <Line
                type="monotone"
                dataKey="noCostEmi"
                stroke={colors.noCostEmi}
                activeDot={{ r: 6 }}
                name="No Cost EMI"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {emiTypes.includes("shopse") && (
              <Line
                type="monotone"
                dataKey="shopseEmi"
                stroke={colors.shopseEmi}
                activeDot={{ r: 6 }}
                name="Shopse"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            
            {/* Card Type Lines */}
            {cardTypes.includes("credit") && (
              <Line
                type="monotone"
                dataKey="creditCard"
                stroke={colors.creditCard}
                activeDot={{ r: 6 }}
                name="Credit Card"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {cardTypes.includes("debit") && (
              <Line
                type="monotone"
                dataKey="debitCard"
                stroke={colors.debitCard}
                activeDot={{ r: 6 }}
                name="Debit Card"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BifurcationChart;
