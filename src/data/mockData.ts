
// Mock data for the payment analytics dashboard
export const mockData = [
  // Razorpay transactions
  ...Array.from({ length: 30 }, (_, index) => ({
    id: `rp_${1000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "Razorpay",
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : null,
    amount: Math.floor(Math.random() * 10000) + 500,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9
  })),
  
  // PayU transactions
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `pu_${2000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "PayU",
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : null,
    amount: Math.floor(Math.random() * 8000) + 1000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.85
  })),
  
  // Stripe transactions
  ...Array.from({ length: 20 }, (_, index) => ({
    id: `st_${3000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "Stripe",
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : null,
    amount: Math.floor(Math.random() * 12000) + 2000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.92
  })),
  
  // PayPal transactions
  ...Array.from({ length: 15 }, (_, index) => ({
    id: `pp_${4000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: "PayPal",
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)],
    emiType: Math.random() > 0.7 && ["creditCard", "debitCard"].includes(["creditCard", "debitCard", "netBanking", "upi", "wallet"][Math.floor(Math.random() * 5)]) 
      ? ["standard", "noCost"][Math.floor(Math.random() * 2)] 
      : null,
    amount: Math.floor(Math.random() * 15000) + 1500,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.88
  })),

  // Specific Credit Card + EMI Type data
  ...Array.from({ length: 15 }, (_, index) => ({
    id: `cc_emi_${5000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU", "Stripe", "PayPal"][Math.floor(Math.random() * 4)],
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: "creditCard",
    emiType: ["standard", "noCost"][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 20000) + 5000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9
  })),

  // Specific Debit Card + EMI Type data
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `dc_emi_${6000 + index}`,
    date: new Date(2024, 4, Math.floor(index / 3) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: ["b2c", "b2b", "corporate"][Math.floor(Math.random() * 3)],
    paymentGateway: ["Razorpay", "PayU", "Stripe", "PayPal"][Math.floor(Math.random() * 4)],
    bank: ["hdfc", "icici", "sbi", "axis", "kotak"][Math.floor(Math.random() * 5)],
    paymentMethod: "debitCard",
    emiType: ["standard", "noCost"][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 15000) + 3000,
    status: ["success", "failure", "pending"][Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : 0],
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9
  }))
];

// Add data ensuring representation for each filter value combination
export const ensureDataForAllFilterOptions = () => {
  const businessTypes = ["b2c", "b2b", "corporate"];
  const paymentGateways = ["Razorpay", "PayU", "Stripe", "PayPal"];
  const banks = ["hdfc", "icici", "sbi", "axis", "kotak"];
  const paymentMethods = ["creditCard", "debitCard", "netBanking", "upi", "wallet"];
  const emiTypes = ["standard", "noCost"];
  const statuses = ["success", "failure", "pending"];

  // Function to create a sample transaction with specific filter values
  const createSampleTransaction = (bType, gateway, bank, method, emi, status) => ({
    id: `sample_${Math.random().toString(36).substring(2, 9)}`,
    date: new Date(2024, 4, Math.floor(Math.random() * 30) + 1),
    lob: ["movies", "events", "activities", "sports"][Math.floor(Math.random() * 4)],
    businessType: bType,
    paymentGateway: gateway,
    bank: bank,
    paymentMethod: method,
    emiType: emi,
    amount: Math.floor(Math.random() * 15000) + 1000,
    status: status,
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.9
  });

  // Create specific combinations to ensure all filter options have data
  businessTypes.forEach(bType => {
    paymentGateways.forEach(gateway => {
      banks.forEach(bank => {
        paymentMethods.forEach(method => {
          statuses.forEach(status => {
            // Add a regular transaction for each combination
            mockData.push(createSampleTransaction(
              bType, 
              gateway, 
              bank, 
              method, 
              (method === "creditCard" || method === "debitCard") && Math.random() > 0.5 ? 
                emiTypes[Math.floor(Math.random() * 2)] : null,
              status
            ));
          });

          // For credit and debit cards, ensure EMI type combinations
          if (method === "creditCard" || method === "debitCard") {
            emiTypes.forEach(emi => {
              mockData.push(createSampleTransaction(
                bType,
                gateway,
                bank,
                method,
                emi,
                statuses[Math.floor(Math.random() * 3)]
              ));
            });
          }
        });
      });
    });
  });
};

// Call the function to populate the data
ensureDataForAllFilterOptions();
