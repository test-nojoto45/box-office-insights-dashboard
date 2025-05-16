
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
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.5 ? ["3months", "6months", "9months", "12months"][Math.floor(Math.random() * 4)] : null,
    amount: Math.floor(Math.random() * 10000) + 500,
    status: Math.random() > 0.1 ? "success" : "failure",
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
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.5 ? ["3months", "6months", "9months", "12months"][Math.floor(Math.random() * 4)] : null,
    amount: Math.floor(Math.random() * 8000) + 1000,
    status: Math.random() > 0.15 ? "success" : "failure",
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
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.5 ? ["3months", "6months", "9months", "12months"][Math.floor(Math.random() * 4)] : null,
    amount: Math.floor(Math.random() * 12000) + 2000,
    status: Math.random() > 0.08 ? "success" : "failure",
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
    paymentMethod: ["creditCard", "debitCard", "netBanking", "upi", "wallet", "emi"][Math.floor(Math.random() * 6)],
    emiType: Math.random() > 0.5 ? ["3months", "6months", "9months", "12months"][Math.floor(Math.random() * 4)] : null,
    amount: Math.floor(Math.random() * 15000) + 1500,
    status: Math.random() > 0.12 ? "success" : "failure",
    utr: `UTR${100000 + Math.floor(Math.random() * 900000)}`,
    leadId: `LEAD${10000 + Math.floor(Math.random() * 90000)}`,
    isRefunded: Math.random() > 0.88
  }))
];
