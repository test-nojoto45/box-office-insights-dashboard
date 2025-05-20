
// Mock data for the payment analytics dashboard
export const mockData = [
  // Razorpay transactions
  ...Array.from({ length: 30 }, (_, index) => ({
    id: `rp_${1000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "Razorpay",
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard", "emi"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : (Math.random() > 0.9 ? "shopse" : null),
    amount: Math.floor(Math.random() * 10000) + 500,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9,
    // Add failure reason for failure transactions
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  })),
  
  // PayU transactions
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `pu_${2000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "PayU",
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard", "emi"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : (Math.random() > 0.9 ? "shopse" : null),
    amount: Math.floor(Math.random() * 8000) + 1000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.85,
    // Add failure reason for failure transactions
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  })),
  
  // Add Shopse transactions (now as emiType)
  ...Array.from({ length: 20 }, (_, index) => ({
    id: `sh_${7000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU"][Math.floor(Math.random() * 2)],
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: "shopse",
    amount: Math.floor(Math.random() * 18000) + 2000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.92,
    // Add failure reason for failure transactions
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  })),

  // Add EMI transactions
  ...Array.from({ length: 15 }, (_, index) => ({
    id: `emi_${8000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU"][Math.floor(Math.random() * 2)],
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: "emi",
    emiType: ["standard", "noCost"][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 25000) + 5000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9,
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  })),

  // Specific Credit Card + EMI Type data
  ...Array.from({ length: 15 }, (_, index) => ({
    id: `cc_emi_${5000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU"][Math.floor(Math.random() * 2)],
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: "creditCard",
    emiType: ["standard", "noCost"][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 20000) + 5000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9,
    // Add failure reason for failure transactions
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  })),

  // Specific Debit Card + EMI Type data
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `dc_emi_${6000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports", "motor", "health", "life", "SME", "pet", "travel", "fire", "marine"][Math.floor(Math.random() * 12)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU"][Math.floor(Math.random() * 2)],
    insurer: ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"][Math.floor(Math.random() * 7)],
    paymentMethod: "debitCard",
    emiType: ["standard", "noCost"][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 15000) + 3000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9,
    // Add failure reason for failure transactions
    failureReason: ["Insufficient Funds", "Bank Declined", "Transaction Timeout", "Authentication Failed", "Network Error"][Math.floor(Math.random() * 5)]
  }))
];

// Add data ensuring representation for all filter options
export const ensureDataForAllFilterOptions = () => {
  const businessTypes = ["b2c", "b2b", "corporate"];
  const paymentGateways = ["Razorpay", "PayU"];
  const insurers = ["Care", "ICICI", "Magma", "Zuno", "HDFC", "Niva Bupa", "SRGI"];
  const paymentMethods = ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"];
  const emiTypes = ["standard", "noCost", "shopse"]; // Add shopse as EMI type
  const statuses = ["success", "failure", "pending"];
  const lobs = ["motor", "health", "life", "SME", "pet", "travel", "fire", "marine"];
  
  // Define common failure reasons for better data distribution
  const failureReasons = [
    "Insufficient Funds", 
    "Bank Declined", 
    "Transaction Timeout", 
    "Authentication Failed", 
    "Network Error"
  ];

  // Function to create a sample transaction with specific filter values
  const createSampleTransaction = (bType, gateway, insurer, method, emi, status, lob) => ({
    id: `sample_${Math.random().toString(36).substring(2, 9)}`,
    date: new Date(2024, 4, Math.floor(Math.random() * 30) + 1),
    lob: lob,
    businessType: bType,
    paymentGateway: gateway,
    insurer: insurer,
    paymentMethod: method,
    emiType: emi,
    amount: Math.floor(Math.random() * 15000) + 1000,
    status: status,
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9,
    // Add failure reason for all transactions
    failureReason: failureReasons[Math.floor(Math.random() * failureReasons.length)]
  });

  // Create specific combinations to ensure all filter options have data
  businessTypes.forEach(bType => {
    paymentGateways.forEach(gateway => {
      insurers.forEach(insurer => {
        // Create shopse specific transactions for each LOB
        lobs.forEach(lob => {
          mockData.push(createSampleTransaction(
            bType,
            gateway,
            insurer,
            Math.random() > 0.5 ? "creditCard" : "debitCard", // Use a common payment method
            "shopse",
            statuses[Math.floor(Math.random() * 3)],
            lob
          ));
        });

        paymentMethods.forEach(method => {
          statuses.forEach(status => {
            lobs.forEach(lob => {
              // Add a regular transaction for each combination
              mockData.push(createSampleTransaction(
                bType, 
                gateway, 
                insurer, 
                method, 
                (method === "creditCard" || method === "debitCard" || method === "emi") && Math.random() > 0.5 ? 
                  emiTypes.slice(0, 2)[Math.floor(Math.random() * 2)] : null,
                status,
                lob
              ));
            });
          });

          // For credit and debit cards and EMI, ensure EMI type combinations
          if (method === "creditCard" || method === "debitCard" || method === "emi") {
            emiTypes.slice(0, 2).forEach(emi => {
              lobs.forEach(lob => {
                mockData.push(createSampleTransaction(
                  bType,
                  gateway,
                  insurer,
                  method,
                  emi,
                  statuses[Math.floor(Math.random() * 3)],
                  lob
                ));
              });
            });
          }
        });
      });
    });
  });

  // Add more failed transactions with each failure reason to ensure good distribution
  failureReasons.forEach(reason => {
    for (let i = 0; i < 10; i++) {
      const gateway = paymentGateways[Math.floor(Math.random() * paymentGateways.length)];
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const lob = lobs[Math.floor(Math.random() * lobs.length)];
      const insurer = insurers[Math.floor(Math.random() * insurers.length)];
      
      mockData.push({
        id: `failure_${reason.toLowerCase().replace(/\s+/g, '_')}_${i}`,
        date: new Date(2024, 4, Math.floor(Math.random() * 30) + 1),
        lob: lob,
        businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
        paymentGateway: gateway,
        insurer: insurer,
        paymentMethod: method,
        emiType: (method === "creditCard" || method === "debitCard" || method === "emi") && Math.random() > 0.7 ? 
          emiTypes.slice(0, 2)[Math.floor(Math.random() * 2)] : 
          (Math.random() > 0.9 ? "shopse" : null),
        amount: Math.floor(Math.random() * 15000) + 1000,
        status: "failure",
        utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
        leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
        isRefunded: false,
        failureReason: reason
      });
    }
  });
};

// Call the function to populate the data
ensureDataForAllFilterOptions();
