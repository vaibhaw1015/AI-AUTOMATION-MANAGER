import React, { useState } from 'react';
import {
  X,
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { ReconciliationDataset } from '../types/reconciliation';
import { parseFinancialCSV } from '../engine/csvParser';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: (dataset: ReconciliationDataset) => void;
}

type Step = 'input' | 'fetching' | 'success' | 'error';

function toPublishedCsvUrl(raw: string): string {
  // If already a direct CSV export link — return as-is
  if (raw.includes('export?format=csv') || raw.includes('output=csv')) return raw;

  // Convert normal sheet URL → CSV export URL
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID
  const sheetMatch = raw.match(/\/spreadsheets\/d\/([\w-]+)/);
  const gidMatch = raw.match(/gid=(\d+)/);
  if (sheetMatch) {
    const sheetId = sheetMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  // Published-to-web URL
  const pubMatch = raw.match(/\/spreadsheets\/d\/e\/([\w-]+)\/pubhtml/);
  if (pubMatch) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
  }

  return raw;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  onDatasetCreated
}) => {
  const [bankUrl, setBankUrl] = useState('');
  const [ledgerUrl, setLedgerUrl] = useState('');
  const [datasetName, setDatasetName] = useState('Google Sheets Import');
  const [currency, setCurrency] = useState('INR');
  const [step, setStep] = useState<Step>('input');
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const log = (msg: string) => setStatusLog(prev => [...prev, msg]);

  const handleImport = async () => {
    if (!bankUrl.trim() || !ledgerUrl.trim()) {
      setErrorMsg('Please enter both Bank and Ledger sheet URLs.');
      return;
    }
    setErrorMsg('');
    setStep('fetching');
    setStatusLog([]);

    try {
      const bankCsvUrl = toPublishedCsvUrl(bankUrl.trim());
      const ledgerCsvUrl = toPublishedCsvUrl(ledgerUrl.trim());

      log('🔗 Connecting to Google Sheets...');
      await new Promise(r => setTimeout(r, 400));

      log('📥 Fetching Bank Statement sheet...');
      const bankResp = await fetch(bankCsvUrl);
      if (!bankResp.ok) throw new Error(`Bank sheet fetch failed: ${bankResp.status} ${bankResp.statusText}`);
      const bankCsv = await bankResp.text();
      log(`✅ Bank sheet loaded — ${bankCsv.split('\n').length - 1} rows detected`);

      await new Promise(r => setTimeout(r, 300));

      log('📥 Fetching Ledger / GL sheet...');
      const ledgerResp = await fetch(ledgerCsvUrl);
      if (!ledgerResp.ok) throw new Error(`Ledger sheet fetch failed: ${ledgerResp.status} ${ledgerResp.statusText}`);
      const ledgerCsv = await ledgerResp.text();
      log(`✅ Ledger sheet loaded — ${ledgerCsv.split('\n').length - 1} rows detected`);

      await new Promise(r => setTimeout(r, 300));

      log('🧠 Parsing & auto-detecting columns...');
      const bankResult = parseFinancialCSV(bankCsv, 'bank');
      const ledgerResult = parseFinancialCSV(ledgerCsv, 'ledger');

      if (bankResult.transactions.length === 0) {
        throw new Error('No valid transactions found in the Bank sheet. Check column headers (date, amount, description).');
      }
      if (ledgerResult.transactions.length === 0) {
        throw new Error('No valid transactions found in the Ledger sheet. Check column headers (date, amount, description).');
      }

      log(`✅ Parsed ${bankResult.transactions.length} bank transactions`);
      log(`✅ Parsed ${ledgerResult.transactions.length} ledger transactions`);

      if (bankResult.errors.length > 0) {
        log(`⚠️ ${bankResult.errors.length} bank rows skipped (parse errors)`);
      }
      if (ledgerResult.errors.length > 0) {
        log(`⚠️ ${ledgerResult.errors.length} ledger rows skipped (parse errors)`);
      }

      await new Promise(r => setTimeout(r, 400));
      log('🚀 Creating reconciliation dataset...');

      const dataset: ReconciliationDataset = {
        id: `sheets-${Date.now()}`,
        name: datasetName || 'Google Sheets Import',
        description: `Live import from Google Sheets (Bank: ${bankResult.transactions.length} records, Ledger: ${ledgerResult.transactions.length} records). Auto-detected columns: date="${bankResult.detectedMapping.dateCol}", amount="${bankResult.detectedMapping.amountCol}".`,
        currency,
        bankName: 'Google Sheets — Bank Statement',
        ledgerName: 'Google Sheets — General Ledger',
        bankTransactions: bankResult.transactions,
        ledgerTransactions: ledgerResult.transactions
      };

      log('✅ Dataset ready! Launching reconciliation...');
      await new Promise(r => setTimeout(r, 300));

      setStep('success');
      setTimeout(() => {
        onDatasetCreated(dataset);
        onClose();
        setStep('input');
        setStatusLog([]);
        setBankUrl('');
        setLedgerUrl('');
      }, 1200);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message.includes('Failed to fetch')
        ? 'Could not reach the Google Sheet. Make sure it is published to web (File → Share → Publish to web → CSV).'
        : message
      );
      setStep('error');
    }
  };

  const handleReset = () => {
    setStep('input');
    setStatusLog([]);
    setErrorMsg('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '560px' }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #0f7f3e, #16a34a)',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.05rem' }}>
                Import from Google Sheets
              </h2>
              <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                100% Free — No API key or Google Cloud needed
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose} style={{ color: 'rgba(255,255,255,0.8)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* How-to banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(15,127,62,0.04))',
            border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            fontSize: '0.78rem',
            color: '#166534',
            lineHeight: 1.6
          }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#15803d' }}>
              <Sparkles size={14} /> How to get your Sheet URL (free, 30 seconds):
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {[
                'Open your Google Sheet',
                'File → Share → Publish to web',
                'Select "Comma-separated values (.csv)" → Publish',
                'Copy the URL and paste it below'
              ].map((step, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{
                    background: '#16a34a', color: '#fff', borderRadius: '50%',
                    width: '16px', height: '16px', fontSize: '0.6rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px'
                  }}>{i + 1}</span>
                  {step}
                </span>
              ))}
            </div>
            <a
              href="https://support.google.com/docs/answer/37579"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#15803d', fontWeight: 700, marginTop: '0.5rem', fontSize: '0.73rem' }}
            >
              <ExternalLink size={12} /> Google's official guide
            </a>
          </div>

          {/* Dataset Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Dataset Name</label>
            <input
              type="text"
              className="form-input"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              placeholder="e.g. August 2026 — Google Sheets Reconciliation"
            />
          </div>

          {/* Currency */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Currency</label>
            <select
              className="form-input"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Bank URL */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                Bank Statement — Published Sheet URL
              </span>
            </label>
            <input
              type="url"
              className="form-input"
              value={bankUrl}
              onChange={e => setBankUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              disabled={step === 'fetching'}
            />
            <span className="form-help">
              Sheet must have columns: <code>date</code>, <code>amount</code>, <code>description</code> (names are auto-detected)
            </span>
          </div>

          {/* Ledger URL */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                General Ledger — Published Sheet URL
              </span>
            </label>
            <input
              type="url"
              className="form-input"
              value={ledgerUrl}
              onChange={e => setLedgerUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              disabled={step === 'fetching'}
            />
          </div>

          {/* Status log */}
          {(step === 'fetching' || step === 'success') && statusLog.length > 0 && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              {statusLog.map((msg, i) => (
                <div key={i} style={{
                  fontSize: '0.77rem',
                  color: '#15803d',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: i === statusLog.length - 1 ? 1 : 0.65
                }}>
                  {i === statusLog.length - 1 && step === 'fetching'
                    ? <RefreshCw size={11} className="spin-anim" />
                    : <ChevronRight size={11} />
                  }
                  {msg}
                </div>
              ))}
            </div>
          )}

          {/* Success state */}
          {step === 'success' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: '#15803d', fontWeight: 700, fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} color="#16a34a" />
              Import successful! Launching reconciliation...
            </div>
          )}

          {/* Error state */}
          {step === 'error' && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: '8px', padding: '0.85rem',
              display: 'flex', gap: '0.6rem', alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#be123c', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  Import Failed
                </div>
                <div style={{ fontSize: '0.77rem', color: '#9f1239', lineHeight: 1.5 }}>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Error input validation */}
          {errorMsg && step === 'input' && (
            <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc' }}>
          {step === 'error' ? (
            <>
              <button className="btn btn-outline" onClick={handleReset}>
                Try Again
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={onClose} disabled={step === 'fetching'}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={step === 'fetching' || step === 'success'}
                style={{ background: '#16a34a', borderColor: '#16a34a', gap: '0.5rem' }}
              >
                {step === 'fetching' ? (
                  <><RefreshCw size={15} className="spin-anim" /><span>Importing...</span></>
                ) : step === 'success' ? (
                  <><CheckCircle2 size={15} /><span>Done!</span></>
                ) : (
                  <><Link2 size={15} /><span>Import & Reconcile</span></>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
