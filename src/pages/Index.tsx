
import { useEffect, useState } from "react";
import { Download, ChevronDown, Plus, X } from "lucide-react";
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
  const [selectedLob, setSelectedLob] = useState("all");
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [businessType, setBusinessType] = useState("all");
  const [paymentGateway, setPaymentGateway] = useState("all");
  const [bank, setBank] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [emiType, setEmiType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  
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

  // Apply filters and update filtered data
  useEffect(() => {
    let filtered = [...mockData];
    
    // Apply each filter
    if (selectedLob !== "all") {
      filtered = filtered.filter(item => item.lob === selectedLob);
    }

    if (businessType !== "all") {
      filtered = filtered.filter(item => item.businessType === businessType);
    }

    if (paymentGateway !== "all") {
      filtered = filtered.filter(item => item.paymentGateway === paymentGateway);
    }

    if (bank !== "all") {
      filtered = filtered.filter(item => item.bank === bank);
    }

    if (paymentMethod !== "all") {
      filtered = filtered.filter(item => item.paymentMethod === paymentMethod);
    }

    if (emiType !== "all") {
      filtered = filtered.filter(item => item.emiType === emiType);
    }

    if (paymentStatus !== "all") {
      filtered = filtered.filter(item => item.status === paymentStatus);
    }

    // Apply date range filter
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
    
    setFilteredData(filtered);
  }, [selectedLob, businessType, paymentGateway, bank, paymentMethod, emiType, paymentStatus, dateRange]);

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

  // Helper functions
  const handleExport = () => {
    toast.success("Export initiated! File will be downloaded shortly.");
  };

  const resetFilters = () => {
    setSelectedLob("all");
    setBusinessType("all");
    setPaymentGateway("all");
    setBank("all");
    setPaymentMethod("all");
    setEmiType("all");
    setPaymentStatus("all");
    setDateRange({
      from: new Date(2024, 4, 1),
      to: new Date()
    });
    toast.success("Filters have been reset!");
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

            {/* LOB Filter */}
            <div className="space-y-2">
              <Label>Line of Business</Label>
              <Select value={selectedLob} onValueChange={setSelectedLob}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select LOB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LOBs</SelectItem>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* All Filters Button */}
            <Collapsible 
              open={showAllFilters} 
              onOpenChange={setShowAllFilters}
              className="w-auto"
            >
              <div className="flex items-center gap-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline">
                    All Filters {showAllFilters ? <ChevronDown className="h-4 w-4 rotate-180 transition-all" /> : <ChevronDown className="h-4 w-4 transition-all" />}
                  </Button>
                </CollapsibleTrigger>
                
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
              
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Business Type */}
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="b2c">B2C</SelectItem>
                        <SelectItem value="b2b">B2B</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Gateway */}
                  <div className="space-y-2">
                    <Label>Payment Gateway</Label>
                    <Select value={paymentGateway} onValueChange={setPaymentGateway}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Gateways</SelectItem>
                        <SelectItem value="Razorpay">Razorpay</SelectItem>
                        <SelectItem value="PayU">PayU</SelectItem>
                        <SelectItem value="Stripe">Stripe</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bank */}
                  <div className="space-y-2">
                    <Label>Bank</Label>
                    <Select value={bank} onValueChange={setBank}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Banks</SelectItem>
                        <SelectItem value="hdfc">HDFC</SelectItem>
                        <SelectItem value="icici">ICICI</SelectItem>
                        <SelectItem value="sbi">SBI</SelectItem>
                        <SelectItem value="axis">Axis</SelectItem>
                        <SelectItem value="kotak">Kotak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="creditCard">Credit Card</SelectItem>
                        <SelectItem value="debitCard">Debit Card</SelectItem>
                        <SelectItem value="netBanking">Net Banking</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                        <SelectItem value="emi">EMI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* EMI Type */}
                  <div className="space-y-2">
                    <Label>EMI Type</Label>
                    <Select value={emiType} onValueChange={setEmiType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select EMI Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All EMI Types</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="9months">9 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failure</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
