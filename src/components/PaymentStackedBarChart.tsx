import React, { useMemo } from "react";
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

interface PaymentStackedBarChartProps {
  data: any[];
  viewType: string;
  yAxisMetric: "percentVolume" | "orderCount";
  paymentStatuses?: string[];
  paymentMethods?: string[];
  emiTypes?: string[];
  cardTypes?: string[];
}

const PaymentStackedBarChart: React.FC<PaymentStackedBarChartProps> = ({ 
  data,
  viewType,
  yAxisMetric,
  paymentStatuses = ["success", "failure"],
  paymentMethods = [],
  emiTypes = [],
  cardTypes = []
}) => {
  // Color mapping for different payment methods, gateways, and types
  const colors = {
    success: "#10B981",
    failure: "#EF4444",
    refund: "#F59E0B",
    
    // Payment Methods
    creditCard: "#8B5CF6",
    debitCard: "#EC4899",
    netBanking: "#0EA5E9",
    upi: "#14B8A6",
    wallet: "#F97316",
    emi: "#EF4444",
    cards: "#9333EA",
    
    // EMI Types
    standard: "#8B5CF6",
    noCost: "#EC4899",
    shopse: "#0EA5E9",
    
    // Card Types
    visa: "#1A365D",
    mastercard: "#FF5F00",
    rupay: "#0078D4",
    amex: "#006FCF",
    
    // Gateways
    Razorpay: "#3B82F6",
    PayU: "#10B981"
  };

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
          totalCount: 0,
          statusData: {},
          methodData: {},
          gatewayData: {},
          emiData: {},
          cardData: {}
        };
      }
      
      acc[dateStr].totalAmount += item.amount;
      acc[dateStr].totalCount += 1;
      
      // Track status data
      const status = item.status;
      if (!acc[dateStr].statusData[status]) {
        acc[dateStr].statusData[status] = { amount: 0, count: 0 };
      }
      acc[dateStr].statusData[status].amount += item.amount;
      acc[dateStr].statusData[status].count += 1;
      
      // Track method data with card bifurcation
      if (viewType === "method") {
        let method = item.paymentMethod;
        
        // Handle cards grouping vs bifurcation
        if (paymentMethods.includes("cards") && !cardTypes.length && 
            (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
          method = "cards";
        }
        
        // If card types are selected, show individual card types for card methods
        if (cardTypes.length > 0 && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
          const cardType = item.cardType || "unknown";
          method = `${item.paymentMethod}_${cardType}`;
        }
        
        // Handle EMI bifurcation
        if (item.paymentMethod === "emi" && emiTypes.length > 0) {
          const emiType = item.emiType || "standard";
          method = `emi_${emiType}`;
        }
        
        if (!acc[dateStr].methodData[method]) {
          acc[dateStr].methodData[method] = { amount: 0, count: 0 };
        }
        acc[dateStr].methodData[method].amount += item.amount;
        acc[dateStr].methodData[method].count += 1;
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
        
        // Process based on view type
        if (viewType === "method") {
          Object.keys(processedGroup.methodData).forEach(method => {
            const methodData = processedGroup.methodData[method];
            if (yAxisMetric === "percentVolume") {
              processedGroup[method] = processedGroup.totalAmount > 0 
                ? (methodData.amount / processedGroup.totalAmount) * 100 
                : 0;
            } else {
              processedGroup[method] = methodData.count;
            }
          });
        } else if (viewType === "gateway") {
          Object.keys(processedGroup.gatewayData).forEach(gateway => {
            const gatewayData = processedGroup.gatewayData[gateway];
            if (yAxisMetric === "percentVolume") {
              processedGroup[gateway] = processedGroup.totalAmount > 0 
                ? (gatewayData.amount / processedGroup.totalAmount) * 100 
                : 0;
            } else {
              processedGroup[gateway] = gatewayData.count;
            }
          });
        } else {
          // Status view
          Object.keys(processedGroup.statusData).forEach(status => {
            const statusData = processedGroup.statusData[status];
            if (yAxisMetric === "percentVolume") {
              processedGroup[status] = processedGroup.totalAmount > 0 
                ? (statusData.amount / processedGroup.totalAmount) * 100 
                : 0;
            } else {
              processedGroup[status] = statusData.count;
            }
          });
        }
        
        return processedGroup;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, viewType, yAxisMetric, paymentMethods, emiTypes, cardTypes]);

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

  // Format names for display
  const formatStackName = (key: string) => {
    if (key.includes("_")) {
      const [method, type] = key.split("_");
      if (method === "creditCard" || method === "debitCard") {
        const methodName = method === "creditCard" ? "Credit Card" : "Debit Card";
        return `${methodName} (${type.toUpperCase()})`;
      }
      if (method === "emi") {
        const emiTypeNames = {
          standard: "Standard EMI",
          noCost: "No Cost EMI",
          shopse: "Shopse"
        };
        return `EMI (${emiTypeNames[type] || type})`;
      }
    }
    
    const methodNames = {
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      netBanking: "Net Banking",
      upi: "UPI",
      wallet: "Wallet",
      emi: "EMI",
      cards: "Cards",
      success: "Success",
      failure: "Failure",
      refund: "Refund"
    };
    
    return methodNames[key] || key;
  };

  // Get color for stack
  const getStackColor = (key: string) => {
    if (key.includes("_")) {
      const [method, type] = key.split("_");
      return colors[type as keyof typeof colors] || colors[method as keyof typeof colors] || "#666";
    }
    return colors[key as keyof typeof colors] || "#666";
  };

  // Determine which stacks to show
  const getStacksToShow = () => {
    if (viewType === "method") {
      const methods = Array.from(
        new Set(data.map(item => {
          let method = item.paymentMethod;
          
          // Handle cards grouping vs bifurcation
          if (paymentMethods.includes("cards") && !cardTypes.length && 
              (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
            method = "cards";
          }
          
          // If card types are selected, show individual card types
          if (cardTypes.length > 0 && (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
            const cardType = item.cardType || "unknown";
            method = `${item.paymentMethod}_${cardType}`;
          }
          
          // Handle EMI bifurcation
          if (item.paymentMethod === "emi" && emiTypes.length > 0) {
            const emiType = item.emiType || "standard";
            method = `emi_${emiType}`;
          }
          
          return method;
        }))
      );
      
      // Filter based on selected payment methods
      let filteredMethods = methods;
      if (paymentMethods.length > 0) {
        filteredMethods = methods.filter(method => {
          if (method.includes("_")) {
            const [baseMethod] = method.split("_");
            return paymentMethods.includes(baseMethod) || paymentMethods.includes("cards");
          }
          return paymentMethods.includes(method);
        });
      }
      
      return filteredMethods;
    } else if (viewType === "gateway") {
      return Array.from(new Set(data.map(item => item.paymentGateway)));
    } else {
      return paymentStatuses.filter(status => 
        data.some(item => item.status === status)
      );
    }
  };

  const stacksToShow = getStacksToShow();

  // Y-axis configuration
  const yAxisConfig = {
    domain: yAxisMetric === "percentVolume" ? [0, 100] : ['auto', 'auto'],
    label: yAxisMetric === "percentVolume" ? "Percentage of Volume" : "Number of Orders"
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
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
          domain={yAxisConfig.domain}
          label={{ 
            value: yAxisConfig.label, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          stroke="#64748b"
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number) => 
            yAxisMetric === "percentVolume" ? `${value.toFixed(1)}%` : value.toString()
          }
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
        
        {stacksToShow.map((stack) => (
          <Bar
            key={stack}
            dataKey={stack}
            stackId="stack"
            fill={getStackColor(stack)}
            name={formatStackName(stack)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentStackedBarChart;
