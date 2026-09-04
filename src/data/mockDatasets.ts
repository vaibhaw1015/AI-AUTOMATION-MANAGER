import { ReconciliationDataset } from '../types/reconciliation';

export const MOCK_DATASETS: ReconciliationDataset[] = [
  {
    id: 'retail-razorpay-netsuite',
    name: 'Razorpay Settlements & Gateway Close (Razorpay vs. ERP Ledger)',
    description: 'Autonomous Razorpay settlement reconciliation: gross order batches, 2% MDR gateway fees, 18% GST offsets, UPI payments, and Smart Collect virtual accounts.',
    currency: 'INR',
    bankName: 'HDFC Bank Current A/c (Razorpay Settlement Feed)',
    ledgerName: 'NetSuite D2C / ERP Orders Ledger',
    bankTransactions: [
      {
        id: 'rzp-001',
        date: '2026-08-02',
        amount: 48990.20,
        description: 'RAZORPAY SETTLEMENT BATCH #RZP-SET-8910 NET GST',
        reference: 'RZP-SET-8910',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Razorpay Software Pvt Ltd',
        category: 'Settlement'
      },
      {
        id: 'rzp-002',
        date: '2026-08-04',
        amount: 4999.00,
        description: 'UPI-RAZORPAY-P2M-ORD-8812 INSTANT REFUND ADJ',
        reference: 'UPI-8812',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Razorpay UPI Gateway',
        category: 'UPI Settlement'
      },
      {
        id: 'rzp-003',
        date: '2026-08-07',
        amount: -18500.00,
        description: 'DELHIVERY LOGISTICS SURFACE FREIGHT EXPENSE',
        reference: 'DEL-INV-9921',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Delhivery Ltd',
        category: 'Shipping'
      },
      {
        id: 'rzp-004',
        date: '2026-08-11',
        amount: 147250.00,
        description: 'RAZORPAY ROUTE MARKETPLACE SPLIT DISBURSEMENT',
        reference: 'RZP-ROUTE-091',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Razorpay Route Splits',
        category: 'Marketplace'
      },
      {
        id: 'rzp-005',
        date: '2026-08-15',
        amount: 98040.00,
        description: 'RAZORPAY SMART COLLECT VIRTUAL ACCT SETTLEMENT',
        reference: 'RZP-VA-8821',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Razorpay Smart Collect',
        category: 'B2B Settlement'
      },
      {
        id: 'rzp-006',
        date: '2026-08-20',
        amount: -2500.00,
        description: 'RAZORPAY CHARGEBACK DISPUTE PROVISIONAL HOLD',
        reference: 'RZP-CB-1092',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Razorpay Risk Dept',
        category: 'Risk Hold'
      },
      {
        id: 'rzp-007',
        date: '2026-08-25',
        amount: 15400.00,
        description: 'AMAZON SELLER SERVICES INDIA PAYOUT BI-WEEKLY',
        reference: 'AZ-IN-PAY-441',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Amazon India',
        category: 'Marketplace'
      },
      {
        id: 'rzp-008',
        date: '2026-08-28',
        amount: -750.00,
        description: 'HDFC BANK BULK UPI API CHARGE FOR JULY',
        reference: 'HDFC-CHG-750',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'HDFC Bank',
        category: 'Bank Fees'
      }
    ],
    ledgerTransactions: [
      {
        id: 'ns-001a',
        date: '2026-07-31',
        amount: 25000.00,
        description: 'Order #ORD-7721 - Premium Ergonomic Chair (Gross)',
        reference: 'ORD-7721',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Customer - Rahul Sharma',
        category: 'Sales'
      },
      {
        id: 'ns-001b',
        date: '2026-08-01',
        amount: 25000.00,
        description: 'Order #ORD-7722 - Standing Desk Motorized Pro (Gross)',
        reference: 'ORD-7722',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Customer - Ananya Iyer',
        category: 'Sales'
      },
      {
        id: 'ns-002',
        date: '2026-08-03',
        amount: 5000.00,
        description: 'Direct UPI Order #8812 - Luxury Apparel Set',
        reference: 'INV-ORD-8812',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Customer - Order 8812',
        category: 'Sales'
      },
      {
        id: 'ns-003',
        date: '2026-08-06',
        amount: -18500.00,
        description: 'Delhivery Logistics - Pan-India Express Courier Fees',
        reference: 'PO-DEL-9921',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Delhivery Ltd',
        category: 'Shipping'
      },
      {
        id: 'ns-004',
        date: '2026-08-10',
        amount: 150000.00,
        description: 'B2B Enterprise Batch Invoice #INV-B2B-109 (Route Split)',
        reference: 'INV-B2B-109',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Titan Infotech Pvt Ltd',
        category: 'Enterprise Revenue'
      },
      {
        id: 'ns-005',
        date: '2026-08-14',
        amount: 100000.00,
        description: 'Corporate Supply PO #PO-CORP-4401 (Smart Collect Virtual A/c)',
        reference: 'PO-CORP-4401',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Infosys Procurement',
        category: 'Enterprise Revenue'
      },
      {
        id: 'ns-006',
        date: '2026-08-25',
        amount: 15400.00,
        description: 'Amazon Marketplace Merchant Disbursement Aug W1',
        reference: 'AZ-DISB-441',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Amazon India',
        category: 'Marketplace'
      },
      {
        id: 'ns-007',
        date: '2026-08-30',
        amount: 3200.00,
        description: 'Pending Store Credit Return Voucher - In Transit',
        reference: 'RET-VOC-109',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Return Dept',
        category: 'Returns'
      }
    ]
  },
  {
    id: 'saas-svb-quickbooks',
    name: 'SaaS Month-End Close (Stripe & SVB vs. QuickBooks)',
    description: 'High-growth B2B SaaS reconciling Stripe gateway payouts, vendor SaaS subscriptions, and client invoices with fee deductions and timing drift.',
    currency: 'USD',
    bankName: 'Silicon Valley Bank (SVB Feed)',
    ledgerName: 'QuickBooks General Ledger (GL)',
    bankTransactions: [
      // Exact matches
      {
        id: 'bnk-001',
        date: '2026-08-01',
        amount: -12450.00,
        description: 'DEEL PAYROLL SERVICES INC WIRE 998231',
        reference: 'WIRE-998231',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Deel Inc',
        category: 'Payroll'
      },
      {
        id: 'bnk-002',
        date: '2026-08-03',
        amount: -1420.00,
        description: 'SLACK TECHNOLOGIES INC SAN FRANCISCO CA',
        reference: 'ACH-SLK-441',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Slack Technologies',
        category: 'Software'
      },
      // Heuristic matches (date drift + name abbreviation)
      {
        id: 'bnk-003',
        date: '2026-08-05',
        amount: -6840.50,
        description: 'AMZN WEB SERV AWS EMEA SEATTLE WA 289192',
        reference: 'POS-AWS-289',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Amazon Web Services',
        category: 'Infrastructure'
      },
      {
        id: 'bnk-004',
        date: '2026-08-08',
        amount: 4999.00,
        description: 'INBOUND WIRE CUST 808 ACME CORP PYMT',
        reference: 'WIRE-ACM-808',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Acme Corp',
        category: 'Revenue'
      },
      // Split / Gateway Batch match (1-to-many: $9,710 net payout for two $5,000 invoices minus $290 fee)
      {
        id: 'bnk-005',
        date: '2026-08-12',
        amount: 9710.00,
        description: 'STRIPE PAYMENTS PAYOUT #STR-PO-98211 NET BATCH',
        reference: 'STR-PO-98211',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Stripe Payments',
        category: 'Payout Batch'
      },
      // Heuristic with slight penny drift (FX / bank conversion drift)
      {
        id: 'bnk-006',
        date: '2026-08-16',
        amount: -3420.48,
        description: 'NOTION LABS INC INTL SUBSCRIPTION USD',
        reference: 'CARD-NTN-551',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Notion Labs',
        category: 'Software'
      },
      // Another exact match
      {
        id: 'bnk-007',
        date: '2026-08-19',
        amount: 18500.00,
        description: 'DATADOG INC PARTNER REBATE DIRECT DEP',
        reference: 'DEP-DD-7712',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Datadog Inc',
        category: 'Rebates'
      },
      // Suspected duplicate charge on bank
      {
        id: 'bnk-008',
        date: '2026-08-22',
        amount: -149.00,
        description: 'GITHUB INC RECURRING SUB MSFT',
        reference: 'CARD-GH-101',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'GitHub Inc',
        category: 'Developer Tools'
      },
      {
        id: 'bnk-009',
        date: '2026-08-22',
        amount: -149.00,
        description: 'GITHUB INC RECURRING SUB MSFT DUPL',
        reference: 'CARD-GH-102',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'GitHub Inc',
        category: 'Developer Tools'
      },
      // Exception: Unrecorded bank service fee
      {
        id: 'bnk-010',
        date: '2026-08-30',
        amount: -35.00,
        description: 'SVB WIRE TRANSFER SERVICE CHARGE DOMESTIC',
        reference: 'FEE-SVB-AUG26',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Silicon Valley Bank',
        category: 'Bank Fees'
      },
      // Exception: Unidentified inbound wire
      {
        id: 'bnk-011',
        date: '2026-08-30',
        amount: 1250.00,
        description: 'UNKNOWN WIRE REF REMIT-9941 NO INVOICE SPECIFIED',
        reference: 'WIRE-UNREC-9941',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Unknown Remitter',
        category: 'Unidentified'
      }
    ],
    ledgerTransactions: [
      // Exact matches
      {
        id: 'ldg-001',
        date: '2026-08-01',
        amount: -12450.00,
        description: 'Deel Inc - Bi-weekly Global Contractor Payroll',
        reference: 'PO-2026-0881',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Deel Inc',
        category: 'Payroll'
      },
      {
        id: 'ldg-002',
        date: '2026-08-03',
        amount: -1420.00,
        description: 'Slack Technologies Enterprise Grid monthly renewal',
        reference: 'INV-SLK-4410',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Slack Technologies',
        category: 'Software'
      },
      // Heuristic match: Date is Aug 03 in ledger, Aug 05 in bank. Name "Amazon Web Services Inc"
      {
        id: 'ldg-003',
        date: '2026-08-03',
        amount: -6840.50,
        description: 'Amazon Web Services Inc - Cloud Hosting US-East & EU',
        reference: 'INV-AWS-AUG-26',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Amazon Web Services',
        category: 'Infrastructure'
      },
      // Heuristic match: $5,000.00 invoice vs $4,999.00 wire ($1 wire fee deduction / prompt example)
      {
        id: 'ldg-004',
        date: '2026-08-06',
        amount: 5000.00,
        description: 'Acme Corp - Enterprise Annual License Installment 1',
        reference: 'INV-2026-103',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Acme Corp',
        category: 'Revenue'
      },
      // Split match targets: Two $5,000 invoices (Gross = $10,000, Net = $9,710 after $290 Stripe fee)
      {
        id: 'ldg-005a',
        date: '2026-08-10',
        amount: 5000.00,
        description: 'TechFlow Ltd - SaaS Platform License Q3',
        reference: 'INV-2026-104',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'TechFlow Ltd',
        category: 'Revenue'
      },
      {
        id: 'ldg-005b',
        date: '2026-08-11',
        amount: 5000.00,
        description: 'CloudPeak Analytics - User Seats Expansion',
        reference: 'INV-2026-105',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'CloudPeak Analytics',
        category: 'Revenue'
      },
      // Penny rounding drift ($3,420.50 in ledger vs $3,420.48 in bank)
      {
        id: 'ldg-006',
        date: '2026-08-15',
        amount: -3420.50,
        description: 'Notion Labs Team Plan - Annual Billing (Converted from EUR)',
        reference: 'BILL-NOTION-26',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Notion Labs',
        category: 'Software'
      },
      // Exact match
      {
        id: 'ldg-007',
        date: '2026-08-19',
        amount: 18500.00,
        description: 'Datadog Partner Program Tier 1 Annual Incentive Rebate',
        reference: 'REBATE-DD-2026',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Datadog Inc',
        category: 'Rebates'
      },
      // Only one GitHub charge recorded in GL (shows duplicate on bank side!)
      {
        id: 'ldg-008',
        date: '2026-08-22',
        amount: -149.00,
        description: 'GitHub Enterprise Team subscription (10 seats)',
        reference: 'SUB-GH-AUG26',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'GitHub Inc',
        category: 'Developer Tools'
      },
      // Exception: Timing difference in ledger (Invoice recorded on Aug 31, customer check in transit)
      {
        id: 'ldg-009',
        date: '2026-08-31',
        amount: 8800.00,
        description: 'Nexus Dynamics - Implementation Phase 2 Deliverable Sign-off',
        reference: 'INV-2026-109',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Nexus Dynamics',
        category: 'Revenue'
      }
    ]
  },
  {
    id: 'enterprise-treasury-sap',
    name: 'Enterprise Treasury (JPMorgan Wire Feed vs. SAP S/4HANA)',
    description: 'Corporate treasury matching multi-million dollar vendor wire releases, cross-border intermediary bank deductions, and intercompany transfers.',
    currency: 'USD',
    bankName: 'JPMorgan Chase Corporate Treasury',
    ledgerName: 'SAP S/4HANA Accounts Payable',
    bankTransactions: [
      {
        id: 'jpm-001',
        date: '2026-08-04',
        amount: -250000.00,
        description: 'WIRE OUT TO ACCENTURE CONSULTING SERVICES FE-990',
        reference: 'FEDWIRE-ACC-990',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Accenture LLP',
        category: 'Professional Services'
      },
      {
        id: 'jpm-002',
        date: '2026-08-08',
        amount: -99965.00,
        description: 'WIRE OUT TO SAP SE GERMANY NET INTERMEDIARY CHARGE',
        reference: 'WIRE-SAP-4412',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'SAP SE',
        category: 'ERP License'
      },
      {
        id: 'jpm-003',
        date: '2026-08-14',
        amount: 450000.00,
        description: 'INCOMING WIRE CITIBANK GLOBAL INTERCOMPANY POOLING',
        reference: 'WIRE-CITI-IC-14',
        type: 'credit',
        rawSource: 'bank',
        counterparty: 'Subsidiary Treasury UK',
        category: 'Treasury'
      },
      {
        id: 'jpm-004',
        date: '2026-08-20',
        amount: -12500.00,
        description: 'DELOITTE TAX ADVISORY QUARTERLY RETAINER',
        reference: 'WIRE-DEL-TAX-20',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'Deloitte LLP',
        category: 'Tax'
      },
      {
        id: 'jpm-005',
        date: '2026-08-28',
        amount: -35.00,
        description: 'JPM WIRE TRANSACTION DISPATCH SURCHARGE',
        reference: 'CHG-JPM-DISP-28',
        type: 'debit',
        rawSource: 'bank',
        counterparty: 'JPMorgan Chase',
        category: 'Bank Fees'
      }
    ],
    ledgerTransactions: [
      {
        id: 'sap-001',
        date: '2026-08-03',
        amount: -250000.00,
        description: 'Accenture LLP - Enterprise Cloud Transformation Sprint 8',
        reference: 'SAP-DOC-700192',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Accenture LLP',
        category: 'Professional Services'
      },
      {
        id: 'sap-002',
        date: '2026-08-07',
        amount: -100000.00,
        description: 'SAP SE - S/4HANA Cloud Annual Maintenance Core License',
        reference: 'SAP-DOC-700193',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'SAP SE',
        category: 'ERP License'
      },
      {
        id: 'sap-003',
        date: '2026-08-14',
        amount: 450000.00,
        description: 'Intercompany Liquidity Sweep from UK Subsidiary Operations',
        reference: 'SAP-DOC-700194',
        type: 'credit',
        rawSource: 'ledger',
        counterparty: 'Subsidiary Treasury UK',
        category: 'Treasury'
      },
      {
        id: 'sap-004',
        date: '2026-08-20',
        amount: -12500.00,
        description: 'Deloitte LLP - International Transfer Pricing Advisory',
        reference: 'SAP-DOC-700195',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Deloitte LLP',
        category: 'Tax'
      },
      {
        id: 'sap-005',
        date: '2026-08-25',
        amount: -65000.00,
        description: 'Cisco Systems - Hardware Refresh Core Switches',
        reference: 'SAP-DOC-700196',
        type: 'debit',
        rawSource: 'ledger',
        counterparty: 'Cisco Systems',
        category: 'Hardware'
      }
    ]
  }
];
