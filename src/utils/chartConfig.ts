
export interface BarConfig {
  id: string;
  dataKey: string;
  fill: string;
  name: string;
  visible: boolean;
}

export interface YAxisConfig {
  yAxisDomain: any[];
  yAxisLabel: string;
  tooltipFormatter: (value: number) => string;
}

// Define color mapping
export const colors = {
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
export const formatMethodName = (method: string): string => {
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

// Get Y-axis configuration based on selected metric
export const getYAxisConfig = (yAxisMetric: string): YAxisConfig => {
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

// Get bars to show based on current state
export const getBarsToShow = (
  viewType: string,
  drillDownMethod: string | null,
  yAxisMetric: string,
  data: any[],
  paymentStatuses: string[]
): BarConfig[] => {
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
      const emiTypes = ["standard", "noCost", "shopse"];
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
      // Normal method view - get all unique payment methods from data
      const allMethods = Array.from(
        new Set(data.map(item => {
          if (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard") {
            return "cards";
          }
          return item.paymentMethod;
        }))
      );
      
      console.log("All methods found:", allMethods);
      
      if (yAxisMetric === "percentVolume") {
        return allMethods.map(method => ({
          id: method,
          dataKey: `${method}VolumePercent`,
          fill: colors[method] || "#666",
          name: `${formatMethodName(method)} Volume %`,
          visible: true
        }));
      } else {
        return allMethods.map(method => ({
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
      new Set(data.map(item => item.paymentGateway).filter(Boolean))
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
  // Status view
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
