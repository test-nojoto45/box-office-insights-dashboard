
import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card } from "@/components/ui/card";
import { processChartData } from "@/utils/chartDataProcessor";
import { getBarsToShow, getYAxisConfig } from "@/utils/chartConfig";
import DrillDownControls from "@/components/DrillDownControls";

interface PaymentStackedBarChartProps {
  data: any[];
  viewType: string;
  yAxisMetric: "percentVolume" | "orderCount";
  paymentStatuses?: string[];
  paymentMethods?: string[];
}

const PaymentStackedBarChart: React.FC<PaymentStackedBarChartProps> = ({ 
  data,
  viewType,
  yAxisMetric,
  paymentStatuses = ["success", "failure"],
  paymentMethods = []
}) => {
  // State for drill-down functionality (only for EMI and cards)
  const [drillDownMethod, setDrillDownMethod] = useState<string | null>(null);

  console.log("PaymentStackedBarChart received data:", data);
  console.log("PaymentStackedBarChart props:", { 
    dataLength: data?.length, 
    viewType, 
    yAxisMetric, 
    paymentStatuses, 
    paymentMethods 
  });

  // Prepare the data for the stacked bar chart
  const chartData = useMemo(() => {
    console.log("Processing chart data with:", { data: data?.length, viewType, drillDownMethod });
    const processed = processChartData(data, viewType, drillDownMethod);
    console.log("Processed chart data result:", processed);
    return processed;
  }, [data, viewType, drillDownMethod]);

  // Empty state check
  if (!data || data.length === 0) {
    console.log("No data available for chart");
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    console.log("No chart data could be processed");
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No chart data could be processed from the available data</p>
          <p className="text-sm text-gray-500 mt-2">
            Raw data length: {data.length}, View type: {viewType}
          </p>
        </div>
      </Card>
    );
  }

  // Handle bar click for drill-down (only for EMI and cards)
  const handleBarClick = (entry: any) => {
    console.log("Bar clicked:", entry);
    if (viewType === "method" && !drillDownMethod) {
      // Get the active dataKey from the bar that was clicked
      const activeDataKey = entry.activeLabel || entry.dataKey;
      console.log("Active data key:", activeDataKey);
      
      // Check if we can determine the method from the chart data
      const clickedData = entry.activePayload;
      if (clickedData && clickedData.length > 0) {
        // Look for cards or emi in the payload
        const hasCards = clickedData.some((item: any) => 
          item.dataKey && (item.dataKey.includes('cards') || item.dataKey.includes('Card'))
        );
        const hasEmi = clickedData.some((item: any) => 
          item.dataKey && item.dataKey.includes('emi')
        );
        
        console.log("Has cards:", hasCards, "Has emi:", hasEmi);
        
        if (hasCards) {
          setDrillDownMethod('cards');
        } else if (hasEmi) {
          setDrillDownMethod('emi');
        }
      }
    }
  };

  const barsToShow = getBarsToShow(viewType, drillDownMethod, yAxisMetric, data, paymentStatuses);
  console.log("Bars to show:", barsToShow);

  const yAxisConfig = getYAxisConfig(yAxisMetric);

  // Add validation for bars
  if (!barsToShow || barsToShow.length === 0) {
    console.log("No bars to show");
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No bars configured for display</p>
          <p className="text-sm text-gray-500 mt-2">
            View type: {viewType}, Drill down: {drillDownMethod || 'none'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <DrillDownControls 
        drillDownMethod={drillDownMethod}
        onBack={() => setDrillDownMethod(null)}
      />

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20
          }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              try {
                return format(new Date(tick), "MMM dd");
              } catch (e) {
                console.error("Date formatting error:", e, tick);
                return tick;
              }
            }}
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
            labelFormatter={(label) => {
              try {
                return format(new Date(label), "MMM dd, yyyy");
              } catch (e) {
                console.error("Tooltip date formatting error:", e, label);
                return label;
              }
            }}
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
          
          {barsToShow.map((bar) => (
            <Bar
              key={bar.id}
              dataKey={bar.dataKey}
              stackId="a"
              fill={bar.fill}
              name={bar.name}
              style={{ 
                cursor: viewType === "method" && !drillDownMethod && (bar.id === "cards" || bar.id === "emi") 
                  ? "pointer" 
                  : "default" 
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentStackedBarChart;
