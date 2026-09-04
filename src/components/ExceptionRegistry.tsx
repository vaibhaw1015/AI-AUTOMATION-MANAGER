import React from 'react';
import {
  AlertOctagon,
  Clock,
  FileQuestion,
  CreditCard,
  Copy,
  ArrowUpRight,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  Database
} from 'lucide-react';
import { MatchedPair, ReconciliationDataset, ExceptionCategory } from '../types/reconciliation';

interface ExceptionRegistryProps {
  matchedPairs: MatchedPair[];
  dataset: ReconciliationDataset;
  onSelectPair: (pair: MatchedPair) => void;
  onAlertSlack?: (pair: MatchedPair) => void;
  onSyncSupabase?: () => void;
  currency: string;
}

export const ExceptionRegistry: React.FC<ExceptionRegistryProps> = ({
  matchedPairs,
  dataset,
  onSelectPair,
  onAlertSlack,
  onSyncSupabase,
  currency
}) => {
  const exceptions = matchedPairs.filter(p => p.status === 'exception' || p.tier === 'UNMATCHED');

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(val));
  };

  const getCategoryIcon = (cat?: ExceptionCategory) => {
    switch (cat) {
      case 'TIMING_DIFFERENCE':
        return <Clock size={18} />;
      case 'BANK_FEE_DISCREPANCY':
        return <CreditCard size={18} />;
      case 'DUPLICATE_SUSPICION':
        return <Copy size={18} />;
      case 'MISSING_INVOICE':
        return <FileQuestion size={18} />;
      default:
        return <AlertOctagon size={18} />;
    }
  };

  const getCategoryBadgeClass = (cat?: ExceptionCategory) => {
    switch (cat) {
      case 'TIMING_DIFFERENCE':
        return 'badge-review';
      case 'DUPLICATE_SUSPICION':
      case 'BANK_FEE_DISCREPANCY':
      case 'MISSING_INVOICE':
      default:
        return 'badge-exception';
    }
  };

  const getCategoryLabel = (cat?: ExceptionCategory) => {
    switch (cat) {
      case 'TIMING_DIFFERENCE':
        return 'Timing Lag (In-Transit)';
      case 'BANK_FEE_DISCREPANCY':
        return 'Unrecorded Bank Fee';
      case 'DUPLICATE_SUSPICION':
        return 'Duplicate Billing Risk';
      case 'MISSING_INVOICE':
        return 'Unidentified Remittance';
      default:
        return 'Unmatched Anomaly';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Overview Banner */}
      <div
        style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-exception-bg)',
              color: 'var(--color-exception)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertOctagon size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Honest Exception Registry &bull; Zero Hallucination Guarantee
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              The agent never forces false matches. Below are the {exceptions.length} financial entries that
              require human verification or adjustment entries for clean month-end close.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Total Value Under Review
            </div>
            <div className="font-mono amount-val" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-exception)' }}>
              {formatMoney(
                exceptions.reduce((sum, p) => sum + Math.abs(p.bankTotal || p.ledgerTotal), 0)
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
            {onSyncSupabase && (
              <button
                className="btn btn-secondary"
                onClick={onSyncSupabase}
                title="Persist exceptions to Supabase cloud database"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', gap: '0.3rem' }}
              >
                <Database size={12} color="#10b981" />
                <span>Sync Supabase</span>
              </button>
            )}
            {onAlertSlack && (
              <button
                className="btn btn-secondary"
                onClick={() => onAlertSlack(exceptions[0])}
                title="Send anomaly alert to Slack #finance-close channel"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', gap: '0.3rem' }}
              >
                <MessageSquare size={12} color="#ECB22E" />
                <span>Alert Slack</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exception Item Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {exceptions.map(exc => {
          const bankTxs = dataset.bankTransactions.filter(t => exc.bankTxIds.includes(t.id));
          const ledgerTxs = dataset.ledgerTransactions.filter(t => exc.ledgerTxIds.includes(t.id));
          const primaryTx = bankTxs[0] || ledgerTxs[0];
          const isBankSource = bankTxs.length > 0;

          return (
            <div key={exc.id} className="exception-card" onClick={() => onSelectPair(exc)} style={{ cursor: 'pointer' }}>
              <div className="exception-left">
                <div className="exception-icon-box">
                  {getCategoryIcon(exc.exceptionType)}
                </div>

                <div className="exception-info">
                  <div className="exception-header-line">
                    <span className={`status-badge ${getCategoryBadgeClass(exc.exceptionType)}`}>
                      {getCategoryLabel(exc.exceptionType)}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Source: {isBankSource ? 'Bank Statement' : 'General Ledger'} &bull; {primaryTx?.date}
                    </span>
                  </div>

                  <div className="exception-title">
                    {primaryTx ? primaryTx.description : exc.reasoning.summary}
                  </div>

                  <div className="exception-desc">
                    {exc.reasoning.summary}
                  </div>

                  {exc.reasoning.suggestedAction && (
                    <div className="exception-action-tip">
                      <ArrowUpRight size={14} />
                      <span>{exc.reasoning.suggestedAction}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="exception-right">
                <div className="exception-amount">
                  {formatMoney(exc.bankTotal || exc.ledgerTotal)}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {onAlertSlack && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                      title="Post anomaly alert to Slack"
                      onClick={e => {
                        e.stopPropagation();
                        onAlertSlack(exc);
                      }}
                    >
                      <MessageSquare size={12} color="#ECB22E" />
                      <span>Alert Slack</span>
                    </button>
                  )}
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectPair(exc);
                    }}
                  >
                    <span>Inspect Audit Card</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {exceptions.length === 0 && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <CheckCircle size={40} style={{ color: 'var(--color-exact)', margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Zero Open Exceptions</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              All transactions have been cleanly reconciled and verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
