
// Sample payment data for testing the dashboard
export const mockPaymentData = [
  // Adding dates and more diverse data for time series analysis
  ...Array.from({ length: 30 }, (_, i) => {
    // Generate date for the past 30 days
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate random stats
    const successRate = Math.random() * 0.2 + 0.7; // 70-90% success rate
    const refundRate = Math.random() * 0.05; // 0-5% refund rate
    const transactionsPerDay = Math.floor(Math.random() * 10) + 15; // 15-25 transactions per day
    
    return Array.from({ length: transactionsPerDay }, (_, j) => {
      // Determine transaction status
      const rand = Math.random();
      let status = "success";
      let failureReason = null;
      
      if (rand > successRate) {
        status = "failure";
        // Select a random failure reason
        const failureReasons = [
          "Insufficient Funds",
          "Card Expired",
          "Bank Declined",
          "Network Error",
          "Authentication Failed",
          "3D Secure Failed",
          "Transaction Timeout"
        ];
        failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      } else if (rand > successRate - refundRate) {
        status = "refund";
      }
      
      // Randomly select gateway and method
      const gateways = ["Razorpay", "PayU", "Stripe", "Paytm"];
      const methods = ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"];
      const gateway = gateways[Math.floor(Math.random() * gateways.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      
      // Generate random amount
      const amount = Math.floor(Math.random() * 9000) + 1000; // 1000-10000
      
      // Determine if transaction has a policy
      const hasPolicy = Math.random() > 0.4; // 60% chance of having a policy
      
      // For EMI transactions
      let emiType = null;
      if (method === "creditCard" || method === "debitCard" || method === "emi") {
        if (Math.random() > 0.7) { // 30% chance of EMI
          const emiTypes = ["standard", "noCost", "shopse"];
          emiType = emiTypes[Math.floor(Math.random() * emiTypes.length)];
        }
      }
      
      return {
        id: `${dateStr}-${j}`,
        date: dateStr,
        paymentGateway: gateway,
        paymentMethod: method,
        amount,
        status,
        failureReason,
        emiType,
        hasPolicy
      };
    });
  }).flat()
];
