import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import {
  ReconciliationDataset,
  MatchedPair,
  ReconciliationMetrics,
  LLMConfig
} from './types/reconciliation';
import { MOCK_DATASETS } from './data/mockDatasets';
import { runReconciliationPipeline } from './engine/matcher';
import { loadLLMConfig, saveLLMConfig } from './engine/llmService';
import { loadSupabaseConfig } from './services/supabaseService';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ReconciliationWorkspace } from './components/ReconciliationWorkspace';
import { AuditDrawer } from './components/AuditDrawer';
import { ExceptionRegistry } from './components/ExceptionRegistry';
import { LLMSettingsModal } from './components/LLMSettingsModal';
import { FileUploadModal } from './components/FileUploadModal';
import { ExportModal } from './components/ExportModal';
import { RazorpayConnectModal } from './components/RazorpayConnectModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SupabaseModal } from './components/SupabaseModal';
import { SlackModal } from './components/SlackModal';

export const App: React.FC = () => {
  const [datasets, setDatasets] = useState<ReconciliationDataset[]>(MOCK_DATASETS);
  const [activeDataset, setActiveDataset] = useState<ReconciliationDataset>(MOCK_DATASETS[0]);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(loadLLMConfig());
  const [supabaseConfig, setSupabaseConfig] = useState(loadSupabaseConfig());

  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([]);
  const [metrics, setMetrics] = useState<ReconciliationMetrics | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedPair, setSelectedPair] = useState<MatchedPair | null>(null);

  const [activeView, setActiveView] = useState<'studio' | 'exceptions'>('studio');
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isLLMSettingsOpen, setIsLLMSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState<boolean>(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState<boolean>(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState<boolean>(false);
  const [isSlackOpen, setIsSlackOpen] = useState<boolean>(false);
  const [slackTargetPair, setSlackTargetPair] = useState<MatchedPair | null>(null);

  // Execute reconciliation pipeline
  const executeReconciliation = useCallback(
    async (datasetToRun: ReconciliationDataset, config: LLMConfig, triggerConfetti = false) => {
      setIsRunning(true);
      try {
        // Small artificial delay for visual feedback if running manually
        if (triggerConfetti) {
          await new Promise(r => setTimeout(r, 600));
        }

        const result = await runReconciliationPipeline(datasetToRun, config);
        setMatchedPairs(result.matchedPairs);
        setMetrics(result.metrics);

        if (triggerConfetti) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.2 },
            colors: ['#6366f1', '#10b981', '#06b6d4', '#a855f7']
          });
        }
      } catch (err) {
        console.error('Reconciliation error:', err);
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  // Run on mount or dataset change
  useEffect(() => {
    executeReconciliation(activeDataset, llmConfig, false);
  }, [activeDataset, executeReconciliation, llmConfig]);

  // Handle dataset switch
  const handleSelectDataset = (dataset: ReconciliationDataset) => {
    setActiveDataset(dataset);
    setSelectedPair(null);
  };

  // Handle custom dataset uploaded
  const handleDatasetCreated = (newDataset: ReconciliationDataset) => {
    setDatasets(prev => [newDataset, ...prev]);
    setActiveDataset(newDataset);
    setSelectedPair(null);
    executeReconciliation(newDataset, llmConfig, true);
  };

  // Handle LLM config update
  const handleSaveLLMConfig = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    saveLLMConfig(newConfig);
    executeReconciliation(activeDataset, newConfig, true);
  };

  // Human-in-the-loop: confirm or unlink a pair
  const handleUpdateStatus = (pairId: string, status: 'confirmed' | 'rejected') => {
    setMatchedPairs(prev =>
      prev.map(p => {
        if (p.id === pairId) {
          return {
            ...p,
            status,
            tier: status === 'rejected' ? 'UNMATCHED' : p.tier
          };
        }
        return p;
      })
    );
    if (selectedPair?.id === pairId) {
      setSelectedPair(prev => (prev ? { ...prev, status, tier: status === 'rejected' ? 'UNMATCHED' : prev.tier } : null));
    }
  };

  // Human-in-the-loop: save auditor notes
  const handleSaveNotes = (pairId: string, notes: string) => {
    setMatchedPairs(prev =>
      prev.map(p => (p.id === pairId ? { ...p, auditorNotes: notes } : p))
    );
    if (selectedPair?.id === pairId) {
      setSelectedPair(prev => (prev ? { ...prev, auditorNotes: notes } : null));
    }
  };

  const getProviderLabel = () => {
    switch (llmConfig.provider) {
      case 'gemini': return 'Gemini AI';
      case 'groq': return 'Groq Llama 3';
      case 'ollama': return 'Local Ollama';
      case 'custom': return 'Custom API';
      default: return 'Built-in Reasoner';
    }
  };

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        datasets={datasets}
        activeDataset={activeDataset}
        onSelectDataset={handleSelectDataset}
        onRunReconciliation={() => executeReconciliation(activeDataset, llmConfig, true)}
        isRunning={isRunning}
        onNavigateHome={() => setShowLanding(true)}
      />

      {/* Horizontal Workspace with Left Navigation Sidebar */}
      <div className="workspace-wrapper" style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)', width: '100%', position: 'relative' }}>
        {/* Dedicated Left Navigation Bar */}
        <Sidebar
          activeView={activeView}
          onSelectView={view => setActiveView(view)}
          exceptionCount={metrics?.tierCounts.exceptions || 0}
          onOpenSupabaseVault={() => setIsSupabaseOpen(true)}
          onOpenSlackDispatch={() => {
            setSlackTargetPair(null);
            setIsSlackOpen(true);
          }}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
          onOpenRazorpay={() => setIsRazorpayOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenLLMSettings={() => setIsLLMSettingsOpen(true)}
          isSupabaseConnected={supabaseConfig.isConnected}
          llmProviderLabel={getProviderLabel()}
        />

        {/* Main Workspace Layout */}
        <main className="main-layout" style={{ flex: 1, minWidth: 0, padding: '1.5rem 2rem' }}>
          {/* Executive Metrics Dashboard */}
          {metrics && (
            <MetricsDashboard metrics={metrics} currency={activeDataset.currency} />
          )}

          {/* View Switcher: Reconciliation Studio vs Honest Exception Registry */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className={`btn ${activeView === 'studio' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveView('studio')}
              >
                <Layers size={16} />
                <span>Dual-Pane Tick &amp; Tie Studio</span>
              </button>
              <button
                className={`btn ${activeView === 'exceptions' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveView('exceptions')}
                style={activeView === 'exceptions' ? { background: 'linear-gradient(135deg, #f43f5e, #e11d48)' } : {}}
              >
                <AlertOctagon size={16} />
                <span>
                  Honest Exception Registry ({metrics?.tierCounts.exceptions || 0})
                </span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-exact)' }} />
                Zero Hallucination
              </span>
              <span>&bull;</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingUp size={14} style={{ color: 'var(--accent-primary)' }} />
                Automated Month-End Close
              </span>
            </div>
          </div>

          {/* View 1: Dual-Pane Reconciliation Workspace */}
          {activeView === 'studio' && (
            <ReconciliationWorkspace
              dataset={activeDataset}
              matchedPairs={matchedPairs}
              selectedPair={selectedPair}
              onSelectPair={pair => setSelectedPair(pair)}
              currency={activeDataset.currency}
            />
          )}

          {/* View 2: Dedicated Honest Exception Registry */}
          {activeView === 'exceptions' && (
            <ExceptionRegistry
              matchedPairs={matchedPairs}
              dataset={activeDataset}
              onSelectPair={pair => setSelectedPair(pair)}
              onAlertSlack={pair => {
                setSlackTargetPair(pair);
                setIsSlackOpen(true);
              }}
              onSyncSupabase={() => setIsSupabaseOpen(true)}
              currency={activeDataset.currency}
            />
          )}
        </main>
      </div>

      {/* Slide-in Audit Drawer */}
      <AuditDrawer
        pair={selectedPair}
        dataset={activeDataset}
        onClose={() => setSelectedPair(null)}
        onUpdateStatus={handleUpdateStatus}
        onSaveNotes={handleSaveNotes}
        currency={activeDataset.currency}
      />

      {/* Modals */}
      <LLMSettingsModal
        isOpen={isLLMSettingsOpen}
        onClose={() => setIsLLMSettingsOpen(false)}
        config={llmConfig}
        onSaveConfig={handleSaveLLMConfig}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetCreated={handleDatasetCreated}
      />

      {metrics && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          dataset={activeDataset}
          matchedPairs={matchedPairs}
          metrics={metrics}
          onOpenSupabase={() => {
            setIsExportOpen(false);
            setIsSupabaseOpen(true);
          }}
          onOpenSlack={() => {
            setIsExportOpen(false);
            setSlackTargetPair(null);
            setIsSlackOpen(true);
          }}
        />
      )}

      {/* Supabase Cloud Vault Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => {
          setIsSupabaseOpen(false);
          setSupabaseConfig(loadSupabaseConfig());
        }}
        dataset={activeDataset}
        metrics={metrics}
        matchedPairs={matchedPairs}
      />

      {/* Slack Notifications Modal */}
      <SlackModal
        isOpen={isSlackOpen}
        onClose={() => {
          setIsSlackOpen(false);
          setSlackTargetPair(null);
        }}
        dataset={activeDataset}
        metrics={metrics}
        matchedPairs={matchedPairs}
        initialPairToAlert={slackTargetPair}
      />

      <RazorpayConnectModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        onDatasetCreated={(newDataset) => {
          setDatasets(prev => [newDataset, ...prev]);
          setActiveDataset(newDataset);
          setSelectedPair(null);
          executeReconciliation(newDataset, llmConfig, true);
        }}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onDatasetCreated={(newDataset) => {
          setDatasets(prev => [newDataset, ...prev]);
          setActiveDataset(newDataset);
          setSelectedPair(null);
          executeReconciliation(newDataset, llmConfig, true);
        }}
      />
    </div>
  );
};

export default App;
