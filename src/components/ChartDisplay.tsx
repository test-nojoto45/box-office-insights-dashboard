
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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import PaymentLineChart from "@/components/PaymentLineChart";
import PaymentPieChart from "@/components/PaymentPieChart";

interface ChartDisplayProps {
  data: any[];
  viewType: string;
  paymentStatuses: string[];
  emiTypes: string[];
  onRefresh?: () => void;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  data, 
  viewType, 
  paymentStatuses, 
  emiTypes,
  onRefresh 
}) => {
  // State for y-axis metric
  const [yAxisMetric, setYAxisMetric] = React.useState<"percentVolume" | "orderCount">("percentVolume");
  
  // Check if we should show pie chart (when only failure status is selected)
  const showPieChart = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  if (showPieChart) {
    return (
      <div className="space-y-6">
        {/* Payment Trends Chart */}
        <Card className="p-6 shadow-sm border-slate-200">
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">Payment Trends</h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="y-axis-metric" className="text-sm text-slate-600">Y-Axis Metric:</Label>
                    <Select
                      value={yAxisMetric}
                      onValueChange={(value: "percentVolume" | "orderCount") => setYAxisMetric(value)}
                    >
                      <SelectTrigger className="w-[180px] border-slate-300 bg-white">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentVolume">Percentage of Volume</SelectItem>
                        <SelectItem value="orderCount">Number of Orders</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>
          </div>
          
          <div className="h-[400px]">
            <PaymentLineChart 
              data={data} 
              viewType={viewType} 
              yAxisMetric={yAxisMetric}
              paymentStatuses={paymentStatuses}
            />
          </div>
        </Card>

        {/* Failure Reasons Pie Chart */}
        <PaymentPieChart data={data} paymentStatuses={paymentStatuses} />
      </div>
    );
  }
  
  return (
    <Card className="p-6 shadow-sm border-slate-200">
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Payment Analytics</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="y-axis-metric" className="text-sm text-slate-600">Y-Axis Metric:</Label>
                <Select
                  value={yAxisMetric}
                  onValueChange={(value: "percentVolume" | "orderCount") => setYAxisMetric(value)}
                >
                  <SelectTrigger className="w-[180px] border-slate-300 bg-white">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentVolume">Percentage of Volume</SelectItem>
                    <SelectItem value="orderCount">Number of Orders</SelectItem>
                  </SelectContent>
                </Select>
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
        </div>
      </div>
      
      <div className="h-[400px]">
        <PaymentLineChart 
          data={data} 
          viewType={viewType} 
          yAxisMetric={yAxisMetric}
          paymentStatuses={paymentStatuses}
        />
      </div>
    </Card>
  );
};

export default ChartDisplay;
