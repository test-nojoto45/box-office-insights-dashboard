
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertType, setAlertType] = useState("success");
  const [monitorType, setMonitorType] = useState("gateway");
  const [threshold, setThreshold] = useState("5");
  const [selectedItem, setSelectedItem] = useState("");
  const [email, setEmail] = useState("");

  const handleAddAlert = () => {
    const newAlert = {
      id: Date.now(),
      type: alertType,
      monitor: monitorType,
      item: selectedItem,
      threshold: parseFloat(threshold),
      email: email,
    };
    
    setAlerts([...alerts, newAlert]);
    
    // Reset form
    setAlertType("success");
    setMonitorType("gateway");
    setThreshold("5");
    setSelectedItem("");
    setEmail("");
    
    toast.success("Alert configuration added successfully");
  };

  const handleRemoveAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success("Alert configuration removed");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Configure Payment Alerts</DialogTitle>
          <DialogDescription>
            Set up alerts for payment metrics. You'll receive email notifications when thresholds are reached.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alertType">Alert Type</Label>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger id="alertType">
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success Rate Drop</SelectItem>
                  <SelectItem value="failure">Failure Rate Increase</SelectItem>
                  <SelectItem value="refund">Refund Rate Increase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monitorType">Monitor By</Label>
              <Select value={monitorType} onValueChange={setMonitorType}>
                <SelectTrigger id="monitorType">
                  <SelectValue placeholder="Select monitoring type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gateway">Payment Gateway</SelectItem>
                  <SelectItem value="method">Payment Method</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selectedItem">
                {monitorType === "gateway" ? "Payment Gateway" : "Payment Method"}
              </Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="selectedItem">
                  <SelectValue placeholder={`Select ${monitorType}`} />
                </SelectTrigger>
                <SelectContent>
                  {monitorType === "gateway" ? (
                    <>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="payu">PayU</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="creditCard">Credit Card</SelectItem>
                      <SelectItem value="debitCard">Debit Card</SelectItem>
                      <SelectItem value="netBanking">Net Banking</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="emi">EMI</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email for Alerts</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <Button onClick={handleAddAlert} className="mt-2" disabled={!selectedItem || !email}>
            Add Alert
          </Button>
          
          {alerts.length > 0 && (
            <div className="border rounded-md p-2 mt-4">
              <h3 className="font-medium mb-2">Configured Alerts</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                    <div>
                      <p className="text-sm">
                        Alert when <strong>{alert.type}</strong> rate 
                        {alert.type === "success" ? " drops below " : " exceeds "}
                        <strong>{alert.threshold}%</strong> for {alert.item}
                      </p>
                      <p className="text-xs text-muted-foreground">Email: {alert.email}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveAlert(alert.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;
