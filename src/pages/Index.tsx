
import React, { useMemo, useState } from "react";
import NavigationBar from "@/components/NavigationBar";
import { Card } from "@/components/ui/card";
import { mockData } from "@/data/mockData";
import { DateRangePicker } from "@/components/DateRangePicker";
import { addDays, format, isWithinInterval, parseISO, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Filter, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChartDisplay from "@/components/ChartDisplay";

interface DateRange {
  from: Date;
  to: Date;
}

const Index = () => {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Filter states
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedPaymentGateways, setSelectedPaymentGateways] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>(["success", "failure"]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedEmiTypes, setSelectedEmiTypes] = useState<string[]>([]);
  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([]);
  
  // View type state (method or gateway)
  const [viewType, setViewType] = useState<string>("method");
  
  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      // Date range filtering
      const paymentDate = new Date(item.date);
      if (!isWithinInterval(paymentDate, { start: dateRange.from, end: dateRange.to })) {
        return false;
      }
      
      // Business type filtering
      if (selectedBusinessTypes.length > 0 && !selectedBusinessTypes.includes(item.businessType)) {
        return false;
      }
      
      // LOB filtering
      if (selectedLOBs.length > 0 && !selectedLOBs.includes(item.lob)) {
        return false;
      }
      
      // Payment gateway filtering
      if (selectedPaymentGateways.length > 0 && !selectedPaymentGateways.includes(item.paymentGateway)) {
        return false;
      }
      
      // Payment status filtering
      if (selectedPaymentStatuses.length > 0) {
        if (item.isRefunded && selectedPaymentStatuses.includes("refund")) {
          return true;
        }
        if (!selectedPaymentStatuses.includes(item.status)) {
          return false;
        }
      }

      // Payment method filtering with cards handling
      if (selectedPaymentMethods.length > 0) {
        const hasCardsFilter = selectedPaymentMethods.includes("cards");
        const hasSpecificCardMethods = selectedPaymentMethods.some(method => 
          ["creditCard", "debitCard"].includes(method)
        );
        
        if (hasCardsFilter && !hasSpecificCardMethods) {
          // If only "cards" is selected, include both credit and debit cards
          const isCardMethod = ["creditCard", "debitCard"].includes(item.paymentMethod);
          const isOtherSelectedMethod = selectedPaymentMethods.filter(m => m !== "cards").includes(item.paymentMethod);
          
          if (!isCardMethod && !isOtherSelectedMethod) {
            return false;
          }
        } else {
          // Normal filtering
          if (!selectedPaymentMethods.includes(item.paymentMethod) && !hasCardsFilter) {
            return false;
          }
          
          // If cards is selected along with specific methods, include both
          if (hasCardsFilter && hasSpecificCardMethods) {
            const isCardMethod = ["creditCard", "debitCard"].includes(item.paymentMethod);
            const isSpecificMethod = selectedPaymentMethods.includes(item.paymentMethod);
            
            if (!isCardMethod && !isSpecificMethod) {
              return false;
            }
          }
        }
      }

      // EMI type filtering
      if (selectedEmiTypes.length > 0 && item.paymentMethod === "emi") {
        if (!selectedEmiTypes.includes(item.emiType)) {
          return false;
        }
      }

      return true;
    });
  }, [
    dateRange,
    selectedBusinessTypes,
    selectedLOBs,
    selectedPaymentGateways,
    selectedPaymentStatuses,
    selectedPaymentMethods,
    selectedEmiTypes,
    selectedCardTypes,
    refreshTrigger
  ]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalTransactions = filteredData.length;
    const totalVolume = filteredData.reduce((sum, item) => sum + item.amount, 0);
    
    const successfulTransactions = filteredData.filter(item => item.status === "success").length;
    const successfulVolume = filteredData
      .filter(item => item.status === "success")
      .reduce((sum, item) => sum + item.amount, 0);
    
    const failedTransactions = filteredData.filter(item => item.status === "failure").length;
    const failedVolume = filteredData
      .filter(item => item.status === "failure")
      .reduce((sum, item) => sum + item.amount, 0);
    
    const refundedTransactions = filteredData.filter(item => item.isRefunded).length;
    const refundedVolume = filteredData
      .filter(item => item.isRefunded)
      .reduce((sum, item) => sum + item.amount, 0);
    
    return {
      totalTransactions,
      totalVolume,
      successfulTransactions,
      successfulVolume,
      failedTransactions,
      failedVolume,
      refundedTransactions,
      refundedVolume,
      successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
    };
  }, [filteredData]);

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Filters Section */}
        <Card className="p-6 shadow-sm border-slate-200">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Payment Analytics</h2>
              
              <div className="flex items-center space-x-4">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  className="flex items-center gap-2 text-figma-blue-DEFAULT border-figma-blue-DEFAULT hover:bg-figma-blue-light/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Business Type Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Business Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Business Type</h3>
                    <Separator />
                    <div className="space-y-2">
                      {["b2c", "b2b", "corporate"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`business-${type}`} 
                            checked={selectedBusinessTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBusinessTypes([...selectedBusinessTypes, type]);
                              } else {
                                setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <Label htmlFor={`business-${type}`} className="capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* LOB Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Line of Business
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Line of Business</h3>
                    <Separator />
                    <div className="space-y-2">
                      {["motor", "health", "life", "SME", "pet", "travel", "fire", "marine"].map((lob) => (
                        <div key={lob} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`lob-${lob}`} 
                            checked={selectedLOBs.includes(lob)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLOBs([...selectedLOBs, lob]);
                              } else {
                                setSelectedLOBs(selectedLOBs.filter(l => l !== lob));
                              }
                            }}
                          />
                          <Label htmlFor={`lob-${lob}`} className="capitalize">{lob}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Payment Gateway Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Payment Gateway
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Payment Gateway</h3>
                    <Separator />
                    <div className="space-y-2">
                      {["Razorpay", "PayU"].map((gateway) => (
                        <div key={gateway} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`gateway-${gateway}`} 
                            checked={selectedPaymentGateways.includes(gateway)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPaymentGateways([...selectedPaymentGateways, gateway]);
                              } else {
                                setSelectedPaymentGateways(selectedPaymentGateways.filter(g => g !== gateway));
                              }
                            }}
                          />
                          <Label htmlFor={`gateway-${gateway}`}>{gateway}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Payment Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Payment Status
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Payment Status</h3>
                    <Separator />
                    <div className="space-y-2">
                      {["success", "failure", "refund"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`status-${status}`} 
                            checked={selectedPaymentStatuses.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPaymentStatuses([...selectedPaymentStatuses, status]);
                              } else {
                                setSelectedPaymentStatuses(selectedPaymentStatuses.filter(s => s !== status));
                              }
                            }}
                          />
                          <Label htmlFor={`status-${status}`} className="capitalize">{status}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Payment Method Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Payment Method
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Payment Method</h3>
                    <Separator />
                    <div className="space-y-2">
                      {[
                        { id: "cards", label: "Cards" },
                        { id: "creditCard", label: "Credit Card" },
                        { id: "debitCard", label: "Debit Card" },
                        { id: "netBanking", label: "Net Banking" },
                        { id: "upi", label: "UPI" },
                        { id: "wallet", label: "Wallet" },
                        { id: "emi", label: "EMI" }
                      ].map((method) => (
                        <div key={method.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`method-${method.id}`} 
                            checked={selectedPaymentMethods.includes(method.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPaymentMethods([...selectedPaymentMethods, method.id]);
                              } else {
                                setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method.id));
                              }
                            }}
                          />
                          <Label htmlFor={`method-${method.id}`}>{method.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* EMI Type Filter - Only show when EMI is selected */}
              {selectedPaymentMethods.includes("emi") && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      EMI Type
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">EMI Type</h3>
                      <Separator />
                      <div className="space-y-2">
                        {[
                          { id: "standard", label: "Standard EMI" },
                          { id: "noCost", label: "No Cost EMI" },
                          { id: "shopse", label: "Shopse" }
                        ].map((emiType) => (
                          <div key={emiType.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`emi-${emiType.id}`} 
                              checked={selectedEmiTypes.includes(emiType.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEmiTypes([...selectedEmiTypes, emiType.id]);
                                } else {
                                  setSelectedEmiTypes(selectedEmiTypes.filter(e => e !== emiType.id));
                                }
                              }}
                            />
                            <Label htmlFor={`emi-${emiType.id}`}>{emiType.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
              {/* Display active filters as badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedBusinessTypes.map(type => (
                  <Badge key={`badge-business-${type}`} variant="outline" className="bg-slate-100 capitalize">
                    {type}
                    <button 
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== type))}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {selectedLOBs.map(lob => (
                  <Badge key={`badge-lob-${lob}`} variant="outline" className="bg-slate-100 capitalize">
                    {lob}
                    <button 
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setSelectedLOBs(selectedLOBs.filter(l => l !== lob))}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {selectedPaymentGateways.map(gateway => (
                  <Badge key={`badge-gateway-${gateway}`} variant="outline" className="bg-slate-100">
                    {gateway}
                    <button 
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setSelectedPaymentGateways(selectedPaymentGateways.filter(g => g !== gateway))}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {selectedPaymentStatuses.map(status => (
                  <Badge key={`badge-status-${status}`} variant="outline" className="bg-slate-100 capitalize">
                    {status}
                    <button 
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setSelectedPaymentStatuses(selectedPaymentStatuses.filter(s => s !== status))}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {selectedPaymentMethods.map(method => {
                  const methodLabels: Record<string, string> = {
                    creditCard: "Credit Card",
                    debitCard: "Debit Card",
                    netBanking: "Net Banking",
                    upi: "UPI",
                    wallet: "Wallet",
                    emi: "EMI",
                    cards: "Cards"
                  };
                  
                  return (
                    <Badge key={`badge-method-${method}`} variant="outline" className="bg-slate-100">
                      {methodLabels[method] || method}
                      <button 
                        className="ml-1 text-slate-500 hover:text-slate-700"
                        onClick={() => setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method))}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                
                {selectedEmiTypes.map(emiType => {
                  const emiTypeLabels: Record<string, string> = {
                    standard: "Standard EMI",
                    noCost: "No Cost EMI",
                    shopse: "Shopse"
                  };
                  
                  return (
                    <Badge key={`badge-emi-${emiType}`} variant="outline" className="bg-slate-100">
                      {emiTypeLabels[emiType] || emiType}
                      <button 
                        className="ml-1 text-slate-500 hover:text-slate-700"
                        onClick={() => setSelectedEmiTypes(selectedEmiTypes.filter(e => e !== emiType))}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                
                {/* Clear all filters button */}
                {(selectedBusinessTypes.length > 0 || 
                  selectedLOBs.length > 0 || 
                  selectedPaymentGateways.length > 0 || 
                  selectedPaymentStatuses.length > 0 || 
                  selectedPaymentMethods.length > 0 ||
                  selectedEmiTypes.length > 0 ||
                  selectedCardTypes.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedBusinessTypes([]);
                      setSelectedLOBs([]);
                      setSelectedPaymentGateways([]);
                      setSelectedPaymentStatuses(["success", "failure"]);
                      setSelectedPaymentMethods([]);
                      setSelectedEmiTypes([]);
                      setSelectedCardTypes([]);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 shadow-sm border-slate-200">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Volume</p>
              <p className="text-2xl font-semibold">{formatCurrency(summary.totalVolume)}</p>
              <p className="text-sm text-slate-500">{summary.totalTransactions} Transactions</p>
            </div>
          </Card>
          
          <Card className="p-4 shadow-sm border-slate-200">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Successful Volume</p>
              <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(summary.successfulVolume)}</p>
              <div className="flex justify-between">
                <p className="text-sm text-slate-500">{summary.successfulTransactions} Transactions</p>
                <p className="text-sm font-medium text-emerald-600">{formatPercentage(summary.successRate)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 shadow-sm border-slate-200">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Failed Volume</p>
              <p className="text-2xl font-semibold text-red-600">{formatCurrency(summary.failedVolume)}</p>
              <div className="flex justify-between">
                <p className="text-sm text-slate-500">{summary.failedTransactions} Transactions</p>
                <p className="text-sm font-medium text-red-600">
                  {formatPercentage(summary.totalTransactions > 0 ? (summary.failedTransactions / summary.totalTransactions) * 100 : 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 shadow-sm border-slate-200">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Refunded Volume</p>
              <p className="text-2xl font-semibold text-amber-600">{formatCurrency(summary.refundedVolume)}</p>
              <div className="flex justify-between">
                <p className="text-sm text-slate-500">{summary.refundedTransactions} Transactions</p>
                <p className="text-sm font-medium text-amber-600">
                  {formatPercentage(summary.totalTransactions > 0 ? (summary.refundedTransactions / summary.totalTransactions) * 100 : 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
          {/* Main Chart */}
          <ChartDisplay 
            data={filteredData}
            viewType={viewType}
            paymentStatuses={selectedPaymentStatuses}
            emiTypes={selectedEmiTypes}
            paymentMethods={selectedPaymentMethods}
            cardTypes={selectedCardTypes}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
