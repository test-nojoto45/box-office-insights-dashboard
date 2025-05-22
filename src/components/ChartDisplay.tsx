
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PaymentBarChart from "@/components/PaymentBarChart";
import PaymentLineChart from "@/components/PaymentLineChart";
import PaymentPieChart from "@/components/PaymentPieChart";

interface ChartDisplayProps {
  data: any[];
  viewType: string;
  paymentStatuses: string[];
  emiTypes: string[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  data, 
  viewType, 
  paymentStatuses, 
  emiTypes 
}) => {
  // State for chart type and y-axis metric
  const [chartType, setChartType] = React.useState<"bar" | "line">("line");
  const [yAxisMetric, setYAxisMetric] = React.useState<"percentVolume" | "orderCount">("percentVolume");
  
  // Check if we should show pie chart (when only failure status is selected)
  const showPieChart = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  if (showPieChart) {
    return <PaymentPieChart data={data} paymentStatuses={paymentStatuses} />;
  }
  
  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Payment Analytics</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="chart-type">Chart Type:</Label>
                <Select
                  value={chartType}
                  onValueChange={(value: "bar" | "line") => setChartType(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select chart" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="y-axis-metric">Y-Axis Metric:</Label>
                <Select
                  value={yAxisMetric}
                  onValueChange={(value: "percentVolume" | "orderCount") => setYAxisMetric(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentVolume">Percentage of Volume</SelectItem>
                    <SelectItem value="orderCount">Number of Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[400px]">
        {chartType === "bar" ? (
          <PaymentBarChart 
            data={data} 
            viewType={viewType} 
            chartMetric="percentVolume"
            emiTypes={emiTypes}
            paymentStatuses={paymentStatuses} 
          />
        ) : (
          <PaymentLineChart 
            data={data} 
            yAxisMetric={yAxisMetric}
            paymentStatuses={paymentStatuses}  // Pass the selected payment statuses
          />
        )}
      </div>
    </Card>
  );
};

export default ChartDisplay;
