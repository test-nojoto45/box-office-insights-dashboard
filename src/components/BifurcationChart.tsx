
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  paymentMethods: string[];
  onRefresh?: () => void;
}

const BifurcationChart: React.FC<BifurcationChartProps> = ({ 
  data, 
  emiTypes, 
  cardTypes,
  paymentMethods,
  onRefresh 
}) => {
  // State for y-axis metric
  const [yAxisMetric, setYAxisMetric] = React.useState<"percentVolume" | "orderCount">("percentVolume");

  // Prepare chart data based on selected filters
  const chartData = React.useMemo(() => {
    // Group data by date
    const dateGroups = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalAmount: 0,
          totalCount: 0,
          // EMI types
          standardEmi: 0,
          noCostEmi: 0,
          shopseEmi: 0,
          standardEmiAmount: 0,
          noCostEmiAmount: 0,
          shopseEmiAmount: 0,
          // Card types (for both regular cards and EMI)
          creditCard: 0,
          debitCard: 0,
          creditCardAmount: 0,
          debitCardAmount: 0,
          // EMI card types
          emiCreditCard: 0,
          emiDebitCard: 0,
          emiCreditCardAmount: 0,
          emiDebitCardAmount: 0
        };
      }
      
      // Track totals for percentage calculations
      acc[dateStr].totalAmount += item.amount;
      acc[dateStr].totalCount += 1;
      
      // Count EMI types
      if (emiTypes.length > 0) {
        if (item.emiType === "standard") {
          acc[dateStr].standardEmi += 1;
          acc[dateStr].standardEmiAmount += item.amount;
        }
        if (item.emiType === "noCost") {
          acc[dateStr].noCostEmi += 1;
          acc[dateStr].noCostEmiAmount += item.amount;
        }
        if (item.emiType === "shopse") {
          acc[dateStr].shopseEmi += 1;
          acc[dateStr].shopseEmiAmount += item.amount;
        }
      }
      
      // Count card types
      if (cardTypes.length > 0) {
        // For regular card payments (when cards filter is selected and we want bifurcation)
        if (paymentMethods.includes("cards")) {
          if (item.paymentMethod === "creditCard" && cardTypes.includes("credit")) {
            acc[dateStr].creditCard += 1;
            acc[dateStr].creditCardAmount += item.amount;
          }
          if (item.paymentMethod === "debitCard" && cardTypes.includes("debit")) {
            acc[dateStr].debitCard += 1;
            acc[dateStr].debitCardAmount += item.amount;
          }
        }
        
        // For EMI payments with card type bifurcation
        if (paymentMethods.includes("emi") && item.paymentMethod === "emi") {
          if (item.cardType === "credit" && cardTypes.includes("credit")) {
            acc[dateStr].emiCreditCard += 1;
            acc[dateStr].emiCreditCardAmount += item.amount;
          }
          if (item.cardType === "debit" && cardTypes.includes("debit")) {
            acc[dateStr].emiDebitCard += 1;
            acc[dateStr].emiDebitCardAmount += item.amount;
          }
        }
      }
      
      return acc;
    }, {});
    
    return Object.values(dateGroups)
      .map((group: any) => {
        const processedGroup = { ...group };
        
        // Calculate percentages for each metric
        if (processedGroup.totalAmount > 0) {
          // EMI type percentages
          processedGroup.standardEmiPercent = (processedGroup.standardEmiAmount / processedGroup.totalAmount) * 100;
          processedGroup.noCostEmiPercent = (processedGroup.noCostEmiAmount / processedGroup.totalAmount) * 100;
          processedGroup.shopseEmiPercent = (processedGroup.shopseEmiAmount / processedGroup.totalAmount) * 100;
          
          // Card type percentages
          processedGroup.creditCardPercent = (processedGroup.creditCardAmount / processedGroup.totalAmount) * 100;
          processedGroup.debitCardPercent = (processedGroup.debitCardAmount / processedGroup.totalAmount) * 100;
          
          // EMI card type percentages
          processedGroup.emiCreditCardPercent = (processedGroup.emiCreditCardAmount / processedGroup.totalAmount) * 100;
          processedGroup.emiDebitCardPercent = (processedGroup.emiDebitCardAmount / processedGroup.totalAmount) * 100;
        } else {
          processedGroup.standardEmiPercent = 0;
          processedGroup.noCostEmiPercent = 0;
          processedGroup.shopseEmiPercent = 0;
          processedGroup.creditCardPercent = 0;
          processedGroup.debitCardPercent = 0;
          processedGroup.emiCreditCardPercent = 0;
          processedGroup.emiDebitCardPercent = 0;
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, emiTypes, cardTypes, paymentMethods]);

  // Define colors for different lines
  const colors = {
    standardEmi: "#3B82F6",
    noCostEmi: "#10B981", 
    shopseEmi: "#F59E0B",
    creditCard: "#8B5CF6",
    debitCard: "#EC4899",
    emiCreditCard: "#9333EA",
    emiDebitCard: "#F97316"
  };

  // Determine chart title and description
  const getChartInfo = () => {
    const hasEmiTypes = emiTypes.length > 0;
    const hasCardTypes = cardTypes.length > 0;
    const hasEmiMethod = paymentMethods.includes("emi");
    const hasCardsMethod = paymentMethods.includes("cards");
    
    if (hasEmiTypes && hasCardTypes && hasEmiMethod) {
      return {
        title: "EMI Type & Card Type Bifurcation",
        description: `${yAxisMetric === "percentVolume" ? "Volume percentage" : "Transaction count"} trends for selected EMI types and card types (including EMI card bifurcation)`
      };
    } else if (hasEmiTypes) {
      return {
        title: "EMI Type Bifurcation", 
        description: `${yAxisMetric === "percentVolume" ? "Volume percentage" : "Transaction count"} trends for selected EMI types`
      };
    } else if (hasCardTypes && hasEmiMethod) {
      return {
        title: "EMI Card Type Bifurcation",
        description: `${yAxisMetric === "percentVolume" ? "Volume percentage" : "Transaction count"} trends for EMI transactions by card type`
      };
    } else if (hasCardTypes && hasCardsMethod) {
      return {
        title: "Card Type Bifurcation",
        description: `${yAxisMetric === "percentVolume" ? "Volume percentage" : "Transaction count"} trends for selected card types`
      };
    } else {
      return {
        title: "Card Type Bifurcation",
        description: `${yAxisMetric === "percentVolume" ? "Volume percentage" : "Transaction count"} trends for selected card types`
      };
    }
  };

  const chartInfo = getChartInfo();

  // Determine y-axis configuration based on selected metric
  const getYAxisConfig = () => {
    switch (yAxisMetric) {
      case "percentVolume":
        return {
          yAxisDomain: [0, 100],
          yAxisLabel: "Percentage of Volume",
          tooltipFormatter: (value: number) => `${value.toFixed(1)}%`
        };
        
      case "orderCount":
        return {
          yAxisDomain: ['auto', 'auto'],
          yAxisLabel: "Number of Orders",
          tooltipFormatter: (value: number) => value.toString()
        };
        
      default:
        return {
          yAxisDomain: [0, 100],
          yAxisLabel: "Percentage",
          tooltipFormatter: (value: number) => `${value.toFixed(1)}%`
        };
    }
  };

  const yAxisConfig = getYAxisConfig();

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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="bifurcation-y-axis-metric" className="text-sm text-slate-600">Y-Axis Metric:</Label>
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
            
            {/* EMI Type Lines */}
            {emiTypes.includes("standard") && (
              <Line
                type="monotone"
                dataKey={yAxisMetric === "percentVolume" ? "standardEmiPercent" : "standardEmi"}
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
                dataKey={yAxisMetric === "percentVolume" ? "noCostEmiPercent" : "noCostEmi"}
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
                dataKey={yAxisMetric === "percentVolume" ? "shopseEmiPercent" : "shopseEmi"}
                stroke={colors.shopseEmi}
                activeDot={{ r: 6 }}
                name="Shopse"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            
            {/* Regular Card Type Lines - only show when cards method is selected and card types are selected */}
            {cardTypes.includes("credit") && paymentMethods.includes("cards") && (
              <Line
                type="monotone"
                dataKey={yAxisMetric === "percentVolume" ? "creditCardPercent" : "creditCard"}
                stroke={colors.creditCard}
                activeDot={{ r: 6 }}
                name="Credit Card"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {cardTypes.includes("debit") && paymentMethods.includes("cards") && (
              <Line
                type="monotone"
                dataKey={yAxisMetric === "percentVolume" ? "debitCardPercent" : "debitCard"}
                stroke={colors.debitCard}
                activeDot={{ r: 6 }}
                name="Debit Card"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            
            {/* EMI Card Type Lines - only show when EMI method is selected and card types are selected */}
            {cardTypes.includes("credit") && paymentMethods.includes("emi") && (
              <Line
                type="monotone"
                dataKey={yAxisMetric === "percentVolume" ? "emiCreditCardPercent" : "emiCreditCard"}
                stroke={colors.emiCreditCard}
                activeDot={{ r: 6 }}
                name="EMI Credit Card"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {cardTypes.includes("debit") && paymentMethods.includes("emi") && (
              <Line
                type="monotone"
                dataKey={yAxisMetric === "percentVolume" ? "emiDebitCardPercent" : "emiDebitCard"}
                stroke={colors.emiDebitCard}
                activeDot={{ r: 6 }}
                name="EMI Debit Card"
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
