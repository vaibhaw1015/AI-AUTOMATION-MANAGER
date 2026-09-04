import React, { useState } from 'react';
import {
  Layers,
  AlertOctagon,
  FileSpreadsheet,
  Database,
  MessageSquare,
  UploadCloud,
  Download,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'studio' | 'exceptions';
  onSelectView: (view: 'studio' | 'exceptions') => void;
  exceptionCount: number;
  onOpenRazorpay: () => void;
  onOpenGoogleSheets: () => void;
  onOpenSupabaseVault: () => void;
  onOpenSlackDispatch: () => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onOpenLLMSettings: () => void;
  isSupabaseConnected: boolean;
  llmProviderLabel: string;
}

const BG = '#1976D2';
const BG_DARK = '#1565C0';
const WHITE = '#ffffff';
const WHITE_DIM = 'rgba(255,255,255,0.75)';
const WHITE_FAINT = 'rgba(255,255,255,0.5)';
const ACTIVE_BG = 'rgba(255,255,255,0.2)';
const HOVER_BG = 'rgba(255,255,255,0.1)';
const DIVIDER = 'rgba(255,255,255,0.18)';

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  exceptionCount,
  onOpenRazorpay,
  onOpenGoogleSheets,
  onOpenSupabaseVault,
  onOpenSlackDispatch,
  onOpenUpload,
  onOpenExport,
  onOpenLLMSettings,
  isSupabaseConnected,
  llmProviderLabel,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const w = isCollapsed ? '72px' : '260px';

  const navBtn = (active: boolean) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.75rem',
    width: '100%',
    padding: isCollapsed ? '0.65rem' : '0.65rem 0.85rem',
    justifyContent: (isCollapsed ? 'center' : 'flex-start') as 'center' | 'flex-start',
    borderRadius: '8px',
    border: `1px solid ${active ? WHITE : DIVIDER}`,
    background: active ? ACTIVE_BG : HOVER_BG,
    color: WHITE,
    fontWeight: active ? 700 : 500,
    fontSize: '0.85rem',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
  });

  const integrationBtn = () => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.75rem',
    width: '100%',
    padding: isCollapsed ? '0.65rem' : '0.6rem 0.85rem',
    justifyContent: (isCollapsed ? 'center' : 'flex-start') as 'center' | 'flex-start',
    borderRadius: '8px',
    border: `1px solid ${DIVIDER}`,
    background: HOVER_BG,
    color: WHITE,
    fontWeight: 600,
    fontSize: '0.84rem',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
  });

  const iconBox = (bg: string) => ({
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: bg,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0 as const,
  });

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 100%)`,
        borderRight: `1px solid ${DIVIDER}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 65px)',
        position: 'sticky',
        top: '65px',
        zIndex: 30,
        userSelect: 'none',
        boxShadow: '3px 0 16px rgba(21,101,192,0.3)',
      }}
    >
      {/* Scrollable content */}
      <div style={{ padding: isCollapsed ? '1rem 0.5rem' : '1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', overflowX: 'hidden' }}>

        {/* ── VIEWS ── */}
        <div>
          {!isCollapsed && <div style={{ fontSize: '0.68rem', fontWeight: 800, color: WHITE_FAINT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>Views</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

            <button onClick={() => onSelectView('studio')} style={navBtn(activeView === 'studio')} title="Tick & Tie Studio">
              <Layers size={18} color={WHITE} />
              {!isCollapsed && <span>Tick &amp; Tie Studio</span>}
            </button>

            <button onClick={() => onSelectView('exceptions')} style={navBtn(activeView === 'exceptions')} title="Honest Exceptions">
              <AlertOctagon size={18} color={WHITE} />
              {!isCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Honest Exceptions</span>
                  {exceptionCount > 0 && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '1px 7px', borderRadius: '10px', background: 'rgba(255,255,255,0.25)', color: WHITE }}>
                      {exceptionCount}
                    </span>
                  )}
                </div>
              )}
            </button>

          </div>
        </div>

        {/* ── INTEGRATIONS ── */}
        <div>
          {!isCollapsed && <div style={{ fontSize: '0.68rem', fontWeight: 800, color: WHITE_FAINT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>Integrations</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

            {/* Cloud Audit Vault — Supabase */}
            <button onClick={onOpenSupabaseVault} style={integrationBtn()} title="Cloud Audit Vault (Supabase)">
              <div style={iconBox('linear-gradient(135deg,#3ecf8e,#10b981)')}>
                <Database size={14} color={WHITE} />
              </div>
              {!isCollapsed && (
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontWeight: 700 }}>Cloud Audit Vault</span>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isSupabaseConnected ? '#6ee7b7' : WHITE_FAINT, display: 'inline-block' }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: WHITE_DIM }}>Supabase · PostgreSQL</div>
                </div>
              )}
            </button>

            {/* Team Alert Broadcast — Slack */}
            <button onClick={onOpenSlackDispatch} style={integrationBtn()} title="Team Alert Broadcast (Slack)">
              <div style={iconBox('#4A154B')}>
                <MessageSquare size={14} color="#ECB22E" />
              </div>
              {!isCollapsed && (
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 700, display: 'block' }}>Team Alert Broadcast</span>
                  <span style={{ fontSize: '0.68rem', color: WHITE_DIM }}>Slack · Incident Comms</span>
                </div>
              )}
            </button>

            {/* Google Sheets */}
            <button onClick={onOpenGoogleSheets} style={integrationBtn()} title="Google Sheets Sync">
              <div style={iconBox('#16a34a')}>
                <FileSpreadsheet size={14} color={WHITE} />
              </div>
              {!isCollapsed && (
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 700, display: 'block' }}>Google Sheets Sync</span>
                  <span style={{ fontSize: '0.68rem', color: WHITE_DIM }}>Live Cloud Feed</span>
                </div>
              )}
            </button>

            {/* Razorpay */}
            <button onClick={onOpenRazorpay} style={integrationBtn()} title="Razorpay Gateway">
              <div style={{ ...iconBox('#3395ff'), fontWeight: 900, fontSize: '0.82rem', color: WHITE }}>
                R
              </div>
              {!isCollapsed && (
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 700, display: 'block' }}>Razorpay Gateway</span>
                  <span style={{ fontSize: '0.68rem', color: WHITE_DIM }}>D2C Settlement Batches</span>
                </div>
              )}
            </button>

          </div>
        </div>

        {/* ── OPERATIONS ── */}
        <div>
          {!isCollapsed && <div style={{ fontSize: '0.68rem', fontWeight: 800, color: WHITE_FAINT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>Operations</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

            <button onClick={onOpenUpload} style={{ ...navBtn(false), fontWeight: 500 }} title="Upload Statements">
              <UploadCloud size={16} color={WHITE} />
              {!isCollapsed && <span>Upload Statements</span>}
            </button>

            <button onClick={onOpenExport} style={{ ...navBtn(false), fontWeight: 500 }} title="Export Close Pack">
              <Download size={16} color={WHITE} />
              {!isCollapsed && <span>Export Close Pack</span>}
            </button>

            <button onClick={onOpenLLMSettings} style={{ ...navBtn(false), fontWeight: 500 }} title={`AI Engine Config (${llmProviderLabel})`}>
              <Settings2 size={16} color={WHITE} />
              {!isCollapsed && (
                <div style={{ lineHeight: 1.1 }}>
                  <span style={{ display: 'block' }}>AI Engine Config</span>
                  <span style={{ fontSize: '0.66rem', color: WHITE_DIM }}>{llmProviderLabel}</span>
                </div>
              )}
            </button>

          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid ${DIVIDER}`, padding: isCollapsed ? '0.75rem 0.5rem' : '0.7rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', background: 'rgba(0,0,0,0.18)' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: WHITE_DIM }}>
            <ShieldCheck size={14} color="#6ee7b7" />
            <span style={{ fontWeight: 600 }}>Zero-Hallucination CPA</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          style={{ background: 'rgba(255,255,255,0.15)', border: `1px solid ${DIVIDER}`, borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WHITE }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
};
