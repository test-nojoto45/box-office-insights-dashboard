
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
import { Calendar } from "@/components/ui/calendar";
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
}

const Index = () => {
  // State for filters
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 4, 1),
    to: new Date()
  });
  
  // Replace selectedLob with businessTypes (multi-select)
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  
  // Convert other filters to multi-select
  const [paymentGateways, setPaymentGateways] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [emiTypes, setEmiTypes] = useState<string[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([]);
  
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
      // Check if EMI types are selected and payment methods are compatible
      const emiSelected = emiTypes.length > 0;
      const cardMethodSelected = paymentMethods.includes("creditCard") || paymentMethods.includes("debitCard");
      const isEmiCompatible = !emiSelected || 
        ((item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard") && 
         includesOrEmpty(emiTypes, item.emiType));
      
      // If EMI types are selected but no card payment methods are selected, filter out non-card items
      if (emiSelected && !cardMethodSelected && item.paymentMethod !== "creditCard" && item.paymentMethod !== "debitCard") {
        return false;
      }
      
      return (
        includesOrEmpty(businessTypes, item.businessType) &&
        includesOrEmpty(paymentGateways, item.paymentGateway) &&
        includesOrEmpty(banks, item.bank) &&
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
  }, [businessTypes, paymentGateways, banks, paymentMethods, emiTypes, paymentStatuses, dateRange]);

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

  // Prepare summary data
  const prepareSummaryData = () => {
    const groupBy = viewType === "gateway" ? "paymentGateway" : "paymentMethod";
    
    // Create a summary object based on the view type (gateway or method)
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
          refundVolume: 0
        };
      }
      
      summary[key].totalTransactions += 1;
      summary[key].totalVolume += item.amount;
      
      if (item.status === "success") summary[key].successCount += 1;
      if (item.status === "failure") summary[key].failureCount += 1;
      if (item.isRefunded) {
        summary[key].refundCount += 1;
        summary[key].refundVolume += item.amount;
      }
    });
    
    return summary;
  };
  
  // Get summary data based on current view type
  const summaryData = prepareSummaryData();

  // Helper function to handle EMI type selection
  const handleEmiTypeToggle = (emiType: string) => {
    // Check if we have credit or debit card in payment methods
    const hasCardMethod = paymentMethods.includes("creditCard") || paymentMethods.includes("debitCard");
    
    // If EMI is being selected and no card payment method is selected, auto-select credit card
    if (!hasCardMethod && !emiTypes.includes(emiType)) {
      setPaymentMethods(prev => [...prev, "creditCard"]);
    }
    
    // Toggle the EMI type
    handleCheckboxToggle(emiType, emiTypes, setEmiTypes);
  };

  // Reset filters function
  const resetFilters = () => {
    setBusinessTypes([]);
    setPaymentGateways([]);
    setBanks([]);
    setPaymentMethods([]);
    setEmiTypes([]);
    setPaymentStatuses([]);
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

            {/* Business Type Filter - Replacing LOB */}
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
                  
                  {/* Payment Gateway */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Gateway</Label>
                    <div className="space-y-2">
                      {["Razorpay", "PayU", "Stripe", "PayPal"].map((gateway) => (
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
                  
                  {/* Bank */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Bank</Label>
                    <div className="space-y-2">
                      {["hdfc", "icici", "sbi", "axis", "kotak"].map((bank) => (
                        <div key={bank} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-bank-${bank}`}
                            checked={banks.includes(bank)}
                            onCheckedChange={() => handleCheckboxToggle(bank, banks, setBanks)}
                          />
                          <label htmlFor={`dialog-bank-${bank}`} className="text-sm leading-none cursor-pointer">
                            {bank.toUpperCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="space-y-2">
                      {["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-method-${method}`}
                            checked={paymentMethods.includes(method)}
                            onCheckedChange={() => handleCheckboxToggle(method, paymentMethods, setPaymentMethods)}
                          />
                          <label htmlFor={`dialog-method-${method}`} className="text-sm leading-none cursor-pointer">
                            {method === "creditCard" ? "Credit Card" :
                             method === "debitCard" ? "Debit Card" :
                             method === "netBanking" ? "Net Banking" :
                             method === "upi" ? "UPI" :
                             method === "wallet" ? "Wallet" : "EMI"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* EMI Type - Updated options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">EMI Type</Label>
                    <div className="space-y-2">
                      {["standard", "noCost"].map((emi) => (
                        <div key={emi} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dialog-emi-${emi}`}
                            checked={emiTypes.includes(emi)}
                            onCheckedChange={() => handleEmiTypeToggle(emi)}
                            disabled={paymentMethods.length > 0 && 
                              !paymentMethods.includes("creditCard") && 
                              !paymentMethods.includes("debitCard")}
                          />
                          <label htmlFor={`dialog-emi-${emi}`} className="text-sm leading-none cursor-pointer">
                            {emi === "standard" ? "Standard" : "No Cost"}
                          </label>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground mt-1">
                        EMI types only apply to credit and debit cards
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Status */}
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
            <h3 className="text-sm font-medium text-muted-foreground">Success Percentage</h3>
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
            
            <div className="flex items-start justify-start pl-1">
              <Tabs defaultValue={chartMetric} onValueChange={setChartMetric} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="volume">Volume Processed</TabsTrigger>
                  <TabsTrigger value="success">Success Percentage</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="h-[400px]">
          <PaymentBarChart 
            data={filteredData} 
            viewType={viewType} 
            chartMetric={chartMetric} 
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
                <TableHead>Total Transactions</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead>Success%</TableHead>
                <TableHead>Failure%</TableHead>
                <TableHead>Total Amount Refunded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(summaryData).map(([key, data]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>{data.totalTransactions}</TableCell>
                  <TableCell>{formatCurrency(data.totalVolume)}</TableCell>
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
                  <TableCell>{formatCurrency(data.refundVolume)}</TableCell>
                </TableRow>
              ))}
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
