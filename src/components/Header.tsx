import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { ReconciliationDataset } from '../types/reconciliation';

interface HeaderProps {
  datasets: ReconciliationDataset[];
  activeDataset: ReconciliationDataset;
  onSelectDataset: (dataset: ReconciliationDataset) => void;
  onRunReconciliation: () => void;
  isRunning: boolean;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onRunReconciliation,
  isRunning,
  onNavigateHome
}) => {
  return (
    <header className="app-header">
      <div
        className="brand-section"
        style={{ cursor: onNavigateHome ? 'pointer' : 'default' }}
        onClick={onNavigateHome}
        title={onNavigateHome ? 'Click to return to Landing Page' : 'Tick & Tie AI Reconciliation Engine'}
      >
        <div className="logo-badge" title="Tick & Tie AI Reconciliation Engine">
          <Sparkles size={22} />
        </div>
        <div className="brand-title-wrap">
          <h1>
            Tick &amp; Tie AI
            <span className="tag-version">Agentic CPA v2.6</span>
          </h1>
          <p className="brand-subtitle">
            Autonomous Financial Verification &bull; Multi-Tier Matching &bull; Honest Exceptions
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Dataset Switcher */}
        <div className="dataset-select-wrap">
          <label htmlFor="dataset-select">Dataset</label>
          <select
            id="dataset-select"
            className="dataset-select"
            value={activeDataset.id}
            onChange={e => {
              const found = datasets.find(d => d.id === e.target.value);
              if (found) onSelectDataset(found);
            }}
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action: Reconcile Books */}
        <button
          className={`btn btn-primary ${isRunning ? 'btn-running' : ''}`}
          onClick={onRunReconciliation}
          disabled={isRunning}
          id="run-reconciliation-btn"
          style={{ padding: '0.55rem 1.25rem', gap: '0.6rem' }}
        >
          <RefreshCw size={16} className={isRunning ? 'spin-anim' : ''} />
          <span>{isRunning ? 'Analyzing Records...' : 'Reconcile Books'}</span>
        </button>
      </div>
    </header>
  );
};
