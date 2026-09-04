import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertOctagon,
  Zap
} from 'lucide-react';
import {
  SlackConfig
} from '../types/integrations';
import {
  ReconciliationDataset,
  MatchedPair,
  ReconciliationMetrics
} from '../types/reconciliation';
import {
  loadSlackConfig,
  saveSlackConfig,
  formatCloseSummarySlackPayload,
  formatExceptionAlertSlackPayload,
  sendSlackWebhook
} from '../services/slackService';

interface SlackModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ReconciliationDataset;
  metrics: ReconciliationMetrics | null;
  matchedPairs: MatchedPair[];
  initialPairToAlert?: MatchedPair | null;
}

export const SlackModal: React.FC<SlackModalProps> = ({
  isOpen,
  onClose,
  dataset,
  metrics,
  matchedPairs,
  initialPairToAlert
}) => {
  const [config, setConfig] = useState<SlackConfig>(loadSlackConfig());
  const [alertType, setAlertType] = useState<'summary' | 'exception'>('summary');
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);

  const exceptions = matchedPairs.filter(p => p.tier === 'UNMATCHED');

  useEffect(() => {
    if (isOpen) {
      setConfig(loadSlackConfig());
      setStatusMessage(null);
      if (initialPairToAlert) {
        setAlertType('exception');
        setSelectedPairId(initialPairToAlert.id);
      } else if (exceptions.length > 0) {
        setSelectedPairId(prev => prev || exceptions[0].id);
      }
    }
  }, [isOpen, initialPairToAlert, exceptions]);

  if (!isOpen) return null;

  const currentException = exceptions.find(e => e.id === selectedPairId) || exceptions[0];

  // Generate payload for preview
  const payload = alertType === 'summary' && metrics
    ? formatCloseSummarySlackPayload(dataset, metrics, config)
    : currentException
    ? formatExceptionAlertSlackPayload(currentException, dataset, config)
    : null;

  const handleSend = async () => {
    if (!payload) return;
    setIsSending(true);
    setStatusMessage(null);
    try {
      const res = await sendSlackWebhook(payload, config);
      setStatusMessage({
        text: res.message,
        isSuccess: res.success
      });
      if (res.success) {
        const updated = { ...config, lastSentAt: new Date().toISOString() };
        setConfig(updated);
        saveSlackConfig(updated);
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Error sending to Slack: ${err.message || err}`,
        isSuccess: false
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveConfig = () => {
    saveSlackConfig(config);
    setStatusMessage({
      text: 'Slack webhook settings saved!',
      isSuccess: true
    });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%' }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #3F0E40, #1A1D21)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '1.25rem 1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#4A154B',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(74, 21, 75, 0.5)'
              }}
            >
              <MessageSquare size={20} color="#ECB22E" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.15rem', margin: 0 }}>
                  Team Alert Broadcast
                </h2>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#ECB22E',
                    color: '#1A1D21'
                  }}
                >
                  Slack Comms
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                Broadcast executive close packs &amp; honest exception escalations to Slack channels
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose} style={{ color: '#cbd5e1' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', maxHeight: '68vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Setup / Instructions Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(74, 21, 75, 0.08), rgba(236, 178, 46, 0.05))',
              border: '1px solid rgba(74, 21, 75, 0.2)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              fontSize: '0.78rem',
              color: '#334155',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <strong style={{ color: '#4A154B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={14} color="#ECB22E" /> Slack Incoming Webhook Setup:
              </strong>
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4A154B', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.73rem' }}
              >
                <ExternalLink size={11} /> Slack Webhook Docs
              </a>
            </div>
            <span>
              Create an Incoming Webhook in your Slack Workspace for channels like <code>#finance-close</code> or <code>#cpa-exceptions</code>. If left blank, demo simulation mode is active.
            </span>
          </div>

          {/* Webhook Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Slack Webhook URL</label>
              <input
                type="url"
                className="form-input"
                value={config.webhookUrl}
                onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://hooks.slack.com/services/T.../B.../..."
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Channel Name</label>
              <input
                type="text"
                className="form-input"
                value={config.channel}
                onChange={e => setConfig({ ...config, channel: e.target.value })}
                placeholder="#finance-close"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          {/* Alert Type Switcher */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Select Notification Type to Send</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${alertType === 'summary' ? 'btn-primary' : 'btn-outline'}`}
                style={alertType === 'summary' ? { background: '#4A154B', borderColor: '#4A154B' } : {}}
                onClick={() => setAlertType('summary')}
              >
                <Sparkles size={14} />
                <span>Month-End Close Summary</span>
              </button>
              <button
                type="button"
                className={`btn ${alertType === 'exception' ? 'btn-primary' : 'btn-outline'}`}
                style={alertType === 'exception' ? { background: '#e11d48', borderColor: '#e11d48' } : {}}
                onClick={() => setAlertType('exception')}
              >
                <AlertOctagon size={14} />
                <span>Honest Exception Alert ({exceptions.length})</span>
              </button>
            </div>
          </div>

          {/* If Exception Alert selected, choose which exception */}
          {alertType === 'exception' && exceptions.length > 0 && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Select Specific Quarantined Exception</label>
              <select
                className="form-input"
                value={selectedPairId}
                onChange={e => setSelectedPairId(e.target.value)}
                style={{ cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {exceptions.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.exceptionType || 'EXCEPTION'}] Variance: {dataset.currency} {Math.abs(p.variance).toFixed(2)} — {p.reasoning.summary.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Slack Block Kit Message Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Slack Message Preview (Block Kit)
            </div>

            <div
              style={{
                background: '#1A1D21',
                borderRadius: '10px',
                border: '1px solid #2C3136',
                padding: '1rem 1.15rem',
                color: '#D1D2D3',
                fontFamily: 'Slack-Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Slack Message Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: '#4A154B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.75rem'
                  }}
                >
                  TT
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>
                      {config.botName || 'Tick & Tie AI CPA'}
                    </span>
                    <span style={{ background: '#2C3136', color: '#ABABAD', fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                      APP
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#ABABAD' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#ABABAD' }}>
                    posted to <strong style={{ color: '#E8E8E8' }}>{config.channel || '#finance-close'}</strong>
                  </div>
                </div>
              </div>

              {/* Message Content Render */}
              {alertType === 'summary' && metrics && (
                <div style={{ borderLeft: '4px solid #36a64f', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                    📊 Month-End Financial Close Summary — {dataset.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#D1D2D3' }}>
                    Tick &amp; Tie AI has completed autonomous reconciliation across <strong>{dataset.bankName}</strong> and <strong>{dataset.ledgerName}</strong>.
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.6rem',
                      background: '#222529',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <div style={{ color: '#ABABAD', fontSize: '0.7rem' }}>RECONCILIATION RATE</div>
                      <div style={{ color: '#2EB67D', fontWeight: 800, fontSize: '0.95rem' }}>
                        🟢 {metrics.reconciliationRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#ABABAD', fontSize: '0.7rem' }}>RECONCILED VOLUME</div>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                        💰 {dataset.currency} {metrics.reconciledVolume.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#ABABAD', fontSize: '0.7rem' }}>MULTI-TIER MATCHES</div>
                      <div style={{ color: '#E8E8E8' }}>
                        ⚡ {metrics.tierCounts.exact} Exact • 🔍 {metrics.tierCounts.heuristic} Fuzzy • 🧠 {metrics.tierCounts.aiSemantic} Agent
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#ABABAD', fontSize: '0.7rem' }}>HONEST EXCEPTIONS</div>
                      <div style={{ color: '#E01E5A', fontWeight: 800 }}>
                        ⚠️ {metrics.tierCounts.exceptions} Quarantined
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {alertType === 'exception' && currentException && (
                <div style={{ borderLeft: '4px solid #E01E5A', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                    🚨 Honest Exception Incident Alert — {currentException.exceptionType || 'UNMATCHED ANOMALY'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#D1D2D3' }}>
                    Variance of <strong style={{ color: '#E01E5A' }}>{dataset.currency} {Math.abs(currentException.variance).toFixed(2)}</strong> isolated.
                  </div>
                  <div style={{ background: '#222529', padding: '0.65rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#ABABAD', display: 'block', marginBottom: '0.2rem' }}>CPA Diagnostic:</strong>
                    {currentException.reasoning.summary}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#ECB22E' }}>
                    👉 Remediation: {currentException.reasoning.suggestedAction || 'Check counterparty invoices.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: statusMessage.isSuccess ? '#f0fdf4' : '#fff1f2',
                border: `1px solid ${statusMessage.isSuccess ? '#bbf7d0' : '#fecdd3'}`,
                color: statusMessage.isSuccess ? '#15803d' : '#be123c'
              }}
            >
              {statusMessage.isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
            <button className="btn btn-outline" onClick={handleSaveConfig} style={{ fontSize: '0.75rem' }}>
              Save Webhook URL
            </button>
          </div>
          <button className="btn btn-outline" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isSending || !payload}
            style={{
              background: alertType === 'exception' ? '#e11d48' : '#4A154B',
              borderColor: alertType === 'exception' ? '#e11d48' : '#4A154B',
              gap: '0.45rem'
            }}
          >
            {isSending ? (
              <>
                <RefreshCw size={14} className="spin-anim" />
                <span>Broadcasting to Slack...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>{config.webhookUrl ? 'Send to Slack' : 'Send Test Notification'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
