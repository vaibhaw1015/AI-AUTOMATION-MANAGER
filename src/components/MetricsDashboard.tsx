import React from 'react';
import {
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { ReconciliationMetrics } from '../types/reconciliation';

interface MetricsDashboardProps {
  metrics: ReconciliationMetrics;
  currency: string;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics, currency }) => {
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(val));
  };

  const totalTxs = metrics.totalBankRecords + metrics.totalLedgerRecords;
  const exactPct = totalTxs > 0 ? (metrics.tierCounts.exact * 2 / totalTxs) * 100 : 0;
  const heurPct = totalTxs > 0 ? (metrics.tierCounts.heuristic * 2 / totalTxs) * 100 : 0;
  const aiPct = totalTxs > 0 ? (metrics.tierCounts.aiSemantic * 3 / totalTxs) * 100 : 0;
  const excPct = totalTxs > 0 ? (metrics.tierCounts.exceptions / totalTxs) * 100 : 0;

  return (
    <section className="metrics-grid">
      {/* 1. Health Score */}
      <div className="metric-card health">
        <div className="metric-header">
          <span className="metric-label">Reconciliation Rate</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--color-exact)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="metric-value amount-val" style={{ color: 'var(--color-exact)' }}>
          {metrics.reconciliationRate.toFixed(1)}%
        </div>
        <div className="metric-footer">
          <span>{metrics.matchedBankCount + metrics.matchedLedgerCount} of {totalTxs} records matched</span>
        </div>
        {/* Tier Distribution Bar */}
        <div className="tier-progress-track" title="Exact (Green) | Heuristic (Blue) | AI Semantic (Purple) | Exceptions (Red)">
          <div className="tier-bar-exact" style={{ width: `${exactPct}%` }}></div>
          <div className="tier-bar-heuristic" style={{ width: `${heurPct}%` }}></div>
          <div className="tier-bar-ai" style={{ width: `${aiPct}%` }}></div>
          <div className="tier-bar-exception" style={{ width: `${excPct}%` }}></div>
        </div>
      </div>

      {/* 2. Reconciled Volume */}
      <div className="metric-card volume">
        <div className="metric-header">
          <span className="metric-label">Reconciled Volume</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--accent-primary)' }}>
            <DollarSign size={18} />
          </div>
        </div>
        <div className="metric-value amount-val">
          {formatAmount(metrics.reconciledVolume)}
        </div>
        <div className="metric-footer">
          <span className="tag-highlight">Total Books Volume:</span>
          <span>{formatAmount(metrics.totalLedgerAmount)}</span>
        </div>
      </div>

      {/* 3. Net Variance */}
      <div className="metric-card variance">
        <div className="metric-header">
          <span className="metric-label">Net Balance Variance</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--color-warning)' }}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="metric-value amount-val" style={{ color: Math.abs(metrics.netVariance) > 0.01 ? 'var(--color-warning)' : 'var(--color-exact)' }}>
          {metrics.netVariance < 0 ? '-' : ''}{formatAmount(metrics.netVariance)}
        </div>
        <div className="metric-footer">
          <span>Bank Feed vs General Ledger book differential</span>
        </div>
      </div>

      {/* 4. Honest Exceptions / Value at Risk */}
      <div className="metric-card exceptions">
        <div className="metric-header">
          <span className="metric-label">Honest Exceptions</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--color-exception)' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="metric-value amount-val" style={{ color: 'var(--color-exception)' }}>
          {metrics.tierCounts.exceptions} Flagged
        </div>
        <div className="metric-footer">
          <span className="tag-highlight">Value at Risk:</span>
          <span>{formatAmount(metrics.valueAtRisk)}</span>
        </div>
      </div>
    </section>
  );
};
