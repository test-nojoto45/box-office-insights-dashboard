import { useEffect, useState } from "react";
import { Download, ChevronDown, Plus, X, Filter, RefreshCw } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { mockData } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChartDisplay from "@/components/ChartDisplay";
import BifurcationChart from "@/components/BifurcationChart";

// Define type for the summary data
interface PaymentSummary {
  totalTransactions: number;
  successCount: number;
  failureCount: number;
  refundCount: number;
  totalVolume: number;
  refundVolume: number;
  policyCount: number;
  emiType?: string;
  paymentGateway?: string;
}

const Index = () => {
  // State for filters
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 4, 1),
    to: new Date()
  });
  
  // Single-select filters
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [lob, setLob] = useState<string | null>(null);
  const [insurer, setInsurer] = useState<string | null>(null);
  
  // Keep these as multi-select
  const [paymentGateways, setPaymentGateways] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [emiTypes, setEmiTypes] = useState<string[]>([]);
  const [cardTypes, setCardTypes] = useState<string[]>([]); // New card type filter
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>(["success"]);
  
  // State for view toggle
  const [viewType, setViewType] = useState("gateway");
  
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

  // Helper function to check if a value matches or is empty
  const matchesOrEmpty = (selectedValue: string | null, itemValue: string) => {
    return selectedValue === null || selectedValue === itemValue;
  };

  // Apply filters and update filtered data
  useEffect(() => {
    let filtered = [...mockData];
    
    // Apply each filter
    filtered = filtered.filter(item => {
      // First, handle shopse as a special EMI type
      const shopseSelected = emiTypes.includes("shopse");
      
      // If shopse is selected, only apply LOB filter to shopse transactions
      if (shopseSelected && item.emiType === "shopse") {
        return matchesOrEmpty(businessType, item.businessType) &&
               matchesOrEmpty(lob, item.lob) &&
               matchesOrEmpty(insurer, item.insurer) &&
               includesOrEmpty(paymentGateways, item.paymentGateway) &&
               includesOrEmpty(paymentStatuses, item.status) &&
               item.paymentMethod === "emi"; // Ensure payment method is "emi" for shopse
      }
      
      // If shopse is selected but this item is not shopse, exclude it
      if (shopseSelected && item.emiType !== "shopse") {
        return false;
      }
      
      // Handle card type filtering
      const cardTypeMatches = () => {
        if (cardTypes.length === 0) return true;
        if (item.paymentMethod === "creditCard" && cardTypes.includes("credit")) return true;
        if (item.paymentMethod === "debitCard" && cardTypes.includes("debit")) return true;
        return false;
      };
      
      // For non-shopse EMI types
      const emiSelected = emiTypes.length > 0 && !shopseSelected;
      const cardOrEmiSelected = paymentMethods.includes("cards") || paymentMethods.includes("emi");
      const isEmiCompatible = !emiSelected || 
        ((item.paymentMethod === "creditCard" || 
          item.paymentMethod === "debitCard" ||
          item.paymentMethod === "emi") && 
          includesOrEmpty(emiTypes, item.emiType) && 
          item.emiType !== "shopse");
      
      // Handle payment method filtering with card combination
      const paymentMethodMatches = () => {
        if (paymentMethods.length === 0) return true;
        
        if (paymentMethods.includes("cards")) {
          if (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard") {
            return cardTypeMatches();
          }
        }
        
        return paymentMethods.includes(item.paymentMethod);
      };
      
      // If EMI types (other than shopse) are selected but no card/emi payment methods are selected, 
      // filter out non-compatible items
      if (emiSelected && !cardOrEmiSelected && 
          item.paymentMethod !== "creditCard" && 
          item.paymentMethod !== "debitCard" &&
          item.paymentMethod !== "emi") {
        return false;
      }
      
      // Handle refund filter
      if (paymentStatuses.includes("refund") && !paymentStatuses.includes(item.status)) {
        return item.isRefunded; // Show refunded transactions regardless of their status
      }
      
      return (
        matchesOrEmpty(businessType, item.businessType) &&
        matchesOrEmpty(lob, item.lob) &&
        matchesOrEmpty(insurer, item.insurer) &&
        includesOrEmpty(paymentGateways, item.paymentGateway) &&
        paymentMethodMatches() &&
        isEmiCompatible &&
        (paymentStatuses.includes("refund") ? 
          (item.isRefunded || includesOrEmpty(paymentStatuses, item.status)) :
          includesOrEmpty(paymentStatuses, item.status))
      );
    });

    // Apply date range filter
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
    
    setFilteredData(filtered);
  }, [businessType, lob, insurer, paymentGateways, paymentMethods, emiTypes, cardTypes, paymentStatuses, dateRange]);

  // Helper function to check if an array includes a value or is empty
  const includesOrEmpty = (arr: string[], value: string) => {
    return arr.length === 0 || arr.includes(value);
  };

  // Calculate metrics
  const totalVolume = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const successCount = filteredData.filter(item => item.status === "success").length;
  const failureCount = filteredData.filter(item => item.status === "failure").length;
  const successPercentage = filteredData.length > 0 ? (successCount / filteredData.length) * 100 : 0;
  const failurePercentage = filteredData.length > 0 ? (failureCount / filteredData.length) * 100 : 0;
  
  // Calculate policy count - assume each transaction represents a policy
  const policyCount = filteredData.length;
  
  // Calculate refund metrics
  const refundCount = filteredData.filter(item => item.isRefunded).length;
  const refundVolume = filteredData.filter(item => item.isRefunded).reduce((sum, item) => sum + item.amount, 0);
  const refundPercentage = filteredData.length > 0 ? (refundCount / filteredData.length) * 100 : 0;

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
      case "cards": return "Cards";
      default: return method;
    }
  };

  // Modified to include policy count in summary
  const prepareSummaryData = () => {
    const groupBy = viewType === "gateway" ? "paymentGateway" : "paymentMethod";
    const summary: Record<string, PaymentSummary> = {};
    
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
          policyCount: 0, // Initialize policy count
          paymentGateway: viewType === "method" ? item.paymentGateway : undefined
        };
      }
      
      const summaryItem = summary[key];
      summaryItem.totalTransactions += 1;
      summaryItem.totalVolume += item.amount;
      summaryItem.policyCount += 1; // Increment policy count
      
      if (item.status === "success") summaryItem.successCount += 1;
      if (item.status === "failure") summaryItem.failureCount += 1;
      if (item.isRefunded) {
        summaryItem.refundCount += 1;
        summaryItem.refundVolume += item.amount;
      }
    });
    
    return summary;
  };
  
  // Get summary data based on current view type
  const summaryData = prepareSummaryData();

  // Helper function to handle EMI type selection
  const handleEmiTypeToggle = (emiType: string) => {
    if (emiType === "shopse" && !emiTypes.includes("shopse")) {
      setEmiTypes(["shopse"]);
      setPaymentMethods(["emi"]);
      return;
    }
    
    if (emiType !== "shopse" && emiTypes.includes("shopse")) {
      const newEmiTypes = [emiType];
      setEmiTypes(newEmiTypes);
      
      const hasCardOrEmiMethod = paymentMethods.includes("cards") || paymentMethods.includes("emi");
      
      if (!hasCardOrEmiMethod) {
        setPaymentMethods(prev => [...prev, "cards"]);
      }
      
      return;
    }
    
    if (emiType !== "shopse") {
      const hasCardOrEmiMethod = paymentMethods.includes("cards") || paymentMethods.includes("emi");
      
      if (!hasCardOrEmiMethod && !emiTypes.includes(emiType)) {
        setPaymentMethods(prev => [...prev, "cards"]);
      }
    }
    
    handleCheckboxToggle(emiType, emiTypes, setEmiTypes);
  };

  // Helper function to handle payment method toggle with shopse compatibility
  const handlePaymentMethodToggle = (method: string) => {
    if (emiTypes.includes("shopse")) {
      if (method === "emi") {
        if (paymentMethods.includes("emi")) {
          return;
        } else {
          setPaymentMethods(["emi"]);
        }
      } else {
        return;
      }
    } else {
      handleCheckboxToggle(method, paymentMethods, setPaymentMethods);
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setBusinessType(null);
    setLob(null);
    setInsurer(null);
    setPaymentGateways([]);
    setPaymentMethods([]);
    setEmiTypes([]);
    setCardTypes([]);
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

  // Check if we should show failure details based on status filter
  const showFailureDetails = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  // Check if we should show refund details based on status filter
  const showRefundDetails = paymentStatuses.length === 1 && paymentStatuses.includes("refund");

  // Check if we should show bifurcation chart
  const showBifurcationChart = emiTypes.length > 0 || cardTypes.length > 0;

  // Add refresh function
  const handleRefresh = () => {
    // This will re-fetch or re-process data while keeping current filters
    setFilteredData([...filteredData]); // Force re-render by creating new array reference
    toast.success("Charts refreshed successfully!");
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

            {/* Business Type Filter - Single Select */}
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select value={businessType || undefined} onValueChange={setBusinessType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="b2c">B2C</SelectItem>
                  <SelectItem value="b2b">B2B</SelectItem>
                  <SelectItem value="corporate">CORPORATE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LOB Filter - Single Select */}
            <div className="space-y-2">
              <Label>Line of Business</Label>
              <Select value={lob || undefined} onValueChange={setLob}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All LOBs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LOBs</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="SME">SME</SelectItem>
                  <SelectItem value="pet">Pet</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="marine">Marine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* All Filters Button */}
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
                    Select filters to refine your payment data
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                  {/* Business Type - Single Select */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Business Type</Label>
                    <Select value={businessType || undefined} onValueChange={setBusinessType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="b2c">B2C</SelectItem>
                        <SelectItem value="b2b">B2B</SelectItem>
                        <SelectItem value="corporate">CORPORATE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* LOB Filter - Single Select */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Line of Business</Label>
                    <Select value={lob || undefined} onValueChange={setLob}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All LOBs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All LOBs</SelectItem>
                        <SelectItem value="motor">Motor</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="life">Life</SelectItem>
                        <SelectItem value="SME">SME</SelectItem>
                        <SelectItem value="pet">Pet</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="marine">Marine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Gateway - Still multi-select */}
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
                  
                  {/* Insurers - Single Select */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Insurer</Label>
                    <Select value={insurer || undefined} onValueChange={setInsurer}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Insurers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Insurers</SelectItem>
                        <SelectItem value="Care">Care</SelectItem>
                        <SelectItem value="ICICI">ICICI</SelectItem>
                        <SelectItem value="Magma">Magma</SelectItem>
                        <SelectItem value="Zuno">Zuno</SelectItem>
                        <SelectItem value="HDFC">HDFC</SelectItem>
                        <SelectItem value="Niva Bupa">Niva Bupa</SelectItem>
                        <SelectItem value="SRGI">SRGI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Method - Updated to combine cards */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="space-y-2">
                      {["cards", "netBanking", "upi", "wallet", "emi"].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-method-${method}`}
                            checked={paymentMethods.includes(method)}
                            onCheckedChange={() => handlePaymentMethodToggle(method)}
                            disabled={emiTypes.includes("shopse") && method !== "emi"}
                          />
                          <label htmlFor={`dialog-method-${method}`} className="text-sm leading-none cursor-pointer">
                            {formatMethodName(method)}
                          </label>
                        </div>
                      ))}
                      {emiTypes.includes("shopse") && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Only EMI payment method allowed with Shopse
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Type Filter - New */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Card Type</Label>
                    <div className="space-y-2">
                      {["credit", "debit"].map((cardType) => (
                        <div key={cardType} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-cardtype-${cardType}`}
                            checked={cardTypes.includes(cardType)}
                            onCheckedChange={() => handleCheckboxToggle(cardType, cardTypes, setCardTypes)}
                            disabled={!paymentMethods.includes("cards")}
                          />
                          <label htmlFor={`dialog-cardtype-${cardType}`} className="text-sm leading-none cursor-pointer capitalize">
                            {cardType} Card
                          </label>
                        </div>
                      ))}
                      {!paymentMethods.includes("cards") && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Select "Cards" in Payment Method to enable card type filtering
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* EMI Type - Updated to handle shopse payment method constraint */}
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
                          "Shopse requires EMI payment method" : 
                          "Standard/No Cost EMI types only apply to credit/debit cards and EMI method"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Status - Still multi-select with success as default selected */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <div className="space-y-2">
                      {["success", "failure", "pending", "refund"].map((status) => (
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
      
      {/* Metrics Section - Updated order and replaced refund volume with policy count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Number of Policies</h3>
            <p className="text-2xl font-bold">{policyCount}</p>
            <p className="text-sm text-muted-foreground">Total policies processed</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Volume Processed</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalVolume)}</p>
            <p className="text-sm text-muted-foreground">{filteredData.length} Transactions</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Success Percentage</h3>
            <p className="text-2xl font-bold text-green-600">{successPercentage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">{successCount} successful transactions</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Failure Percentage</h3>
            <p className="text-2xl font-bold text-red-600">{failurePercentage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">{failureCount} failed transactions</p>
          </div>
        </Card>
      </div>
      
      {/* Chart Section - Updated to pass the refresh handler */}
      <Tabs defaultValue="gateway" onValueChange={setViewType}>
        <TabsList className="w-[400px] mb-4">
          <TabsTrigger value="gateway">Payment Gateway</TabsTrigger>
          <TabsTrigger value="method">Payment Method</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gateway">
          <ChartDisplay 
            data={filteredData} 
            viewType="gateway" 
            paymentStatuses={paymentStatuses}
            emiTypes={emiTypes}
            onRefresh={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="method">
          <ChartDisplay 
            data={filteredData} 
            viewType="method" 
            paymentStatuses={paymentStatuses}
            emiTypes={emiTypes}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* Bifurcation Chart - New section */}
      {showBifurcationChart && (
        <BifurcationChart 
          data={filteredData}
          emiTypes={emiTypes}
          cardTypes={cardTypes}
          onRefresh={handleRefresh}
        />
      )}
      
      {/* Summary Table */}
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
                {viewType === "method" && showFailureDetails && (
                  <TableHead>Payment Gateway</TableHead>
                )}
                <TableHead>Total Transactions</TableHead>
                <TableHead>Total Volume</TableHead>
                {showRefundDetails ? (
                  <TableHead>Refund Count</TableHead>
                ) : (!showFailureDetails && (
                  <>
                    <TableHead>Success%</TableHead>
                    <TableHead>Failure%</TableHead>
                  </>
                ))}
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
                    {viewType === "method" && showFailureDetails && (
                      <TableCell>
                        {data.paymentGateway || (key.includes('-') ? key.split('-')[1] : "N/A")}
                      </TableCell>
                    )}
                    <TableCell>{data.totalTransactions}</TableCell>
                    <TableCell>{formatCurrency(data.totalVolume)}</TableCell>
                    {showRefundDetails ? (
                      <TableCell>{data.refundCount}</TableCell>
                    ) : (!showFailureDetails && (
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
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Index;
