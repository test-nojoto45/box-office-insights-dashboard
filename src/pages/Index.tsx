
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPaymentData } from "@/data/mockData";
import ChartDisplay from "@/components/ChartDisplay";

export default function Index() {
  // States for filters
  const [viewType, setViewType] = useState("gateway");
  const [dateRange, setDateRange] = useState("30d");
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([]);
  const [chartMetric, setChartMetric] = useState("percentVolume");
  const [selectedEmiTypes, setSelectedEmiTypes] = useState<string[]>([]);

  // Handle filter selections
  const handlePaymentStatusChange = (value: string) => {
    if (value === "all") {
      setPaymentStatuses([]);
    } else if (paymentStatuses.includes(value)) {
      setPaymentStatuses(paymentStatuses.filter(type => type !== value));
    } else {
      setPaymentStatuses([...paymentStatuses, value]);
    }
  };

  const handleEmiTypeChange = (value: string) => {
    if (value === "all") {
      setSelectedEmiTypes([]);
    } else if (selectedEmiTypes.includes(value)) {
      setSelectedEmiTypes(selectedEmiTypes.filter(type => type !== value));
    } else {
      setSelectedEmiTypes([...selectedEmiTypes, value]);
    }
  };

  // Filter data based on user selections
  const filteredData = mockPaymentData.filter(item => {
    // Filter by payment status
    if (paymentStatuses.length > 0 && !paymentStatuses.includes(item.status)) {
      return false;
    }
    
    // Filter by EMI type when needed
    if (
      selectedEmiTypes.length > 0 &&
      (item.paymentMethod === "creditCard" || item.paymentMethod === "debitCard" || item.paymentMethod === "emi") &&
      (!item.emiType || !selectedEmiTypes.includes(item.emiType))
    ) {
      return false;
    }
    
    return true;
  });

  // Extract total volume processed and success percentage
  const totalVolumeProcessed = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const successCount = filteredData.filter(item => item.status === "success").length;
  const failureCount = filteredData.filter(item => item.status === "failure").length;
  const refundCount = filteredData.filter(item => item.status === "refund").length;
  const policyCount = filteredData.filter(item => item.hasPolicy).length;
  
  const successPercentage = filteredData.length > 0 
    ? (successCount / filteredData.length) * 100 
    : 0;
  
  const failurePercentage = filteredData.length > 0 
    ? (failureCount / filteredData.length) * 100 
    : 0;
    
  const refundPercentage = filteredData.length > 0
    ? (refundCount / filteredData.length) * 100
    : 0;

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Payment Analytics</CardTitle>
          <CardDescription>
            Overview of payment processing metrics
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">View By</label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gateway">Gateway</SelectItem>
                    <SelectItem value="method">Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Status</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    className={`cursor-pointer ${
                      paymentStatuses.length === 0 
                        ? "bg-primary" 
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => setPaymentStatuses([])}
                  >
                    All
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      paymentStatuses.includes("success")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handlePaymentStatusChange("success")}
                  >
                    Success
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      paymentStatuses.includes("failure")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handlePaymentStatusChange("failure")}
                  >
                    Failure
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      paymentStatuses.includes("refund")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handlePaymentStatusChange("refund")}
                  >
                    Refund
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">EMI Type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    className={`cursor-pointer ${
                      selectedEmiTypes.length === 0 
                        ? "bg-primary" 
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => setSelectedEmiTypes([])}
                  >
                    All
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      selectedEmiTypes.includes("standard")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handleEmiTypeChange("standard")}
                  >
                    Standard EMI
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      selectedEmiTypes.includes("noCost")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handleEmiTypeChange("noCost")}
                  >
                    No Cost EMI
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${
                      selectedEmiTypes.includes("shopse")
                        ? "bg-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    onClick={() => handleEmiTypeChange("shopse")}
                  >
                    Shopse
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="font-medium">Number of Policies</div>
                <div className="text-2xl font-bold">{policyCount}</div>
              </Card>
              
              <Card className="p-4">
                <div className="font-medium">Volume Processed</div>
                <div className="text-2xl font-bold">{formatCurrency(totalVolumeProcessed)}</div>
              </Card>
              
              <Card className="p-4">
                <div className="font-medium">Success Percentage</div>
                <div className="text-2xl font-bold text-green-500">{successPercentage.toFixed(1)}%</div>
              </Card>
              
              <Card className="p-4">
                <div className="font-medium">Failure Percentage</div>
                <div className="text-2xl font-bold text-red-500">{failurePercentage.toFixed(1)}%</div>
              </Card>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center">
              <div className="space-x-2">
                <label className="text-sm font-medium">Y-Axis Metric: </label>
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="percentVolume">Percentage of Volume</SelectItem>
                      <SelectItem value="successRate">Success Percentage</SelectItem>
                      <SelectItem value="failureRate">Failure Percentage</SelectItem>
                      <SelectItem value="policyCount">Number of Policies</SelectItem>
                      <SelectItem value="refundRate">Refund Percentage</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 h-[500px]">
              <ChartDisplay 
                data={filteredData}
                viewType={viewType}
                chartMetric={chartMetric}
                emiTypes={selectedEmiTypes}
                paymentStatuses={paymentStatuses}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
