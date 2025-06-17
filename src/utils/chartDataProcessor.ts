
import { format } from "date-fns";

export interface ChartDataItem {
  date: string;
  totalAmount: number;
  successAmount: number;
  failureAmount: number;
  refundAmount: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  refundCount: number;
  methodData: Record<string, { amount: number; count: number }>;
  gatewayData: Record<string, { amount: number; count: number }>;
  cardTypeData: Record<string, { amount: number; count: number }>;
  emiTypeData: Record<string, { amount: number; count: number }>;
  [key: string]: any;
}

export const processChartData = (
  data: any[],
  viewType: string,
  drillDownMethod: string | null
): ChartDataItem[] => {
  console.log("Processing chart data, input data length:", data?.length);
  
  if (!data || data.length === 0) {
    console.log("No data available");
    return [];
  }

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
    acc[dateStr].totalAmount += item.amount || 0;
    acc[dateStr].totalCount += 1;
    
    // Status-specific tracking
    if (item.status === "success") {
      acc[dateStr].successAmount += item.amount || 0;
      acc[dateStr].successCount += 1;
    } else if (item.status === "failure") {
      acc[dateStr].failureAmount += item.amount || 0;
      acc[dateStr].failureCount += 1;
    }
    
    if (item.isRefunded) {
      acc[dateStr].refundAmount += item.amount || 0;
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
        acc[dateStr].cardTypeData[cardType].amount += item.amount || 0;
        acc[dateStr].cardTypeData[cardType].count += 1;
      } else if (drillDownMethod === "emi" && item.paymentMethod === "emi") {
        // Drill-down for EMI types
        const emiType = item.emiType || "unknown";
        if (!acc[dateStr].emiTypeData[emiType]) {
          acc[dateStr].emiTypeData[emiType] = { amount: 0, count: 0 };
        }
        acc[dateStr].emiTypeData[emiType].amount += item.amount || 0;
        acc[dateStr].emiTypeData[emiType].count += 1;
      } else if (!drillDownMethod) {
        // Normal method view
        let method = item.paymentMethod;
        if ((item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard")) {
          method = "cards";
        }
        
        if (!acc[dateStr].methodData[method]) {
          acc[dateStr].methodData[method] = { amount: 0, count: 0 };
        }
        acc[dateStr].methodData[method].amount += item.amount || 0;
        acc[dateStr].methodData[method].count += 1;
      }
    } else if (viewType === "gateway") {
      const gateway = item.paymentGateway;
      if (gateway && !acc[dateStr].gatewayData[gateway]) {
        acc[dateStr].gatewayData[gateway] = { amount: 0, count: 0 };
      }
      if (gateway) {
        acc[dateStr].gatewayData[gateway].amount += item.amount || 0;
        acc[dateStr].gatewayData[gateway].count += 1;
      }
    }
    
    return acc;
  }, {});
  
  // Convert to array and process data
  const processedData = Object.values(dateGroups)
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

  console.log("Processed chart data:", processedData);
  return processedData;
};
