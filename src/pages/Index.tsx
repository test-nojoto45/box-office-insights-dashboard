
import { useEffect, useState } from "react";
import { Download, ChevronDown, Plus, X, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PaymentBarChart from "@/components/PaymentBarChart";
import AlertModal from "@/components/AlertModal";
import { format } from "date-fns";
import { mockData } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define type for the summary data
interface PaymentSummary {
  totalTransactions: number;
  successCount: number;
  failureCount: number;
  refundCount: number;
  totalVolume: number;
  refundVolume: number;
  emiType?: string; // Add emiType field to the summary
  paymentGateway?: string; // Add paymentGateway field for failure breakdown
}

const Index = () => {
  // State for filters
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 4, 1),
    to: new Date()
  });
  
  // Replace selectedLob with businessTypes (multi-select)
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  
  // Add LOB filter state
  const [lobs, setLobs] = useState<string[]>([]);
  
  // Convert other filters to multi-select
  const [paymentGateways, setPaymentGateways] = useState<string[]>([]);
  const [insurers, setInsurers] = useState<string[]>([]); // Changed from banks to insurers
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [emiTypes, setEmiTypes] = useState<string[]>([]);
  // Set "success" as the default selected payment status
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>(["success"]);
  
  // State for view toggle
  const [viewType, setViewType] = useState("gateway"); // "gateway" or "method"
  const [chartMetric, setChartMetric] = useState("volume"); // "volume" or "success"

  // State for alerts modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // State for export fields
  const [selectedExportFields, setSelectedExportFields] = useState({
    leadId: true,
    amount: true,
    utr: true,
    pg: true,
    method: true,
    status: true,
    date: true,
    lob: false,
  });

  // Filtered data based on current filters
  const [filteredData, setFilteredData] = useState(mockData);

  // Helper function to check if an array includes a value or is empty
  const includesOrEmpty = (arr: string[], value: string) => {
    return arr.length === 0 || arr.includes(value);
  };

  // Apply filters and update filtered data
  useEffect(() => {
    let filtered = [...mockData];
    
    // Apply each filter with multi-select logic
    filtered = filtered.filter(item => {
      // First, handle shopse as a special EMI type
      const shopseSelected = emiTypes.includes("shopse");
      
      // If shopse is selected, only apply LOB filter to shopse transactions
      if (shopseSelected && item.emiType === "shopse") {
        return includesOrEmpty(lobs, item.lob) && 
               includesOrEmpty(businessTypes, item.businessType) &&
               includesOrEmpty(paymentGateways, item.paymentGateway) &&
               includesOrEmpty(insurers, item.insurer) &&
               includesOrEmpty(paymentStatuses, item.status);
      }
      
      // If shopse is selected but this item is not shopse, exclude it
      if (shopseSelected && item.emiType !== "shopse") {
        return false;
      }
      
      // For non-shopse EMI types
      const emiSelected = emiTypes.length > 0 && !shopseSelected;
      const cardOrEmiSelected = paymentMethods.includes("creditCard") || 
                              paymentMethods.includes("debitCard") ||
                              paymentMethods.includes("emi");
      const isEmiCompatible = !emiSelected || 
        ((item.paymentMethod === "creditCard" || 
          item.paymentMethod === "debitCard" ||
          item.paymentMethod === "emi") && 
          includesOrEmpty(emiTypes, item.emiType) && 
          item.emiType !== "shopse");
      
      // If EMI types (other than shopse) are selected but no card/emi payment methods are selected, 
      // filter out non-compatible items
      if (emiSelected && !cardOrEmiSelected && 
          item.paymentMethod !== "creditCard" && 
          item.paymentMethod !== "debitCard" &&
          item.paymentMethod !== "emi") {
        return false;
      }
      
      return (
        includesOrEmpty(businessTypes, item.businessType) &&
        includesOrEmpty(lobs, item.lob) && // Add LOB filter check
        includesOrEmpty(paymentGateways, item.paymentGateway) &&
        includesOrEmpty(insurers, item.insurer) && // Changed from banks to insurers
        includesOrEmpty(paymentMethods, item.paymentMethod) &&
        isEmiCompatible &&
        includesOrEmpty(paymentStatuses, item.status)
      );
    });

    // Apply date range filter
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
    
    setFilteredData(filtered);
  }, [businessTypes, lobs, paymentGateways, insurers, paymentMethods, emiTypes, paymentStatuses, dateRange]);

  // Determine what chart metric options to show based on payment status
  const getChartMetricOptions = () => {
    const showFailures = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
    
    if (showFailures) {
      return (
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="volume">Volume Processed</TabsTrigger>
          <TabsTrigger value="success">Failure Percentage</TabsTrigger>
        </TabsList>
      );
    }
    
    return (
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="volume">Volume Processed</TabsTrigger>
        <TabsTrigger value="success">Percentage</TabsTrigger>
      </TabsList>
    );
  };

  // Calculate metrics
  const totalVolume = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const successCount = filteredData.filter(item => item.status === "success").length;
  const failureCount = filteredData.filter(item => item.status === "failure").length;
  const refundCount = filteredData.filter(item => item.isRefunded).length;
  
  const successPercentage = filteredData.length > 0 ? (successCount / filteredData.length) * 100 : 0;
  const failurePercentage = filteredData.length > 0 ? (failureCount / filteredData.length) * 100 : 0;
  const refundPercentage = successCount > 0 ? (refundCount / successCount) * 100 : 0;

  const refundVolume = filteredData
    .filter(item => item.isRefunded)
    .reduce((sum, item) => sum + item.amount, 0);

  // Format EMI type name for display
  const formatEmiTypeName = (emiType: string) => {
    switch (emiType) {
      case "standard": return "Standard EMI";
      case "noCost": return "No Cost EMI";
      case "shopse": return "Shopse";
      default: return "N/A";
    }
  };

  // Format payment method name for display
  const formatMethodName = (method: string) => {
    switch (method) {
      case "creditCard": return "Credit Card";
      case "debitCard": return "Debit Card";
      case "netBanking": return "Net Banking";
      case "upi": return "UPI";
      case "wallet": return "Wallet";
      case "emi": return "EMI";
      default: return method;
    }
  };

  // Modified to include EMI type and payment gateway in summary
  const prepareSummaryData = () => {
    const groupBy = viewType === "gateway" ? "paymentGateway" : "paymentMethod";
    const showFailures = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
    const shopseSelected = emiTypes.includes("shopse");
    
    // Create a summary object based on the view type (gateway or method)
    const summary: Record<string, PaymentSummary | Record<string, PaymentSummary>> = {};

    // Special case for shopse
    if (shopseSelected) {
      // Only include shopse transactions
      const shopseData = filteredData.filter(item => item.emiType === "shopse");
      
      // Group by payment method/gateway
      shopseData.forEach(item => {
        const key = item[groupBy];
        
        if (!summary[key]) {
          summary[key] = {
            totalTransactions: 0,
            successCount: 0,
            failureCount: 0,
            refundCount: 0,
            totalVolume: 0,
            refundVolume: 0,
            emiType: "shopse",
            paymentGateway: viewType === "method" ? item.paymentGateway : undefined
          };
        }
        
        const summaryItem = summary[key] as PaymentSummary;
        summaryItem.totalTransactions += 1;
        summaryItem.totalVolume += item.amount;
        
        if (item.status === "success") summaryItem.successCount += 1;
        if (item.status === "failure") summaryItem.failureCount += 1;
        if (item.isRefunded) {
          summaryItem.refundCount += 1;
          summaryItem.refundVolume += item.amount;
        }
      });
      
      return summary as Record<string, PaymentSummary>;
    }
    
    // Check if we need to group by EMI type
    const shouldGroupByEmi = emiTypes.length > 0 && 
      filteredData.some(item => item.emiType && emiTypes.includes(item.emiType) && item.emiType !== "shopse");

    if (shouldGroupByEmi) {
      // Group by payment method/gateway and then by EMI type
      filteredData.forEach(item => {
        const key = item[groupBy];
        
        // Skip non-card/emi items if EMI types are selected
        if (emiTypes.length > 0 && 
            item.paymentMethod !== "creditCard" && 
            item.paymentMethod !== "debitCard" &&
            item.paymentMethod !== "emi") {
          return;
        }
        
        // Skip items with no EMI type or not matching selected EMI types
        if (emiTypes.length > 0 && (!item.emiType || !emiTypes.includes(item.emiType) || item.emiType === "shopse")) {
          return;
        }

        if (!summary[key]) {
          summary[key] = {};
        }

        const emiType = item.emiType || "none";
        
        if (!summary[key][emiType]) {
          summary[key][emiType] = {
            totalTransactions: 0,
            successCount: 0,
            failureCount: 0,
            refundCount: 0,
            totalVolume: 0,
            refundVolume: 0,
            emiType,
            paymentGateway: viewType === "method" ? item.paymentGateway : undefined
          };
        }
        
        summary[key][emiType].totalTransactions += 1;
        summary[key][emiType].totalVolume += item.amount;
        
        if (item.status === "success") summary[key][emiType].successCount += 1;
        if (item.status === "failure") summary[key][emiType].failureCount += 1;
        if (item.isRefunded) {
          summary[key][emiType].refundCount += 1;
          summary[key][emiType].refundVolume += item.amount;
        }
      });

      // Flatten the nested structure for rendering
      const flattenedSummary: Record<string, PaymentSummary> = {};
      
      Object.entries(summary).forEach(([key, emiGroups]) => {
        Object.entries(emiGroups as Record<string, PaymentSummary>).forEach(([emiType, data]) => {
          const flatKey = `${key}-${emiType}`;
          flattenedSummary[flatKey] = {
            ...data,
            emiType
          };
        });
      });
      
      return flattenedSummary;
    } else if (showFailures && viewType === "method") {
      // For failure status with method view, include payment gateway information
      const failureData = filteredData.filter(item => item.status === "failure");
      
      failureData.forEach(item => {
        const key = item[groupBy];
        const gatewayKey = `${key}-${item.paymentGateway}`;
        
        // Create entry for method-gateway combination
        if (!summary[gatewayKey]) {
          summary[gatewayKey] = {
            totalTransactions: 0,
            successCount: 0,
            failureCount: 0,
            refundCount: 0,
            totalVolume: 0,
            refundVolume: 0,
            paymentGateway: item.paymentGateway
          };
        }
        
        const summaryItem = summary[gatewayKey] as PaymentSummary;
        summaryItem.totalTransactions += 1;
        summaryItem.totalVolume += item.amount;
        summaryItem.failureCount += 1;
      });
      
      return summary as Record<string, PaymentSummary>;
    } else {
      // Original grouping logic
      filteredData.forEach(item => {
        const key = item[groupBy];
        
        if (!summary[key]) {
          summary[key] = {
            totalTransactions: 0,
            successCount: 0,
            failureCount: 0,
            refundCount: 0,
            totalVolume: 0,
            refundVolume: 0,
            paymentGateway: viewType === "method" ? item.paymentGateway : undefined
          };
        }
        
        const summaryItem = summary[key] as PaymentSummary;
        summaryItem.totalTransactions += 1;
        summaryItem.totalVolume += item.amount;
        
        if (item.status === "success") summaryItem.successCount += 1;
        if (item.status === "failure") summaryItem.failureCount += 1;
        if (item.isRefunded) {
          summaryItem.refundCount += 1;
          summaryItem.refundVolume += item.amount;
        }
      });
      
      return summary as Record<string, PaymentSummary>;
    }
  };
  
  // Get summary data based on current view type
  const summaryData = prepareSummaryData();

  // Helper function to handle EMI type selection
  const handleEmiTypeToggle = (emiType: string) => {
    // If Shopse is selected, we'll need to clear other EMI types and payment methods
    if (emiType === "shopse" && !emiTypes.includes("shopse")) {
      // Clear other EMI types and set only shopse
      setEmiTypes(["shopse"]);
      return;
    }
    
    // If another EMI type is selected while shopse is active, clear shopse
    if (emiType !== "shopse" && emiTypes.includes("shopse")) {
      const newEmiTypes = [emiType];
      setEmiTypes(newEmiTypes);
      
      // Check if we have credit or debit card in payment methods
      const hasCardOrEmiMethod = paymentMethods.includes("creditCard") || 
                             paymentMethods.includes("debitCard") ||
                             paymentMethods.includes("emi");
      
      // If no card payment method is selected, auto-select credit card
      if (!hasCardOrEmiMethod) {
        setPaymentMethods(prev => [...prev, "creditCard"]);
      }
      
      return;
    }
    
    // Normal case: not handling shopse
    if (emiType !== "shopse") {
      // Check if we have credit or debit card in payment methods
      const hasCardOrEmiMethod = paymentMethods.includes("creditCard") || 
                             paymentMethods.includes("debitCard") ||
                             paymentMethods.includes("emi");
      
      // If EMI is being selected and no card payment method is selected, auto-select credit card
      if (!hasCardOrEmiMethod && !emiTypes.includes(emiType)) {
        setPaymentMethods(prev => [...prev, "creditCard"]);
      }
    }
    
    // Toggle the EMI type
    handleCheckboxToggle(emiType, emiTypes, setEmiTypes);
  };

  // Reset filters function
  const resetFilters = () => {
    setBusinessTypes([]);
    setLobs([]);
    setPaymentGateways([]);
    setInsurers([]); // Changed from banks to insurers
    setPaymentMethods([]);
    setEmiTypes([]);
    // Keep success as the default payment status
    setPaymentStatuses(["success"]);
    setDateRange({
      from: new Date(2024, 4, 1),
      to: new Date()
    });
    toast.success("Filters have been reset!");
  };

  // Helper functions
  const handleExport = () => {
    toast.success("Export initiated! File will be downloaded shortly.");
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Helper function for handling checkbox toggles in filter lists
  const handleCheckboxToggle = (value: string, currentItems: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updatedItems = currentItems.includes(value)
      ? currentItems.filter(item => item !== value)
      : [...currentItems, value];
    setItems(updatedItems);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Payment Analytics Dashboard</h1>
      
      {/* Filters Section */}
      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap justify-end gap-4 items-end">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px]">
                    {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Business Type Filter */}
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={businessTypes.length === 0 
                    ? "All Types" 
                    : `${businessTypes.length} selected`} />
                </SelectTrigger>
                <SelectContent>
                  <div className="space-y-2 p-2">
                    {["b2c", "b2b", "corporate"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`business-${type}`}
                          checked={businessTypes.includes(type)}
                          onCheckedChange={() => handleCheckboxToggle(type, businessTypes, setBusinessTypes)}
                        />
                        <label htmlFor={`business-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                          {type.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* LOB Filter */}
            <div className="space-y-2">
              <Label>Line of Business</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={lobs.length === 0 
                    ? "All LOBs" 
                    : `${lobs.length} selected`} />
                </SelectTrigger>
                <SelectContent>
                  <div className="space-y-2 p-2">
                    {["motor", "health", "life", "SME", "pet", "travel", "fire", "marine"].map((lob) => (
                      <div key={lob} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`lob-${lob}`}
                          checked={lobs.includes(lob)}
                          onCheckedChange={() => handleCheckboxToggle(lob, lobs, setLobs)}
                        />
                        <label htmlFor={`lob-${lob}`} className="text-sm font-medium leading-none cursor-pointer capitalize">
                          {lob}
                        </label>
                      </div>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* All Filters Button - Now opens a Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> All Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Filter Options</DialogTitle>
                  <DialogDescription>
                    Select multiple filters to refine your payment data
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                  {/* Business Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Business Type</Label>
                    <div className="space-y-2">
                      {["b2c", "b2b", "corporate"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-business-${type}`}
                            checked={businessTypes.includes(type)}
                            onCheckedChange={() => handleCheckboxToggle(type, businessTypes, setBusinessTypes)}
                          />
                          <label htmlFor={`dialog-business-${type}`} className="text-sm leading-none cursor-pointer">
                            {type.toUpperCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* LOB Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Line of Business</Label>
                    <div className="space-y-2">
                      {["motor", "health", "life", "SME", "pet", "travel", "fire", "marine"].map((lob) => (
                        <div key={lob} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-lob-${lob}`}
                            checked={lobs.includes(lob)}
                            onCheckedChange={() => handleCheckboxToggle(lob, lobs, setLobs)}
                          />
                          <label htmlFor={`dialog-lob-${lob}`} className="text-sm leading-none cursor-pointer capitalize">
                            {lob}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payment Gateway - Updated to only show Razorpay and PayU */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Gateway</Label>
                    <div className="space-y-2">
                      {["Razorpay", "PayU"].map((gateway) => (
                        <div key={gateway} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-gateway-${gateway}`}
                            checked={paymentGateways.includes(gateway)}
                            onCheckedChange={() => handleCheckboxToggle(gateway, paymentGateways, setPaymentGateways)}
                          />
                          <label htmlFor={`dialog-gateway-${gateway}`} className="text-sm leading-none cursor-pointer">
                            {gateway}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Insurers - Replacing Banks */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Insurer</Label>
                    <div className="space-y-2">
                      {["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"].map((insurer) => (
                        <div key={insurer} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-insurer-${insurer}`}
                            checked={insurers.includes(insurer)}
                            onCheckedChange={() => handleCheckboxToggle(insurer, insurers, setInsurers)}
                          />
                          <label htmlFor={`dialog-insurer-${insurer}`} className="text-sm leading-none cursor-pointer">
                            {insurer}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payment Method - Updated to remove Shopse */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="space-y-2">
                      {["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-method-${method}`}
                            checked={paymentMethods.includes(method)}
                            onCheckedChange={() => handleCheckboxToggle(method, paymentMethods, setPaymentMethods)}
                            disabled={emiTypes.includes("shopse")}
                          />
                          <label htmlFor={`dialog-method-${method}`} className="text-sm leading-none cursor-pointer">
                            {formatMethodName(method)}
                          </label>
                        </div>
                      ))}
                      {emiTypes.includes("shopse") && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Payment methods disabled when Shopse is selected
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* EMI Type - Updated options including Shopse */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">EMI Type</Label>
                    <div className="space-y-2">
                      {["standard", "noCost", "shopse"].map((emi) => (
                        <div key={emi} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-emi-${emi}`}
                            checked={emiTypes.includes(emi)}
                            onCheckedChange={() => handleEmiTypeToggle(emi)}
                            disabled={emi !== "shopse" && emiTypes.includes("shopse") ||
                                     emi === "shopse" && emiTypes.length > 0 && !emiTypes.includes("shopse")}
                          />
                          <label htmlFor={`dialog-emi-${emi}`} className="text-sm leading-none cursor-pointer">
                            {emi === "standard" ? "Standard" : emi === "noCost" ? "No Cost" : "Shopse"}
                          </label>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground mt-1">
                        {emiTypes.includes("shopse") ? 
                          "Shopse is exclusive and applied to any payment method" : 
                          "Standard/No Cost EMI types only apply to credit/debit cards and EMI method"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Status - With success as default selected */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <div className="space-y-2">
                      {["success", "failure", "pending"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-status-${status}`}
                            checked={paymentStatuses.includes(status)}
                            onCheckedChange={() => handleCheckboxToggle(status, paymentStatuses, setPaymentStatuses)}
                          />
                          <label htmlFor={`dialog-status-${status}`} className="text-sm leading-none cursor-pointer capitalize">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <DialogTrigger asChild>
                    <Button>Apply Filters</Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>
                
            <Button 
              variant="outline" 
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Export Data</SheetTitle>
                  <SheetDescription>
                    Select the fields you want to include in your export
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(selectedExportFields).map(([field, isSelected]) => (
                      <div className="flex items-center space-x-2" key={field}>
                        <Checkbox 
                          id={field} 
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            setSelectedExportFields(prev => ({
                              ...prev,
                              [field]: checked === true
                            }))
                          }
                        />
                        <label
                          htmlFor={field}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button onClick={handleExport}>Download CSV</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Card>
      
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Volume Processed</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalVolume)}</p>
            <p className="text-sm text-muted-foreground">{filteredData.length} Transactions</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Percentage</h3>
            <p className="text-2xl font-bold text-green-600">{successPercentage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">+5% vs last period</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Failure Percentage</h3>
            <p className="text-2xl font-bold text-red-600">{failurePercentage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">+3% vs last period</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Refund Volume</h3>
            <p className="text-2xl font-bold">{formatCurrency(refundVolume)}</p>
            <p className="text-sm text-muted-foreground">{refundPercentage.toFixed(1)}% of success</p>
          </div>
        </Card>
      </div>
      
      {/* Chart Section */}
      <Card className="p-4">
        <div className="mb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="gateway" onValueChange={setViewType} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gateway">Payment Gateway</TabsTrigger>
                  <TabsTrigger value="method">Payment Method</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Dynamic chart metric selector based on selected payment status */}
            <div className="flex items-start justify-start pl-1">
              <Tabs defaultValue={chartMetric} onValueChange={setChartMetric} className="w-[400px]">
                {getChartMetricOptions()}
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="h-[400px]">
          <PaymentBarChart 
            data={filteredData} 
            viewType={viewType} 
            chartMetric={chartMetric}
            emiTypes={emiTypes}
            paymentStatuses={paymentStatuses} 
          />
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowAlertModal(true)}
          >
            Configure Alerts
          </Button>
        </div>
      </Card>
      
      {/* Summary Table - Updated with EMI Type column when needed and Payment Gateway for failures */}
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">
          {viewType === "gateway" ? "Payment Gateway Summary" : "Payment Method Summary"}
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{viewType === "gateway" ? "Payment Gateway" : "Payment Method"}</TableHead>
                {emiTypes.length > 0 && <TableHead>EMI Type</TableHead>}
                {viewType === "method" && paymentStatuses.length === 1 && paymentStatuses.includes("failure") && (
                  <TableHead>Payment Gateway</TableHead>
                )}
                <TableHead>Total Transactions</TableHead>
                <TableHead>Total Volume</TableHead>
                {!(paymentStatuses.length === 1 && paymentStatuses.includes("failure")) && (
                  <>
                    <TableHead>Success%</TableHead>
                    <TableHead>Failure%</TableHead>
                  </>
                )}
                <TableHead>Total Amount Refunded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(summaryData).map(([key, data]) => {
                // Extract the payment method/gateway name
                const displayName = key.includes('-') && (data.emiType || data.paymentGateway) 
                  ? key.split('-')[0] 
                  : key;
                
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {formatMethodName(displayName)}
                    </TableCell>
                    {emiTypes.length > 0 && (
                      <TableCell>
                        {data.emiType && data.emiType !== "none" ? formatEmiTypeName(data.emiType) : "N/A"}
                      </TableCell>
                    )}
                    {viewType === "method" && paymentStatuses.length === 1 && paymentStatuses.includes("failure") && (
                      <TableCell>
                        {data.paymentGateway || (key.includes('-') ? key.split('-')[1] : "N/A")}
                      </TableCell>
                    )}
                    <TableCell>{data.totalTransactions}</TableCell>
                    <TableCell>{formatCurrency(data.totalVolume)}</TableCell>
                    {!(paymentStatuses.length === 1 && paymentStatuses.includes("failure")) && (
                      <>
                        <TableCell>
                          {data.totalTransactions > 0 
                            ? ((data.successCount / data.totalTransactions) * 100).toFixed(1) 
                            : 0}%
                        </TableCell>
                        <TableCell>
                          {data.totalTransactions > 0 
                            ? ((data.failureCount / data.totalTransactions) * 100).toFixed(1) 
                            : 0}%
                        </TableCell>
                      </>
                    )}
                    <TableCell>{formatCurrency(data.refundVolume)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Alert Modal */}
      <AlertModal 
        isOpen={showAlertModal} 
        onClose={() => setShowAlertModal(false)} 
      />
    </div>
  );
};

export default Index;
