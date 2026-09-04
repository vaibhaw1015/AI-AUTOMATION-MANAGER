import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import {
  Transaction,
  MatchedPair,
  ReconciliationDataset
} from '../types/reconciliation';

interface ReconciliationWorkspaceProps {
  dataset: ReconciliationDataset;
  matchedPairs: MatchedPair[];
  selectedPair: MatchedPair | null;
  onSelectPair: (pair: MatchedPair) => void;
  currency: string;
}

type TabType = 'all' | 'tied' | 'ai' | 'exceptions';

export const ReconciliationWorkspace: React.FC<ReconciliationWorkspaceProps> = ({
  dataset,
  matchedPairs,
  selectedPair,
  onSelectPair,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredPairId, setHoveredPairId] = useState<string | null>(null);

  // Map transaction ID to its MatchedPair
  const bankTxToPairMap = new Map<string, MatchedPair>();
  const ledgerTxToPairMap = new Map<string, MatchedPair>();

  for (const pair of matchedPairs) {
    for (const bId of pair.bankTxIds) {
      bankTxToPairMap.set(bId, pair);
    }
    for (const lId of pair.ledgerTxIds) {
      ledgerTxToPairMap.set(lId, pair);
    }
  }

  // Filter pairs by tab
  const filterPair = (pair: MatchedPair) => {
    if (activeTab === 'tied') return pair.tier === 'EXACT' || pair.tier === 'HEURISTIC';
    if (activeTab === 'ai') return pair.tier === 'AI_SEMANTIC' || pair.isSplit;
    if (activeTab === 'exceptions') return pair.tier === 'UNMATCHED' || pair.status === 'exception';
    return true;
  };

  // Search filter
  const matchesSearch = (tx: Transaction) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.description.toLowerCase().includes(q) ||
      tx.reference.toLowerCase().includes(q) ||
      tx.amount.toString().includes(q) ||
      tx.date.includes(q)
    );
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const renderBadge = (pair?: MatchedPair) => {
    if (!pair) return null;
    if (pair.tier === 'EXACT') {
      return <span className="status-badge badge-exact">Tied (100%)</span>;
    }
    if (pair.tier === 'HEURISTIC') {
      return <span className="status-badge badge-heuristic">Fuzzy ({pair.confidence}%)</span>;
    }
    if (pair.tier === 'AI_SEMANTIC') {
      return (
        <span className="status-badge badge-ai">
          <Sparkles size={10} />
          {pair.isSplit ? 'AI Split Batch' : `AI Judgment (${pair.confidence}%)`}
        </span>
      );
    }
    return (
      <span className="status-badge badge-exception">
        <AlertOctagon size={10} />
        Exception
      </span>
    );
  };

  // Counts for tabs
  const tiedCount = matchedPairs.filter(p => p.tier === 'EXACT' || p.tier === 'HEURISTIC').length;
  const aiCount = matchedPairs.filter(p => p.tier === 'AI_SEMANTIC' || p.isSplit).length;
  const exceptionCount = matchedPairs.filter(p => p.tier === 'UNMATCHED' || p.status === 'exception').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="tabs-group">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All Records</span>
            <span className="tab-count">{matchedPairs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'tied' ? 'active' : ''}`}
            onClick={() => setActiveTab('tied')}
          >
            <span>Ticked &amp; Tied</span>
            <span className="tab-count">{tiedCount}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Sparkles size={12} />
            <span>AI Reasoning &amp; Splits</span>
            <span className="tab-count">{aiCount}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('exceptions')}
          >
            <AlertOctagon size={12} />
            <span>Honest Exceptions</span>
            <span className="tab-count">{exceptionCount}</span>
          </button>
        </div>

        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search vendor, amount, reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Dual Pane Ledger Workspace */}
      <div className="reconciliation-grid">
        {/* LEFT PANE: Bank Feed */}
        <div className="ledger-pane">
          <div className="pane-header">
            <div className="pane-title-group">
              <span className="pane-badge bank">Bank Statement</span>
              <h2 className="pane-title">{dataset.bankName}</h2>
            </div>
            <div className="pane-stats">
              {dataset.bankTransactions.length} items &bull;{' '}
              {formatMoney(
                dataset.bankTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0)
              )}
            </div>
          </div>

          <div className="tx-table-container">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description / Ref</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dataset.bankTransactions
                  .filter(matchesSearch)
                  .filter(tx => {
                    const pair = bankTxToPairMap.get(tx.id);
                    return pair ? filterPair(pair) : activeTab === 'all';
                  })
                  .map(tx => {
                    const pair = bankTxToPairMap.get(tx.id);
                    const isSelected = selectedPair?.id === pair?.id;
                    const isHovered = hoveredPairId === pair?.id;
                    const isException = pair?.tier === 'UNMATCHED';

                    return (
                      <tr
                        key={tx.id}
                        className={`tx-row ${isSelected ? 'selected' : ''} ${
                          isHovered && !isSelected ? 'linked-highlight' : ''
                        } ${isException ? 'exception-row' : ''}`}
                        onClick={() => pair && onSelectPair(pair)}
                        onMouseEnter={() => pair && setHoveredPairId(pair.id)}
                        onMouseLeave={() => setHoveredPairId(null)}
                      >
                        <td className="tx-date font-mono">{tx.date}</td>
                        <td className="tx-desc-cell">
                          <div className="tx-desc" title={tx.description}>
                            {tx.description}
                          </div>
                          <div className="tx-ref font-mono">{tx.reference}</div>
                        </td>
                        <td className={`tx-amount ${tx.amount >= 0 ? 'credit' : 'debit'}`}>
                          {tx.amount >= 0 ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </td>
                        <td>{renderBadge(pair)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANE: General Ledger */}
        <div className="ledger-pane">
          <div className="pane-header">
            <div className="pane-title-group">
              <span className="pane-badge ledger">Internal Books</span>
              <h2 className="pane-title">{dataset.ledgerName}</h2>
            </div>
            <div className="pane-stats">
              {dataset.ledgerTransactions.length} items &bull;{' '}
              {formatMoney(
                dataset.ledgerTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0)
              )}
            </div>
          </div>

          <div className="tx-table-container">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description / Ref</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dataset.ledgerTransactions
                  .filter(matchesSearch)
                  .filter(tx => {
                    const pair = ledgerTxToPairMap.get(tx.id);
                    return pair ? filterPair(pair) : activeTab === 'all';
                  })
                  .map(tx => {
                    const pair = ledgerTxToPairMap.get(tx.id);
                    const isSelected = selectedPair?.id === pair?.id;
                    const isHovered = hoveredPairId === pair?.id;
                    const isException = pair?.tier === 'UNMATCHED';

                    return (
                      <tr
                        key={tx.id}
                        className={`tx-row ${isSelected ? 'selected' : ''} ${
                          isHovered && !isSelected ? 'linked-highlight' : ''
                        } ${isException ? 'exception-row' : ''}`}
                        onClick={() => pair && onSelectPair(pair)}
                        onMouseEnter={() => pair && setHoveredPairId(pair.id)}
                        onMouseLeave={() => setHoveredPairId(null)}
                      >
                        <td className="tx-date font-mono">{tx.date}</td>
                        <td className="tx-desc-cell">
                          <div className="tx-desc" title={tx.description}>
                            {tx.description}
                          </div>
                          <div className="tx-ref font-mono">{tx.reference}</div>
                        </td>
                        <td className={`tx-amount ${tx.amount >= 0 ? 'credit' : 'debit'}`}>
                          {tx.amount >= 0 ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </td>
                        <td>{renderBadge(pair)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
