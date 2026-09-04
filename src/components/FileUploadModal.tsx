import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { parseFinancialCSV, CSVParseResult } from '../engine/csvParser';
import { ReconciliationDataset } from '../types/reconciliation';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: (dataset: ReconciliationDataset) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetCreated
}) => {
  const [bankFileName, setBankFileName] = useState<string>('');
  const [bankParseResult, setBankParseResult] = useState<CSVParseResult | null>(null);

  const [ledgerFileName, setLedgerFileName] = useState<string>('');
  const [ledgerParseResult, setLedgerParseResult] = useState<CSVParseResult | null>(null);

  const [currency, setCurrency] = useState<string>('USD');
  const [datasetName, setDatasetName] = useState<string>('Custom Upload Close');

  if (!isOpen) return null;

  const handleBankFile = (file: File) => {
    setBankFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const res = parseFinancialCSV(text, 'bank');
      setBankParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleLedgerFile = (file: File) => {
    setLedgerFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const res = parseFinancialCSV(text, 'ledger');
      setLedgerParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleCreateDataset = () => {
    if (!bankParseResult || !ledgerParseResult) return;
    if (bankParseResult.transactions.length === 0 || ledgerParseResult.transactions.length === 0) return;

    const newDataset: ReconciliationDataset = {
      id: `custom-${Date.now()}`,
      name: datasetName || 'Custom Upload Reconciliation',
      description: `User-uploaded files: ${bankFileName} vs ${ledgerFileName}`,
      currency,
      bankName: bankFileName || 'Uploaded Bank Feed',
      ledgerName: ledgerFileName || 'Uploaded General Ledger',
      bankTransactions: bankParseResult.transactions,
      ledgerTransactions: ledgerParseResult.transactions
    };

    onDatasetCreated(newDataset);
    onClose();
  };

  const isReady =
    bankParseResult &&
    ledgerParseResult &&
    bankParseResult.transactions.length > 0 &&
    ledgerParseResult.transactions.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UploadCloud size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">Upload Financial Record-Sets (CSV)</h3>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Upload your Bank Statement CSV (Record Set A) and your Internal Books/Ledger CSV (Record Set B).
            The intelligent parser will auto-detect Date, Amount, Description, and Reference columns.
          </p>

          {/* Dataset Name & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Reconciliation Job Name</label>
              <input
                type="text"
                className="form-input"
                value={datasetName}
                onChange={e => setDatasetName(e.target.value)}
                placeholder="e.g. August 2026 Close"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Side by side upload zones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Bank CSV Box */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                1. Bank Feed / Gateway CSV
              </label>
              <label className="dropzone-box" style={{ display: 'block' }}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleBankFile(e.target.files[0])}
                />
                <UploadCloud size={28} style={{ color: 'var(--color-heuristic)', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {bankFileName || 'Click to select Bank CSV'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {bankParseResult
                    ? `✓ Parsed ${bankParseResult.transactions.length} rows`
                    : 'Supported: CSV, TSV exports'}
                </div>
              </label>
              {bankParseResult && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Mapped: Date (<strong>{bankParseResult.detectedMapping.dateCol}</strong>), Amount (<strong>{bankParseResult.detectedMapping.amountCol}</strong>)
                </div>
              )}
            </div>

            {/* Ledger CSV Box */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                2. General Ledger / ERP CSV
              </label>
              <label className="dropzone-box" style={{ display: 'block' }}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleLedgerFile(e.target.files[0])}
                />
                <UploadCloud size={28} style={{ color: 'var(--color-ai)', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {ledgerFileName || 'Click to select Ledger CSV'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {ledgerParseResult
                    ? `✓ Parsed ${ledgerParseResult.transactions.length} rows`
                    : 'Supported: QuickBooks, NetSuite, SAP'}
                </div>
              </label>
              {ledgerParseResult && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Mapped: Date (<strong>{ledgerParseResult.detectedMapping.dateCol}</strong>), Amount (<strong>{ledgerParseResult.detectedMapping.amountCol}</strong>)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateDataset}
            disabled={!isReady}
          >
            <span>Ingest &amp; Run Reconciliation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
