import React, { useState } from 'react';
import {
  Zap,
  RefreshCw,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ReconciliationDataset } from '../types/reconciliation';

interface RazorpayConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: (dataset: ReconciliationDataset) => void;
}

export const RazorpayConnectModal: React.FC<RazorpayConnectModalProps> = ({
  isOpen,
  onClose,
  onDatasetCreated
}) => {
  const [keyId, setKeyId] = useState<string>('rzp_test_buildathon2026');
  const [keySecret, setKeySecret] = useState<string>('••••••••••••••••••••••••');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'test' | 'live'>('test');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Connecting to Razorpay Settlements API v1...');

    await new Promise(r => setTimeout(r, 600));
    setSyncStatus('Fetching settlement batches & UPI capture feeds...');

    await new Promise(r => setTimeout(r, 700));
    setSyncStatus('Parsing 2.0% MDR fees + 18% GST deductions...');

    await new Promise(r => setTimeout(r, 500));

    // Create live synced Razorpay dataset
    const razorpaySyncedDataset: ReconciliationDataset = {
      id: `rzp-live-${Date.now()}`,
      name: `Razorpay Live Settlement Batch (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
      description: `Live synced settlement feed from Razorpay API (${selectedEnvironment.toUpperCase()} Mode) containing settlement batches, net payouts, and NetSuite order records.`,
      currency: 'INR',
      bankName: 'HDFC Bank Current A/c (Razorpay Auto-Payout)',
      ledgerName: 'NetSuite D2C General Ledger (Orders Feed)',
      bankTransactions: [
        {
          id: 'rzp-batch-101',
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
          id: 'rzp-batch-102',
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
          id: 'rzp-batch-103',
          date: '2026-08-07',
          amount: -18500.00,
          description: 'DELHIVERY SURFACE FREIGHT DIRECT DEBIT',
          reference: 'DEL-INV-9921',
          type: 'debit',
          rawSource: 'bank',
          counterparty: 'Delhivery Logistics',
          category: 'Logistics'
        },
        {
          id: 'rzp-batch-104',
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
          id: 'rzp-batch-105',
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
          id: 'rzp-batch-106',
          date: '2026-08-20',
          amount: -2500.00,
          description: 'RAZORPAY CHARGEBACK DISPUTE PROVISIONAL HOLD',
          reference: 'RZP-CB-1092',
          type: 'debit',
          rawSource: 'bank',
          counterparty: 'Razorpay Risk Dept',
          category: 'Risk Hold'
        }
      ],
      ledgerTransactions: [
        {
          id: 'ldg-rzp-001a',
          date: '2026-07-31',
          amount: 25000.00,
          description: 'Order #ORD-7721 - Premium Ergonomic Chair',
          reference: 'ORD-7721',
          type: 'credit',
          rawSource: 'ledger',
          counterparty: 'Customer - Rahul Sharma',
          category: 'Order Revenue'
        },
        {
          id: 'ldg-rzp-001b',
          date: '2026-08-01',
          amount: 25000.00,
          description: 'Order #ORD-7722 - Standing Desk Motorized Pro',
          reference: 'ORD-7722',
          type: 'credit',
          rawSource: 'ledger',
          counterparty: 'Customer - Ananya Iyer',
          category: 'Order Revenue'
        },
        {
          id: 'ldg-rzp-002',
          date: '2026-08-04',
          amount: 4999.00,
          description: 'Order #ORD-8812 - Wireless Mechanical Keyboard (UPI)',
          reference: 'ORD-8812',
          type: 'credit',
          rawSource: 'ledger',
          counterparty: 'Customer - Vikram Verma',
          category: 'Order Revenue'
        },
        {
          id: 'ldg-rzp-003',
          date: '2026-08-07',
          amount: -18500.00,
          description: 'Delhivery Surface Logistics fulfillment batch Aug 07',
          reference: 'BILL-DEL-9921',
          type: 'debit',
          rawSource: 'ledger',
          counterparty: 'Delhivery Logistics',
          category: 'Logistics'
        },
        {
          id: 'ldg-rzp-004',
          date: '2026-08-10',
          amount: 150000.00,
          description: 'B2B Enterprise Batch Invoice #INV-B2B-109',
          reference: 'INV-B2B-109',
          type: 'credit',
          rawSource: 'ledger',
          counterparty: 'Titan Infotech Pvt Ltd',
          category: 'Enterprise Revenue'
        },
        {
          id: 'ldg-rzp-005',
          date: '2026-08-14',
          amount: 100000.00,
          description: 'Corporate Supply PO #PO-CORP-4401 (Smart Collect Virtual A/c)',
          reference: 'PO-CORP-4401',
          type: 'credit',
          rawSource: 'ledger',
          counterparty: 'Infosys Procurement',
          category: 'Enterprise Revenue'
        }
      ]
    };

    setIsSyncing(false);
    onDatasetCreated(razorpaySyncedDataset);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ background: '#0c2340', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#3395ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}
            >
              R
            </div>
            <div>
              <h2 className="modal-title" style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                Connect Razorpay Gateway
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Razorpay Buildathon 2026 • Live Settlement Reconciliation Feed
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Hackathon Callout Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(51, 149, 255, 0.1), rgba(12, 35, 64, 0.05))',
              border: '1px solid rgba(51, 149, 255, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <ShieldCheck size={20} style={{ color: '#3395ff', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0c2340', display: 'block', marginBottom: '0.2rem' }}>
                Autonomous Razorpay Settlement Ticking &amp; Tying
              </strong>
              Automatically reconciles Razorpay Gross Orders vs. Net Bank Settlements with 2.0% MDR fee + 18% GST deduction handling, instant refund matching, and route marketplace splits.
            </div>
          </div>

          {/* Environment Switcher */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>API Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${selectedEnvironment === 'test' ? 'btn-primary' : 'btn-outline'}`}
                style={selectedEnvironment === 'test' ? { background: '#3395ff', borderColor: '#3395ff' } : {}}
                onClick={() => setSelectedEnvironment('test')}
              >
                <Check size={14} />
                Test Sandbox (Demo Mode)
              </button>
              <button
                type="button"
                className={`btn ${selectedEnvironment === 'live' ? 'btn-primary' : 'btn-outline'}`}
                style={selectedEnvironment === 'live' ? { background: '#0c2340', borderColor: '#0c2340' } : {}}
                onClick={() => setSelectedEnvironment('live')}
              >
                Live Production Feed
              </button>
            </div>
          </div>

          {/* Key ID input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Razorpay Key ID</label>
            <input
              type="text"
              className="form-input"
              value={keyId}
              onChange={e => setKeyId(e.target.value)}
              placeholder="rzp_test_..."
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <span className="form-help">Found in Razorpay Dashboard &gt; Settings &gt; API Keys</span>
          </div>

          {/* Key Secret input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Key Secret</label>
            <input
              type="password"
              className="form-input"
              value={keySecret}
              onChange={e => setKeySecret(e.target.value)}
              placeholder="Enter Key Secret"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Webhook Events Supported */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Subscribed Razorpay Webhook Events
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['settlement.processed', 'payment.captured', 'refund.processed', 'payout.updated', 'virtual_account.credited'].map((evt, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}
                >
                  {evt}
                </span>
              ))}
            </div>
          </div>

          {/* Status Message */}
          {syncStatus && (
            <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={14} className="spin-anim" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={isSyncing}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSimulateSync}
            disabled={isSyncing}
            style={{ background: '#3395ff', borderColor: '#3395ff', gap: '0.5rem' }}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={16} className="spin-anim" />
                <span>Syncing Razorpay...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Sync &amp; Reconcile Razorpay Feed</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
