import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  MessageSquarePlus,
  Lock
} from 'lucide-react';
import {
  MatchedPair,
  ReconciliationDataset
} from '../types/reconciliation';

interface AuditDrawerProps {
  pair: MatchedPair | null;
  dataset: ReconciliationDataset;
  onClose: () => void;
  onUpdateStatus: (pairId: string, status: 'confirmed' | 'rejected') => void;
  onSaveNotes: (pairId: string, notes: string) => void;
  currency: string;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  pair,
  dataset,
  onClose,
  onUpdateStatus,
  onSaveNotes,
  currency
}) => {
  const [notes, setNotes] = useState<string>(pair?.auditorNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  if (!pair) return null;

  // Retrieve actual transactions
  const bankTxs = dataset.bankTransactions.filter(t => pair.bankTxIds.includes(t.id));
  const ledgerTxs = dataset.ledgerTransactions.filter(t => pair.ledgerTxIds.includes(t.id));

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(val));
  };

  const handleSaveNotes = () => {
    onSaveNotes(pair.id, notes);
    setIsEditingNotes(false);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="audit-drawer" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            {pair.tier === 'AI_SEMANTIC' ? (
              <Sparkles size={20} style={{ color: 'var(--color-ai)' }} />
            ) : pair.tier === 'EXACT' ? (
              <CheckCircle2 size={20} style={{ color: 'var(--color-exact)' }} />
            ) : pair.tier === 'HEURISTIC' ? (
              <ShieldCheck size={20} style={{ color: 'var(--color-heuristic)' }} />
            ) : (
              <AlertTriangle size={20} style={{ color: 'var(--color-exception)' }} />
            )}
            <div>
              <h2 className="drawer-title">
                {pair.tier === 'UNMATCHED' ? 'Exception Audit Report' : 'Reconciliation Audit Card'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  ID: {pair.id}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background:
                      pair.confidence > 80
                        ? 'rgba(16, 185, 129, 0.12)'
                        : pair.confidence > 50
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(244, 63, 94, 0.12)',
                    color:
                      pair.confidence > 80
                        ? '#059669'
                        : pair.confidence > 50
                        ? '#d97706'
                        : '#dc2626'
                  }}
                >
                  Confidence: {pair.confidence}%
                </span>
              </div>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose} title="Close Audit Drawer">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-content">
          {/* Side-by-side comparison section */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <ArrowRight size={14} />
              <span>Record Set Comparison</span>
            </div>

            <div className="comparison-box">
              {/* Bank side */}
              <div className="comparison-card">
                <div className="comparison-card-label">Bank Feed ({bankTxs.length})</div>
                <div className="comparison-card-val amount-val" style={{ color: '#0284c7' }}>
                  {formatMoney(pair.bankTotal)}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  {bankTxs.map(t => (
                    <div key={t.id} style={{ marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.description}</div>
                      <div className="font-mono" style={{ color: '#64748b', fontSize: '0.68rem' }}>
                        {t.date} &bull; {t.reference}
                      </div>
                    </div>
                  ))}
                  {bankTxs.length === 0 && (
                    <div style={{ color: '#e11d48', fontStyle: 'italic', fontWeight: 500 }}>
                      None (No bank entry found)
                    </div>
                  )}
                </div>
              </div>

              {/* Ledger side */}
              <div className="comparison-card">
                <div className="comparison-card-label">General Ledger ({ledgerTxs.length})</div>
                <div className="comparison-card-val amount-val" style={{ color: '#7c3aed' }}>
                  {formatMoney(pair.ledgerTotal)}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  {ledgerTxs.map(t => (
                    <div key={t.id} style={{ marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.description}</div>
                      <div className="font-mono" style={{ color: '#64748b', fontSize: '0.68rem' }}>
                        {t.date} &bull; {t.reference}
                      </div>
                    </div>
                  ))}
                  {ledgerTxs.length === 0 && (
                    <div style={{ color: '#e11d48', fontStyle: 'italic', fontWeight: 500 }}>
                      None (No GL record found)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Net Variance Banner */}
            <div className="variance-banner">
              <span style={{ color: '#334155', fontWeight: 600 }}>Net Variance / Fee Offset:</span>
              <span
                className="font-mono"
                style={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color:
                    Math.abs(pair.variance) === 0
                      ? '#059669'
                      : Math.abs(pair.variance) <= 0.05
                      ? '#0284c7'
                      : '#d97706'
                }}
              >
                {pair.variance < 0 ? '-' : '+'}
                {formatMoney(pair.variance)}
              </span>
            </div>
          </div>

          {/* AI Chain-of-Thought Reasoning Section */}
          <div className="drawer-section reasoning-box">
            <div className="drawer-section-title" style={{ color: '#6d28d9', fontWeight: 800 }}>
              <Sparkles size={15} style={{ color: '#7c3aed' }} />
              <span>AI Auditor Chain-of-Thought &amp; Rationale</span>
            </div>

            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.55 }}>
              {pair.reasoning.summary}
            </p>

            {pair.reasoning.llmChainOfThought && (
              <div className="cot-narrative">
                {pair.reasoning.llmChainOfThought}
              </div>
            )}

            {/* Rules and verification steps */}
            {pair.reasoning.steps && pair.reasoning.steps.length > 0 && (
              <div className="audit-step-list">
                {pair.reasoning.steps.map((step, idx) => (
                  <div key={idx} className="audit-step-item">
                    {step.passed ? (
                      <CheckCircle2 size={15} style={{ color: '#059669' }} className="audit-step-icon" />
                    ) : (
                      <AlertTriangle size={15} style={{ color: '#dc2626' }} className="audit-step-icon" />
                    )}
                    <div style={{ lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{step.rule}: </span>
                      <span style={{ color: '#334155' }}>{step.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Discrepancies noted */}
            {pair.reasoning.discrepanciesNoted && pair.reasoning.discrepanciesNoted.length > 0 && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, letterSpacing: '0.04em' }}>
                  Discrepancies Observed:
                </div>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  {pair.reasoning.discrepanciesNoted.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Auditor Action */}
            {pair.reasoning.suggestedAction && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 0.85rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #c7d2fe',
                  boxShadow: '0 1px 3px rgba(99, 102, 241, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#4338ca', fontWeight: 800, letterSpacing: '0.04em' }}>
                  Recommended Action:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '0.25rem', fontWeight: 500, lineHeight: 1.5 }}>
                  {pair.reasoning.suggestedAction}
                </div>
              </div>
            )}
          </div>

          {/* Auditor Notes & Compliance Sign-off */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <MessageSquarePlus size={14} />
              <span>Auditor Notes &amp; Sign-off Memo</span>
            </div>

            {isEditingNotes ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter custom CPA notes, ticket numbers, or manual variance justification..."
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={() => setIsEditingNotes(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveNotes}>
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.82rem', color: notes ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: notes ? 'normal' : 'italic' }}>
                  {notes || 'No auditor notes recorded for this transaction pair.'}
                </div>
                <button className="btn btn-outline" onClick={() => setIsEditingNotes(true)}>
                  Edit Note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer with Human-in-the-Loop Actions */}
        <div className="drawer-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Status: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{pair.status}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {pair.tier !== 'UNMATCHED' ? (
              <>
                <button
                  className="btn btn-danger"
                  onClick={() => onUpdateStatus(pair.id, 'rejected')}
                >
                  <RotateCcw size={14} />
                  <span>Unlink Match</span>
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => onUpdateStatus(pair.id, 'confirmed')}
                >
                  <Lock size={14} />
                  <span>Confirm &amp; Lock</span>
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => onUpdateStatus(pair.id, 'confirmed')}
              >
                <span>Clear Exception</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
