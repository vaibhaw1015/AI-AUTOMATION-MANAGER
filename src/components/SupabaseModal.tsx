import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  FileCode2,
  History
} from 'lucide-react';
import {
  SupabaseConfig,
  SupabaseRunRecord
} from '../types/integrations';
import {
  ReconciliationDataset,
  MatchedPair,
  ReconciliationMetrics
} from '../types/reconciliation';
import {
  loadSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  saveRunToSupabase,
  fetchRunsFromSupabase,
  SUPABASE_SQL_SCHEMA,
  resetSupabaseClient
} from '../services/supabaseService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ReconciliationDataset;
  metrics: ReconciliationMetrics | null;
  matchedPairs: MatchedPair[];
  onLoadRun?: (run: SupabaseRunRecord) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  dataset,
  metrics,
  matchedPairs,
  onLoadRun
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(loadSupabaseConfig());
  const [activeTab, setActiveTab] = useState<'sync' | 'history' | 'sql'>('sync');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesFound?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [savedRuns, setSavedRuns] = useState<SupabaseRunRecord[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState<boolean>(false);

  const loadPastRuns = useCallback(async (cfg: SupabaseConfig) => {
    setIsLoadingRuns(true);
    try {
      const runs = await fetchRunsFromSupabase(cfg);
      setSavedRuns(runs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRuns(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const cfg = loadSupabaseConfig();
      setConfig(cfg);
      loadPastRuns(cfg);
    }
  }, [isOpen, loadPastRuns]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    resetSupabaseClient();
    try {
      const res = await testSupabaseConnection(config);
      setTestResult(res);
      if (res.success) {
        const updated = { ...config, isConnected: true };
        setConfig(updated);
        saveSupabaseConfig(updated);
        loadPastRuns(updated);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    resetSupabaseClient();
    saveSupabaseConfig(config);
    setSaveStatus('Supabase configuration saved to browser storage!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleSaveCurrentSession = async () => {
    if (!metrics) return;
    setIsSaving(true);
    setSaveStatus('Writing audit record and exceptions to Supabase...');
    try {
      const res = await saveRunToSupabase(dataset, metrics, matchedPairs, config);
      setSaveStatus(res.message);
      loadPastRuns(config);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleLoadDemoCredentials = () => {
    const demoConfig: SupabaseConfig = {
      url: 'https://demo-reconcile-ai.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key-tick-and-tie-buildathon-2026',
      isConnected: true,
      autoSaveRuns: true
    };
    setConfig(demoConfig);
    saveSupabaseConfig(demoConfig);
    setTestResult({
      success: true,
      tablesFound: true,
      message: 'Demo credentials loaded! Local audit vault caching enabled.'
    });
    loadPastRuns(demoConfig);
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
            background: 'linear-gradient(135deg, #1c1c1c, #0d281e)',
            borderBottom: '1px solid rgba(62, 207, 142, 0.25)',
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
                background: 'linear-gradient(135deg, #3ecf8e, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(62, 207, 142, 0.35)'
              }}
            >
              <Database size={20} color="#0d1117" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.15rem', margin: 0 }}>
                  Cloud Audit Vault
                </h2>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#3ecf8e',
                    color: '#0d1117'
                  }}
                >
                  Supabase DB
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: config.isConnected ? 'rgba(62, 207, 142, 0.18)' : 'rgba(255,255,255,0.1)',
                    color: config.isConnected ? '#3ecf8e' : '#94a3b8',
                    border: config.isConnected ? '1px solid #3ecf8e' : '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  {config.isConnected ? '● Connected' : '○ Not Connected'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                PostgreSQL persistence for month-end close records &amp; honest exception quarantine
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem 0 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <button
            onClick={() => setActiveTab('sync')}
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: activeTab === 'sync' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'sync' ? '2px solid #10b981' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <UploadCloud size={15} />
            <span>Vault &amp; Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: activeTab === 'history' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'history' ? '2px solid #10b981' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <History size={15} />
            <span>Past Runs ({savedRuns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: activeTab === 'sql' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'sql' ? '2px solid #10b981' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileCode2 size={15} />
            <span>SQL Schema DDL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {activeTab === 'sync' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Demo quick toggle banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.08), rgba(16, 185, 129, 0.03))',
                  border: '1px solid rgba(62, 207, 142, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#065f46', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', color: '#047857' }}>
                    ⚡ Instant Setup &amp; Offline Vault Mode
                  </strong>
                  Enter your real Supabase project credentials, or click to populate demo credentials with local caching.
                </div>
                <button
                  className="btn btn-outline"
                  onClick={handleLoadDemoCredentials}
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.35rem 0.75rem',
                    borderColor: '#10b981',
                    color: '#047857',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Load Demo Credentials
                </button>
              </div>

              {/* Supabase URL */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={config.url}
                  onChange={e => setConfig({ ...config, url: e.target.value })}
                  placeholder="https://your-project-id.supabase.co"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
                <span className="form-help">
                  Found in your Supabase Dashboard &gt; Project Settings &gt; API
                </span>
              </div>

              {/* Supabase Anon Key */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Anon Public Key / Service Role Key
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={config.anonKey}
                  onChange={e => setConfig({ ...config, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
                <span className="form-help">
                  Standard public anon key or service role key with write permissions
                </span>
              </div>

              {/* Action buttons: Test Connection & Save Config */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.url || !config.anonKey}
                  style={{ gap: '0.45rem' }}
                >
                  <RefreshCw size={14} className={isTesting ? 'spin-anim' : ''} />
                  <span>{isTesting ? 'Pinging Supabase...' : 'Test Connection'}</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleSaveConfig}
                  style={{ gap: '0.45rem' }}
                >
                  <Check size={14} />
                  <span>Save Configuration</span>
                </button>
              </div>

              {/* Test Connection Result Box */}
              {testResult && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    background: testResult.success ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecdd3'}`,
                    color: testResult.success ? '#15803d' : '#be123c'
                  }}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div style={{ lineHeight: 1.5 }}>
                    <strong>{testResult.success ? 'Connection Verified' : 'Connection Error'}: </strong>
                    {testResult.message}
                    {testResult.tablesFound === false && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => setActiveTab('sql')}
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: '#059669' }}
                        >
                          View SQL Schema DDL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Current Reconciliation Session Card */}
              {metrics && (
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        Ready to Vault: {dataset.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {metrics.reconciliationRate.toFixed(1)}% reconciled • {metrics.tierCounts.exact} exact • {metrics.tierCounts.heuristic} fuzzy • {metrics.tierCounts.exceptions} exceptions
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveCurrentSession}
                      disabled={isSaving}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderColor: '#059669',
                        gap: '0.45rem'
                      }}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw size={14} className="spin-anim" />
                          <span>Vaulting to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={15} />
                          <span>Save Session to Cloud</span>
                        </>
                      )}
                    </button>
                  </div>

                  {saveStatus && (
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} />
                      <span>{saveStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Past Runs Tab */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Showing {savedRuns.length} previous reconciliation sessions vaulted in Supabase
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => loadPastRuns(config)}
                  disabled={isLoadingRuns}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <RefreshCw size={12} className={isLoadingRuns ? 'spin-anim' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {savedRuns.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}
                >
                  No reconciliation runs saved yet. Click <strong>"Save Session to Cloud"</strong> on the Vault tab to save your first run.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {savedRuns.map(run => (
                    <div
                      key={run.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                            {run.dataset_name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: run.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                              color: run.status === 'COMPLETED' ? '#15803d' : '#b45309'
                            }}
                          >
                            {run.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                          <span>📅 {new Date(run.created_at).toLocaleDateString()}</span>
                          <span>🎯 {run.reconciliation_rate}% Match</span>
                          <span>⚠️ {run.exception_count} Exceptions</span>
                          <span>💰 {run.currency} {run.reconciled_volume.toLocaleString()}</span>
                        </div>
                      </div>

                      {onLoadRun && (
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            onLoadRun(run);
                            onClose();
                          }}
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem', borderColor: '#cbd5e1' }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SQL Schema Tab */}
          {activeTab === 'sql' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Run this DDL script in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to create all tables and RLS security policies.
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopySql}
                  style={{ gap: '0.4rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  {copiedSql ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  maxHeight: '320px',
                  lineHeight: 1.5,
                  margin: 0
                }}
              >
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                <ExternalLink size={12} />
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#059669', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Open Supabase Dashboard
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
