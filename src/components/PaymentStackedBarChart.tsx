
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
  ResponsiveContainer
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
  // State for drill-down functionality
  const [drillDownMethod, setDrillDownMethod] = useState<string | null>(null);

  // Debug logging
  console.log("PaymentStackedBarChart props:", { data: data?.length, viewType, yAxisMetric, paymentStatuses, paymentMethods });

  // Prepare the data for the stacked bar chart
  const chartData = useMemo(() => {
    return processChartData(data, viewType, drillDownMethod);
  }, [data, viewType, drillDownMethod]);

  // Empty state check
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No chart data could be processed from the available data</p>
        </div>
      </Card>
    );
  }

  // Handle bar click for drill-down
  const handleBarClick = (data: any, index: number) => {
    console.log("Bar clicked:", data, index);
    if (viewType === "method" && !drillDownMethod) {
      // Check if clicked bar is cards or emi
      const clickedMethod = Object.keys(data).find(key => 
        key.endsWith('VolumePercent') || key.endsWith('Count')
      )?.replace('VolumePercent', '').replace('Count', '');
      
      console.log("Clicked method:", clickedMethod);
      if (clickedMethod === 'cards' || clickedMethod === 'emi') {
        setDrillDownMethod(clickedMethod);
      }
    }
  };

  const barsToShow = getBarsToShow(viewType, drillDownMethod, yAxisMetric, data, paymentStatuses);
  console.log("Bars to show:", barsToShow);

  const yAxisConfig = getYAxisConfig(yAxisMetric);

  return (
    <div className="space-y-4">
      <DrillDownControls 
        drillDownMethod={drillDownMethod}
        onBack={() => setDrillDownMethod(null)}
      />

      <ResponsiveContainer width="100%" height="100%">
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
          
          {barsToShow.map((bar) => (
            <Bar
              key={bar.id}
              dataKey={bar.dataKey}
              stackId="a"
              fill={bar.fill}
              name={bar.name}
              style={{ cursor: viewType === "method" && !drillDownMethod && (bar.id === "cards" || bar.id === "emi") ? "pointer" : "default" }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentStackedBarChart;
