
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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  // Prepare the data for the stacked bar chart
  const chartData = useMemo(() => {
    // Group data by date
    const dateGroups = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalAmount: 0,
          successAmount: 0,
          failureAmount: 0,
          refundAmount: 0,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          refundCount: 0,
          methodData: {},
          gatewayData: {},
          cardTypeData: {},
          emiTypeData: {}
        };
      }
      
      // Increment totals
      acc[dateStr].totalAmount += item.amount;
      acc[dateStr].totalCount += 1;
      
      // Status-specific tracking
      if (item.status === "success") {
        acc[dateStr].successAmount += item.amount;
        acc[dateStr].successCount += 1;
      } else if (item.status === "failure") {
        acc[dateStr].failureAmount += item.amount;
        acc[dateStr].failureCount += 1;
      }
      
      if (item.isRefunded) {
        acc[dateStr].refundAmount += item.amount;
        acc[dateStr].refundCount += 1;
      }
      
      // Track data based on view type and drill-down state
      if (viewType === "method") {
        if (drillDownMethod === "cards" && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
          // Drill-down for card types
          const cardType = item.paymentMethod;
          if (!acc[dateStr].cardTypeData[cardType]) {
            acc[dateStr].cardTypeData[cardType] = { amount: 0, count: 0 };
          }
          acc[dateStr].cardTypeData[cardType].amount += item.amount;
          acc[dateStr].cardTypeData[cardType].count += 1;
        } else if (drillDownMethod === "emi" && item.paymentMethod === "emi") {
          // Drill-down for EMI types
          const emiType = item.emiType || "unknown";
          if (!acc[dateStr].emiTypeData[emiType]) {
            acc[dateStr].emiTypeData[emiType] = { amount: 0, count: 0 };
          }
          acc[dateStr].emiTypeData[emiType].amount += item.amount;
          acc[dateStr].emiTypeData[emiType].count += 1;
        } else if (!drillDownMethod) {
          // Normal method view
          let method = item.paymentMethod;
          if (paymentMethods.includes("cards") && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
            method = "cards";
          }
          
          if (!acc[dateStr].methodData[method]) {
            acc[dateStr].methodData[method] = { amount: 0, count: 0 };
          }
          acc[dateStr].methodData[method].amount += item.amount;
          acc[dateStr].methodData[method].count += 1;
        }
      } else if (viewType === "gateway") {
        const gateway = item.paymentGateway;
        if (!acc[dateStr].gatewayData[gateway]) {
          acc[dateStr].gatewayData[gateway] = { amount: 0, count: 0 };
        }
        acc[dateStr].gatewayData[gateway].amount += item.amount;
        acc[dateStr].gatewayData[gateway].count += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and process data
    return Object.values(dateGroups)
      .map((group: any) => {
        const processedGroup = { ...group };
        
        // Calculate percentages for status view
        if (processedGroup.totalAmount > 0) {
          processedGroup.successVolumePercent = (processedGroup.successAmount / processedGroup.totalAmount) * 100;
          processedGroup.failureVolumePercent = (processedGroup.failureAmount / processedGroup.totalAmount) * 100;
          processedGroup.refundVolumePercent = (processedGroup.refundAmount / processedGroup.totalAmount) * 100;
        } else {
          processedGroup.successVolumePercent = 0;
          processedGroup.failureVolumePercent = 0;
          processedGroup.refundVolumePercent = 0;
        }
        
        // Calculate percentages based on current view
        if (viewType === "method") {
          if (drillDownMethod === "cards") {
            // Process card type data
            const cardTypes = Object.keys(processedGroup.cardTypeData);
            cardTypes.forEach(cardType => {
              const cardData = processedGroup.cardTypeData[cardType];
              if (processedGroup.totalAmount > 0) {
                processedGroup[`${cardType}VolumePercent`] = (cardData.amount / processedGroup.totalAmount) * 100;
              } else {
                processedGroup[`${cardType}VolumePercent`] = 0;
              }
              processedGroup[`${cardType}Count`] = cardData.count;
            });
          } else if (drillDownMethod === "emi") {
            // Process EMI type data
            const emiTypes = Object.keys(processedGroup.emiTypeData);
            emiTypes.forEach(emiType => {
              const emiData = processedGroup.emiTypeData[emiType];
              if (processedGroup.totalAmount > 0) {
                processedGroup[`${emiType}VolumePercent`] = (emiData.amount / processedGroup.totalAmount) * 100;
              } else {
                processedGroup[`${emiType}VolumePercent`] = 0;
              }
              processedGroup[`${emiType}Count`] = emiData.count;
            });
          } else {
            // Normal method processing
            const methods = Object.keys(processedGroup.methodData);
            methods.forEach(method => {
              const methodData = processedGroup.methodData[method];
              if (processedGroup.totalAmount > 0) {
                processedGroup[`${method}VolumePercent`] = (methodData.amount / processedGroup.totalAmount) * 100;
              } else {
                processedGroup[`${method}VolumePercent`] = 0;
              }
              processedGroup[`${method}Count`] = methodData.count;
            });
          }
        } else if (viewType === "gateway") {
          const gateways = Object.keys(processedGroup.gatewayData);
          gateways.forEach(gateway => {
            const gatewayData = processedGroup.gatewayData[gateway];
            if (processedGroup.totalAmount > 0) {
              processedGroup[`${gateway}VolumePercent`] = (gatewayData.amount / processedGroup.totalAmount) * 100;
            } else {
              processedGroup[`${gateway}VolumePercent`] = 0;
            }
            processedGroup[`${gateway}Count`] = gatewayData.count;
          });
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, viewType, paymentMethods, drillDownMethod]);

  // Empty state check
  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p>No data available for the selected filters</p>
        </div>
      </Card>
    );
  }

  // Define color mapping
  const colors = {
    success: "#10B981",
    failure: "#EF4444",
    refund: "#F59E0B",
    total: "#6366F1",
    creditCard: "#8B5CF6",
    debitCard: "#EC4899",
    netBanking: "#0EA5E9",
    upi: "#14B8A6",
    wallet: "#F97316",
    emi: "#8B5CF6",
    cards: "#9333EA",
    standard: "#10B981",
    noCost: "#F59E0B",
    shopse: "#EF4444",
    Razorpay: "#3B82F6",
    PayU: "#10B981"
  };

  // Format names for display
  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      case "emi": return "EMI";
      case "cards": return "Cards";
      case "standard": return "Standard EMI";
      case "noCost": return "No Cost EMI";
      case "shopse": return "Shopse";
      default: return method;
    }
  };

  // Handle bar click for drill-down
  const handleBarClick = (data: any, index: number) => {
    if (viewType === "method" && !drillDownMethod) {
      // Check if clicked bar is cards or emi
      const clickedMethod = Object.keys(data).find(key => 
        key.endsWith('VolumePercent') || key.endsWith('Count')
      )?.replace('VolumePercent', '').replace('Count', '');
      
      if (clickedMethod === 'cards' || clickedMethod === 'emi') {
        setDrillDownMethod(clickedMethod);
      }
    }
  };

  // Get bars to show based on current state
  const getBarsToShow = () => {
    if (viewType === "method") {
      if (drillDownMethod === "cards") {
        // Show card sub-types
        const cardTypes = ["creditCard", "debitCard"];
        if (yAxisMetric === "percentVolume") {
          return cardTypes.map(type => ({
            id: type,
            dataKey: `${type}VolumePercent`,
            fill: colors[type] || "#666",
            name: `${formatMethodName(type)} Volume %`,
            visible: true
          }));
        } else {
          return cardTypes.map(type => ({
            id: type,
            dataKey: `${type}Count`,
            fill: colors[type] || "#666",
            name: `${formatMethodName(type)} Orders`,
            visible: true
          }));
        }
      } else if (drillDownMethod === "emi") {
        // Show EMI sub-types
        const emiTypes = Array.from(
          new Set(data.filter(item => item.emiType).map(item => item.emiType))
        );
        if (yAxisMetric === "percentVolume") {
          return emiTypes.map(type => ({
            id: type,
            dataKey: `${type}VolumePercent`,
            fill: colors[type] || "#666",
            name: `${formatMethodName(type)} Volume %`,
            visible: true
          }));
        } else {
          return emiTypes.map(type => ({
            id: type,
            dataKey: `${type}Count`,
            fill: colors[type] || "#666",
            name: `${formatMethodName(type)} Orders`,
            visible: true
          }));
        }
      } else {
        // Normal method view
        let paymentMethodsToShow = Array.from(
          new Set(data.map(item => {
            if (paymentMethods.includes("cards") && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
              return "cards";
            }
            return item.paymentMethod;
          }))
        );
        
        if (paymentMethods.length > 0) {
          const expandedMethods = [];
          for (const method of paymentMethods) {
            if (method === "cards") {
              expandedMethods.push("cards");
            } else {
              expandedMethods.push(method);
            }
          }
          paymentMethodsToShow = paymentMethodsToShow.filter(method => expandedMethods.includes(method));
        }
        
        if (yAxisMetric === "percentVolume") {
          return paymentMethodsToShow.map(method => ({
            id: method,
            dataKey: `${method}VolumePercent`,
            fill: colors[method] || "#666",
            name: `${formatMethodName(method)} Volume %`,
            visible: true
          }));
        } else {
          return paymentMethodsToShow.map(method => ({
            id: method,
            dataKey: `${method}Count`,
            fill: colors[method] || "#666",
            name: `${formatMethodName(method)} Orders`,
            visible: true
          }));
        }
      }
    } 
    // Gateway view
    else if (viewType === "gateway") {
      const gateways = Array.from(
        new Set(data.map(item => item.paymentGateway))
      );
      
      if (yAxisMetric === "percentVolume") {
        return gateways.map(gateway => ({
          id: gateway,
          dataKey: `${gateway}VolumePercent`,
          fill: colors[gateway] || "#666",
          name: `${gateway} Volume %`,
          visible: true
        }));
      } else {
        return gateways.map(gateway => ({
          id: gateway,
          dataKey: `${gateway}Count`,
          fill: colors[gateway] || "#666",
          name: `${gateway} Orders`,
          visible: true
        }));
      }
    }
    else {
      switch (yAxisMetric) {
        case "percentVolume":
          return [
            { 
              id: "success", 
              dataKey: "successVolumePercent", 
              fill: colors.success, 
              name: "Success Volume %",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureVolumePercent", 
              fill: colors.failure, 
              name: "Failure Volume %",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundVolumePercent", 
              fill: colors.refund, 
              name: "Refund Volume %",
              visible: paymentStatuses.includes("refund")
            }
          ].filter(bar => bar.visible);
          
        case "orderCount":
          return [
            { 
              id: "success", 
              dataKey: "successCount", 
              fill: colors.success, 
              name: "Successful Orders",
              visible: paymentStatuses.includes("success")
            },
            { 
              id: "failure", 
              dataKey: "failureCount", 
              fill: colors.failure, 
              name: "Failed Orders",
              visible: paymentStatuses.includes("failure")
            },
            { 
              id: "refund", 
              dataKey: "refundCount", 
              fill: colors.refund, 
              name: "Refunded Orders",
              visible: paymentStatuses.includes("refund")
            }
          ].filter(bar => bar.visible);
          
        default:
          return [];
      }
    }
  };

  const barsToShow = getBarsToShow();

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

  return (
    <div className="space-y-4">
      {/* Back button when in drill-down mode */}
      {drillDownMethod && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrillDownMethod(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {formatMethodName(drillDownMethod)} Overview
          </Button>
          <span className="text-sm text-gray-600">
            Showing {formatMethodName(drillDownMethod)} breakdown
          </span>
        </div>
      )}

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
