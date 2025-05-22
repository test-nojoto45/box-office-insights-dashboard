
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
import PaymentBarChart from "@/components/PaymentBarChart";
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
  // State for y-axis metric (removed chart type state)
  const [yAxisMetric, setYAxisMetric] = React.useState<"percentVolume" | "orderCount">("percentVolume");
  
  // Check if we should show pie chart (when only failure status is selected)
  const showPieChart = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  if (showPieChart) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <PaymentPieChart data={data} paymentStatuses={paymentStatuses} />
      </div>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Payment Analytics</h2>
            
            <div className="flex items-center space-x-4">
              {/* Removed chart type dropdown */}
              
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh} 
                className="flex items-center gap-2"
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
