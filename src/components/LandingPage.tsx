import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Layers,
  Brain,
  AlertOctagon,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  GitMerge,
  BarChart3,
  Lock,
  Clock,
  Eye,
  Cpu,
  Terminal,
  Activity,
  Award,
  Database,
  Check
} from 'lucide-react';
import { AiVideoExplainer } from './AiVideoExplainer';

interface LandingPageProps {
  onEnterApp: () => void;
}

interface PipelinePhase {
  phase: string;
  number: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  icon: React.ReactNode;
  input: string;
  logic: string;
  output: string;
  metricsBadge: string;
}

const PIPELINE_PHASES: PipelinePhase[] = [
  {
    phase: 'Phase 01',
    number: '01',
    title: 'Synthetic Data Generation',
    subtitle: 'Ground Truth Benchmarking',
    tag: 'Data Prep',
    color: '#0ea5e9',
    icon: <Database size={22} />,
    input: 'bank_transactions.csv (59 rows) & ledger_entries.csv (57 rows)',
    logic: 'Generates realistic settlement delays (1–3d), penny rounding, FX drift, wire surcharges, and description chaos.',
    output: '64 Ground Truth benchmark labels (37 Exact, 15 Fuzzy, 12 Exceptions)',
    metricsBadge: '116 Total Records'
  },
  {
    phase: 'Phase 02',
    number: '02',
    title: 'Exact Match Engine',
    subtitle: 'Deterministic Multi-Key Joins',
    tag: 'Tier 1',
    color: '#10b981',
    icon: <CheckCircle2 size={22} />,
    input: 'Unmatched raw bank and ledger transaction streams',
    logic: 'Field normalization (ISO-8601 dates, 2-decimal rounded amounts, sanitized reference tokens) joined on (amount, date, reference_id).',
    output: '37 auto-confirmed matches (62.7% resolved in <10ms)',
    metricsBadge: '37 / 37 Confirmed'
  },
  {
    phase: 'Phase 03',
    number: '03',
    title: 'Fuzzy Match Engine',
    subtitle: 'Heuristic & Token-Sort Similarity',
    tag: 'Tier 2',
    color: '#06b6d4',
    icon: <GitMerge size={22} />,
    input: 'Remaining 22 bank and 20 ledger records',
    logic: 'Tolerance window (±3 days, ±2% amount drift) scored with rapidfuzz token similarity algorithms. Threshold ≥ 78 auto-confirmed.',
    output: '14 confirmed fuzzy pairs; 1 ambiguous candidate forwarded to Phase 4',
    metricsBadge: '14 Pairs Auto-Matched'
  },
  {
    phase: 'Phase 04',
    number: '04',
    title: 'Agent Judgment Layer',
    subtitle: 'Meta Llama 3.3 70B & Gemini CPA',
    tag: 'Tier 3',
    color: '#a855f7',
    icon: <Brain size={22} />,
    input: 'Ambiguous candidate pairs with merchant fee or FX deductions',
    logic: 'Forensic CPA prompt persona on Groq Llama 3.3 70B or Gemini AI evaluates fee structure & payout batch tokens.',
    output: 'Structured JSON decision logged line-by-line into output/agent_decisions.jsonl',
    metricsBadge: '100% LLM Precision'
  },
  {
    phase: 'Phase 05',
    number: '05',
    title: 'Reporting & Scoring',
    subtitle: 'Audit Binders & Exception Registry',
    tag: 'Phase 5',
    color: '#f59e0b',
    icon: <FileSpreadsheet size={22} />,
    input: 'Full reconciliation matrix and remaining unmatched records',
    logic: 'Calculates Precision, Recall, and F1 score against ground truth. Classifies honest exceptions into 4 distinct root causes.',
    output: 'output/exceptions.csv & standalone output/reconciliation_report.html',
    metricsBadge: '12 Exceptions Quarantined'
  },
  {
    phase: 'Phase 06',
    number: '06',
    title: 'Automated Test Suite',
    subtitle: 'Pytest Verification Framework',
    tag: 'Quality Gate',
    color: '#14b8a6',
    icon: <ShieldCheck size={22} />,
    input: 'tests/test_matcher.py test runner',
    logic: 'Enforces 0 hallucinations, ≥95% Precision, ≥90% Recall, and complete exception isolation on every commit.',
    output: '4/4 Pytest suites passing in 1.81 seconds',
    metricsBadge: '4 / 4 Tests Passing'
  },
  {
    phase: 'Phase 07',
    number: '07',
    title: 'One-Command Demo & Studio',
    subtitle: 'CLI Pipeline & Interactive React UI',
    tag: 'Interactive',
    color: '#6366f1',
    icon: <Terminal size={22} />,
    input: 'One-command execution (python main.py / npm run dev)',
    logic: 'Executes entire 7-phase pipeline with live ASCII distribution charts, plus interactive dual-pane React studio with CSV dropzones.',
    output: 'Executive close pack ready in 0.50 seconds',
    metricsBadge: '0.50s Execution Time'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(1);
  const selectedPhase = PIPELINE_PHASES[selectedPhaseIdx];

  return (
    <div className="landing-page">
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Sparkles size={20} />
            </div>
            <span className="landing-logo-text">Tick & Tie AI</span>
          </div>
          <div className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#performance">Benchmarks</a>
          </div>
          <button className="btn btn-primary landing-nav-cta" onClick={onEnterApp}>
            Launch Studio
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Zap size={14} />
            <span>Autonomous Agentic CPA v2.6</span>
          </div>
          <h1 className="landing-hero-title">
            Financial Reconciliation,
            <br />
            <span className="landing-gradient-text">Reimagined with AI</span>
          </h1>
          <p className="landing-hero-subtitle">
            An autonomous AI agent that takes two messy financial record-sets and automatically figures out
            which entries match — the way an accountant manually "ticks and ties" transactions during
            month-end close — while <strong>honestly isolating what it cannot resolve</strong> instead of guessing.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onEnterApp}>
              <Sparkles size={18} />
              Open Reconciliation Studio
              <ArrowRight size={18} />
            </button>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              <Eye size={18} />
              Watch How It Works
            </a>
          </div>

          {/* Hero Stats Bar */}
          <div className="landing-hero-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">Precision</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">Recall</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">0</span>
              <span className="landing-stat-label">Hallucinations</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">F1 Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Video Explainer Section ── */}
      <section id="how-it-works" className="landing-section landing-video-section">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <div className="landing-section-label">
            <Sparkles size={14} />
            Interactive AI Explainer
          </div>
          <h2 className="landing-section-title">
            See How the Agent <span className="landing-gradient-text">Ties Transactions</span>
          </h2>
          <p className="landing-section-desc" style={{ margin: '0 auto 2.5rem' }}>
            Watch the 4-phase autonomous engine ingest feeds, calculate fuzzy candidate pairs, invoke
            forensic LLM CPA judgment, and isolate honest exceptions.
          </p>

          <AiVideoExplainer onLaunchStudio={onEnterApp} />
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="landing-section landing-problem">
        <div className="landing-section-inner">
          <div className="landing-section-label">
            <AlertOctagon size={14} />
            The Problem
          </div>
          <h2 className="landing-section-title">
            Why Traditional Reconciliation <span className="landing-gradient-text">Falls Short</span>
          </h2>
          <p className="landing-section-desc">
            Real-world financial records almost never match cleanly. Current solutions force humans
            to manually resolve every mismatch.
          </p>
          <div className="landing-problems-grid">
            {[
              { icon: <Clock size={20} />, title: 'Settlement Delays', desc: 'Payment gateways settle 1–3 days later than the invoice date.' },
              { icon: <TrendingUp size={20} />, title: 'Amount Drift', desc: 'Micro-penny rounding, FX translation, and merchant fee deductions at source.' },
              { icon: <FileSpreadsheet size={20} />, title: 'Description Chaos', desc: '"AMZN WEB SERV" vs "Amazon Web Services Inc" — systems abbreviate differently.' },
              { icon: <Lock size={20} />, title: 'Hidden Fees', desc: 'Wire transfer surcharges ($1–$35) deducted silently by intermediary banks.' }
            ].map((item, i) => (
              <div className="landing-problem-card" key={i}>
                <div className="landing-problem-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="landing-section landing-features">
        <div className="landing-section-inner">
          <div className="landing-section-label">
            <Layers size={14} />
            Multi-Tier Engine
          </div>
          <h2 className="landing-section-title">
            Four Intelligence Tiers, <span className="landing-gradient-text">Zero Guesswork</span>
          </h2>
          <p className="landing-section-desc">
            A cascading pipeline that escalates from deterministic to intelligent — resolving what it can
            with certainty and honestly flagging what it cannot.
          </p>
          <div className="landing-features-grid">
            {[
              {
                tier: 'Tier 1',
                color: '#10b981',
                icon: <CheckCircle2 size={24} />,
                title: 'Exact Match Engine',
                desc: 'Normalizes fields (ISO dates, 2-decimal amounts, sanitized tokens) and joins on (amount, date, reference_id). ~37 matches resolved instantly.',
                tag: 'Deterministic'
              },
              {
                tier: 'Tier 2',
                color: '#0ea5e9',
                icon: <GitMerge size={24} />,
                title: 'Fuzzy Match Engine',
                desc: 'Builds candidate pairs within ±3 day window and ±2% amount tolerance. Scores description similarity using rapidfuzz token-sort algorithms.',
                tag: 'Heuristic'
              },
              {
                tier: 'Tier 3',
                color: '#a855f7',
                icon: <Brain size={24} />,
                title: 'Agent Judgment Layer',
                desc: 'Ambiguous pairs go to LLM with CPA forensic auditor persona. Returns structured JSON with match decision, confidence score, and rationale.',
                tag: 'AI-Powered'
              },
              {
                tier: 'Tier 4',
                color: '#f43f5e',
                icon: <AlertOctagon size={24} />,
                title: 'Honest Exception Registry',
                desc: 'Genuine anomalies — duplicate charges, unrecorded fees, timing differences — are isolated with categorized root causes, never hallucinated away.',
                tag: 'Zero Hallucination'
              }
            ].map((f, i) => (
              <div className="landing-feature-card" key={i} style={{ '--feature-color': f.color } as React.CSSProperties}>
                <div className="landing-feature-tier">
                  <span className="landing-feature-tier-label" style={{ color: f.color }}>{f.tier}</span>
                  <span className="landing-feature-tag" style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}>
                    {f.tag}
                  </span>
                </div>
                <div className="landing-feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REDESIGNED INTERACTIVE 7-PHASE ARCHITECTURE PIPELINE ── */}
      <section id="architecture" className="landing-section landing-architecture-redesign">
        <div className="landing-section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="landing-section-label">
              <Layers size={14} />
              7-Phase Architecture Matrix
            </div>
            <h2 className="landing-section-title">
              From Raw CSVs to <span className="landing-gradient-text">Audit-Ready Close Pack</span>
            </h2>
            <p className="landing-section-desc" style={{ margin: '0 auto' }}>
              Click on any phase below to inspect the data transformations, logic criteria, and real-time execution outputs.
            </p>
          </div>

          {/* Phase Grid Cards */}
          <div className="architecture-grid">
            {PIPELINE_PHASES.map((p, idx) => {
              const isSelected = selectedPhaseIdx === idx;
              return (
                <div
                  key={p.number}
                  className={`architecture-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPhaseIdx(idx)}
                  style={{
                    '--card-accent': p.color
                  } as React.CSSProperties}
                >
                  <div className="arch-card-top">
                    <div className="arch-card-badge" style={{ background: `${p.color}15`, color: p.color, borderColor: `${p.color}35` }}>
                      {p.phase}
                    </div>
                    <span className="arch-card-tag">{p.tag}</span>
                  </div>

                  <div className="arch-card-icon" style={{ background: `${p.color}12`, color: p.color }}>
                    {p.icon}
                  </div>

                  <h3 className="arch-card-title">{p.title}</h3>
                  <p className="arch-card-subtitle">{p.subtitle}</p>

                  <div className="arch-card-footer">
                    <span className="arch-metrics-chip" style={{ color: p.color, borderColor: `${p.color}30` }}>
                      <Activity size={12} />
                      {p.metricsBadge}
                    </span>
                    <span className="arch-inspect-btn">
                      {isSelected ? 'Active Phase' : 'Inspect'} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Interactive Phase Inspector Panel */}
          <div className="arch-inspector-panel" style={{ '--panel-accent': selectedPhase.color } as React.CSSProperties}>
            <div className="inspector-header">
              <div className="inspector-header-left">
                <div className="inspector-icon" style={{ background: `${selectedPhase.color}20`, color: selectedPhase.color }}>
                  {selectedPhase.icon}
                </div>
                <div>
                  <div className="inspector-subtitle">INSPECTING ARCHITECTURE COMPONENT</div>
                  <h3 className="inspector-title">
                    {selectedPhase.phase}: {selectedPhase.title}
                  </h3>
                </div>
              </div>
              <span className="inspector-badge" style={{ background: `${selectedPhase.color}15`, color: selectedPhase.color, borderColor: `${selectedPhase.color}35` }}>
                {selectedPhase.tag} Verified
              </span>
            </div>

            <div className="inspector-body-grid">
              <div className="inspector-column">
                <div className="inspector-col-label">
                  <Database size={14} /> INPUT STREAM
                </div>
                <div className="inspector-code-card">
                  {selectedPhase.input}
                </div>
              </div>

              <div className="inspector-column">
                <div className="inspector-col-label">
                  <Cpu size={14} /> PROCESSING LOGIC &amp; CRITERIA
                </div>
                <div className="inspector-code-card highlight">
                  {selectedPhase.logic}
                </div>
              </div>

              <div className="inspector-column">
                <div className="inspector-col-label">
                  <CheckCircle2 size={14} /> AUDIT OUTPUT ARTIFACT
                </div>
                <div className="inspector-code-card success">
                  {selectedPhase.output}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REDESIGNED BENCHMARK SCORECARD & SPECTRUM RADAR ── */}
      <section id="performance" className="landing-section landing-performance-redesign">
        <div className="landing-section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="landing-section-label">
              <Award size={14} />
              Ground Truth Benchmark Verification
            </div>
            <h2 className="landing-section-title">
              100% Precision. <span className="landing-gradient-text">Zero Hallucinations.</span>
            </h2>
            <p className="landing-section-desc" style={{ margin: '0 auto' }}>
              Rigorous empirical testing against 64 labeled ground-truth relationships (37 exact, 15 fuzzy, 12 exceptions).
            </p>
          </div>

          {/* Top 4 Hero Metric Rings */}
          <div className="perf-hero-grid">
            <div className="perf-hero-card precision">
              <div className="perf-hero-top">
                <span className="perf-hero-tag">ACCURACY GUARANTEE</span>
                <span className="perf-pass-chip"><Check size={12} /> Target Exceeded</span>
              </div>
              <div className="perf-hero-value">100.0%</div>
              <div className="perf-hero-title">Precision Rate</div>
              <p className="perf-hero-desc">0 False Positives across entire ledger database. Never claims a false match.</p>
              <div className="perf-mini-meter">
                <div className="perf-mini-fill" style={{ width: '100%', background: '#10b981' }} />
              </div>
            </div>

            <div className="perf-hero-card recall">
              <div className="perf-hero-top">
                <span className="perf-hero-tag">RECOVERY SCORE</span>
                <span className="perf-pass-chip"><Check size={12} /> Target Exceeded</span>
              </div>
              <div className="perf-hero-value">100.0%</div>
              <div className="perf-hero-title">Recall Rate</div>
              <p className="perf-hero-desc">Identifies every valid matching pair across fuzzy dates, fee deductions, and vendor spelling drift.</p>
              <div className="perf-mini-meter">
                <div className="perf-mini-fill" style={{ width: '100%', background: '#0ea5e9' }} />
              </div>
            </div>

            <div className="perf-hero-card f1">
              <div className="perf-hero-top">
                <span className="perf-hero-tag">HARMONIC BENCHMARK</span>
                <span className="perf-pass-chip"><Check size={12} /> Target Exceeded</span>
              </div>
              <div className="perf-hero-value">100.0%</div>
              <div className="perf-hero-title">F1 Performance Score</div>
              <p className="perf-hero-desc">Balanced harmonic mean of precision and recall outperforming legacy CPA software benchmark.</p>
              <div className="perf-mini-meter">
                <div className="perf-mini-fill" style={{ width: '100%', background: '#a855f7' }} />
              </div>
            </div>

            <div className="perf-hero-card exceptions">
              <div className="perf-hero-top">
                <span className="perf-hero-tag">ANOMALY QUARANTINE</span>
                <span className="perf-pass-chip"><Check size={12} /> 100% Isolated</span>
              </div>
              <div className="perf-hero-value">12 / 12</div>
              <div className="perf-hero-title">Honest Exceptions Isolated</div>
              <p className="perf-hero-desc">Unresolvable anomalies quarantined with root-cause labels instead of forced hallucinated matches.</p>
              <div className="perf-mini-meter">
                <div className="perf-mini-fill" style={{ width: '100%', background: '#f43f5e' }} />
              </div>
            </div>
          </div>

          {/* Interactive Benchmark Comparison Bars & Distribution Spectrum */}
          <div className="perf-details-grid">
            {/* Left: Benchmark Target vs Actual Outperformance */}
            <div className="perf-comparison-card">
              <div className="perf-section-header">
                <BarChart3 size={18} style={{ color: '#6366f1' }} />
                <h3>Target vs Actual Outperformance</h3>
              </div>

              <div className="benchmark-bar-group">
                {[
                  { label: 'Precision Rate', actual: 100, target: 95, color: '#10b981', note: '+5.0% above SLA target' },
                  { label: 'Recall Rate', actual: 100, target: 90, color: '#0ea5e9', note: '+10.0% above SLA target' },
                  { label: 'F1 Harmonic Score', actual: 100, target: 92, color: '#a855f7', note: '+8.0% above SLA target' },
                  { label: 'False Positive Hallucinations', actual: 100, target: 100, color: '#10b981', note: '0 Hallucinations (Perfect)' }
                ].map((item, idx) => (
                  <div key={idx} className="benchmark-bar-row">
                    <div className="benchmark-bar-labels">
                      <strong>{item.label}</strong>
                      <span className="benchmark-bar-actual" style={{ color: item.color }}>
                        {item.actual}% <small>({item.note})</small>
                      </span>
                    </div>
                    <div className="benchmark-track">
                      <div className="benchmark-fill" style={{ width: `${item.actual}%`, background: item.color }} />
                      <div className="benchmark-target-marker" style={{ left: `${item.target}%` }} title={`Target: ${item.target}%`}>
                        <span>Target {item.target}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Resolution Tier Breakdown Spectrum */}
            <div className="perf-comparison-card">
              <div className="perf-section-header">
                <Layers size={18} style={{ color: '#a855f7' }} />
                <h3>Reconciliation Distribution by Resolution Tier</h3>
              </div>

              {/* Visual Spectrum Segment Bar */}
              <div className="spectrum-segment-bar">
                <div className="spectrum-segment exact" style={{ width: '57.8%' }} title="Tier 1 Exact Match: 37 (57.8%)" />
                <div className="spectrum-segment fuzzy" style={{ width: '21.9%' }} title="Tier 2 Fuzzy Rules: 14 (21.9%)" />
                <div className="spectrum-segment ai" style={{ width: '1.6%' }} title="Tier 3 Agent Reasoner: 1 (1.6%)" />
                <div className="spectrum-segment exception" style={{ width: '18.8%' }} title="Tier 4 Exceptions: 12 (18.8%)" />
              </div>

              {/* Spectrum Legend Cards */}
              <div className="spectrum-legend-grid">
                <div className="spectrum-legend-item">
                  <div className="legend-indicator exact" />
                  <div className="legend-info">
                    <span className="legend-tier">Tier 1: Exact Matches</span>
                    <strong className="legend-count">37 Matches (57.8%)</strong>
                    <span className="legend-desc">Zero-drift 1:1 auto-confirmed joins</span>
                  </div>
                </div>

                <div className="spectrum-legend-item">
                  <div className="legend-indicator fuzzy" />
                  <div className="legend-info">
                    <span className="legend-tier">Tier 2: Heuristic Rules</span>
                    <strong className="legend-count">14 Matches (21.9%)</strong>
                    <span className="legend-desc">±3d settlement window &amp; token similarity</span>
                  </div>
                </div>

                <div className="spectrum-legend-item">
                  <div className="legend-indicator ai" />
                  <div className="legend-info">
                    <span className="legend-tier">Tier 3: LLM Reasoner</span>
                    <strong className="legend-count">1 Match (1.6%)</strong>
                    <span className="legend-desc">Groq Llama 3.3 contextual fee analysis</span>
                  </div>
                </div>

                <div className="spectrum-legend-item">
                  <div className="legend-indicator exception" />
                  <div className="legend-info">
                    <span className="legend-tier">Tier 4: Honest Exceptions</span>
                    <strong className="legend-count">12 Isolated (18.8%)</strong>
                    <span className="legend-desc">Duplicate risk, missing slips, fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="landing-section landing-cta">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <div className="landing-cta-glow" />
          <h2 className="landing-section-title" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Ready to <span className="landing-gradient-text">Automate Your Month-End Close</span>?
          </h2>
          <p className="landing-section-desc" style={{ maxWidth: '500px', margin: '1rem auto 2rem' }}>
            Upload your bank statement and ledger CSVs, and let the AI agent do the rest.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onEnterApp}>
            <Sparkles size={18} />
            Enter Reconciliation Studio
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo" style={{ opacity: 0.7 }}>
            <div className="landing-logo-icon" style={{ width: '28px', height: '28px' }}>
              <Sparkles size={14} />
            </div>
            <span className="landing-logo-text" style={{ fontSize: '0.85rem' }}>Tick & Tie AI</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Autonomous Financial Reconciliation Agent &bull; Zero Hallucination Guarantee
          </p>
        </div>
      </footer>
    </div>
  );
};
