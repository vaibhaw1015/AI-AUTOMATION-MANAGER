import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Brain,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Cpu,
  ArrowRight,
  FileSpreadsheet,
  Check,
  Zap
} from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  badge: string;
  color: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Dual Record Ingestion',
    subtitle: 'Bank Statements & General Ledger Feeds',
    duration: 8,
    badge: 'Phase 1: Ingestion',
    color: '#0ea5e9'
  },
  {
    id: 2,
    title: 'Multi-Tier Exact & Fuzzy Engine',
    subtitle: 'Deterministic joins & token fuzzy similarity',
    duration: 9,
    badge: 'Phase 2 & 3: Matching',
    color: '#10b981'
  },
  {
    id: 3,
    title: 'LLM Forensic Reasoner',
    subtitle: 'CPA agent reasoning over fees & FX drift',
    duration: 10,
    badge: 'Phase 4: Agent Reasoning',
    color: '#a855f7'
  },
  {
    id: 4,
    title: 'Honest Exception Registry',
    subtitle: 'Zero hallucinations: anomalies quarantined',
    duration: 8,
    badge: 'Phase 5: Close Pack',
    color: '#f43f5e'
  }
];

const TOTAL_DURATION = CHAPTERS.reduce((acc, c) => acc + c.duration, 0);

export const AiVideoExplainer: React.FC<{ onLaunchStudio?: () => void }> = ({ onLaunchStudio }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [overallTime, setOverallTime] = useState<number>(0);

  const currentChapter = CHAPTERS[activeChapterIndex];

  // Playback timer engine
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setOverallTime(prevTime => {
        const nextTime = prevTime + 0.1;

        if (nextTime >= TOTAL_DURATION) {
          // Loop around or pause
          return 0;
        }

        // Calculate active chapter
        let accumulated = 0;
        for (let i = 0; i < CHAPTERS.length; i++) {
          accumulated += CHAPTERS[i].duration;
          if (nextTime < accumulated) {
            setActiveChapterIndex(i);
            break;
          }
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleJumpToChapter = (index: number) => {
    let startSec = 0;
    for (let i = 0; i < index; i++) {
      startSec += CHAPTERS[i].duration;
    }
    setActiveChapterIndex(index);
    setOverallTime(startSec);
  };

  const handleRestart = () => {
    setOverallTime(0);
    setActiveChapterIndex(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ai-video-explainer-card">
      {/* Player Header Bar */}
      <div className="explainer-header">
        <div className="explainer-header-left">
          <div className="live-dot-indicator">
            <span className="live-dot-ping" />
            <span className="live-dot" />
          </div>
          <span className="explainer-tagline">
            <strong>AI Video Simulation</strong> • How Tick &amp; Tie Reconciles Books
          </span>
        </div>
        <div className="explainer-header-right">
          <span className="explainer-badge-chip" style={{ borderColor: currentChapter.color, color: currentChapter.color }}>
            {currentChapter.badge}
          </span>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="explainer-screen">
        {/* Background Ambient Glow */}
        <div
          className="explainer-ambient-glow"
          style={{
            background: `radial-gradient(circle, ${currentChapter.color}25 0%, transparent 70%)`
          }}
        />

        {/* ── SCENE 1: INGESTION ── */}
        {activeChapterIndex === 0 && (
          <div className="scene-container scene-ingestion">
            <div className="scene-overlay-header">
              <FileSpreadsheet size={18} style={{ color: currentChapter.color }} />
              <span>Step 1: Ingesting Raw Financial Records</span>
            </div>

            <div className="scene-ingestion-columns">
              <div className="stream-card bank-stream">
                <div className="stream-card-title">
                  <span className="stream-pill blue">Bank Statement</span>
                  <span>59 Records</span>
                </div>
                <div className="stream-items">
                  <div className="stream-item active-ping">
                    <span>2026-03-01</span>
                    <strong>WIRE-AMZN-991</strong>
                    <span className="stream-amount positive">+$14,500.00</span>
                  </div>
                  <div className="stream-item">
                    <span>2026-03-02</span>
                    <strong>STRIPE-PAYOUT-88</strong>
                    <span className="stream-amount positive">+$9,710.00</span>
                  </div>
                  <div className="stream-item">
                    <span>2026-03-03</span>
                    <strong>CHCK #1042</strong>
                    <span className="stream-amount negative">-$1,250.00</span>
                  </div>
                </div>
              </div>

              <div className="ingestion-center-hub">
                <div className="pulse-core">
                  <Cpu size={32} className="pulse-icon" />
                  <div className="core-waves" />
                </div>
                <span className="hub-text">Sanitizing &amp; Normalizing</span>
                <span className="hub-subtext">ISO-8601 • 2-Decimals • Reference Tokens</span>
              </div>

              <div className="stream-card ledger-stream">
                <div className="stream-card-title">
                  <span className="stream-pill purple">ERP General Ledger</span>
                  <span>57 Records</span>
                </div>
                <div className="stream-items">
                  <div className="stream-item active-ping">
                    <span>2026-03-01</span>
                    <strong>INV-2026-091</strong>
                    <span className="stream-amount positive">+$14,500.00</span>
                  </div>
                  <div className="stream-item">
                    <span>2026-03-01</span>
                    <strong>STRIPE GROSS REV</strong>
                    <span className="stream-amount positive">+$10,000.00</span>
                  </div>
                  <div className="stream-item">
                    <span>2026-03-04</span>
                    <strong>OFFICE RENT ADV</strong>
                    <span className="stream-amount negative">-$1,250.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 2: MULTI-TIER MATCHING ── */}
        {activeChapterIndex === 1 && (
          <div className="scene-container scene-matching">
            <div className="scene-overlay-header">
              <Layers size={18} style={{ color: currentChapter.color }} />
              <span>Step 2: Multi-Tier Matching (Exact &amp; Fuzzy)</span>
            </div>

            <div className="matching-stage">
              {/* Match Pair 1: Exact Match */}
              <div className="animated-pair-row exact-match-row">
                <div className="pair-item bank">
                  <span className="pair-date">2026-03-01</span>
                  <span className="pair-desc">AMAZON AWS CLOUD</span>
                  <strong className="pair-amt">$14,500.00</strong>
                </div>

                <div className="pair-connector">
                  <div className="beam-line exact" />
                  <span className="confidence-pill green">
                    <Check size={12} /> 100% Exact Match
                  </span>
                </div>

                <div className="pair-item ledger">
                  <span className="pair-date">2026-03-01</span>
                  <span className="pair-desc">AWS CLOUD SERVICES</span>
                  <strong className="pair-amt">$14,500.00</strong>
                </div>
              </div>

              {/* Match Pair 2: Fuzzy Match with date drift */}
              <div className="animated-pair-row fuzzy-match-row">
                <div className="pair-item bank">
                  <span className="pair-date">2026-03-05 (+2d)</span>
                  <span className="pair-desc">GOOGLE WORKSPACE INC</span>
                  <strong className="pair-amt">$4,850.20</strong>
                </div>

                <div className="pair-connector">
                  <div className="beam-line fuzzy" />
                  <span className="confidence-pill blue">
                    <Zap size={12} /> 92% Fuzzy Score
                  </span>
                </div>

                <div className="pair-item ledger">
                  <span className="pair-date">2026-03-03</span>
                  <span className="pair-desc">GOOGLE CLOUD G-SUITE</span>
                  <strong className="pair-amt">$4,850.20</strong>
                </div>
              </div>

              <div className="tier-summary-footer">
                <span className="metric-chip">
                  <strong>37 / 37</strong> Exact Matches (Tier 1)
                </span>
                <span className="metric-chip">
                  <strong>14</strong> Fuzzy Matches Resolved (Tier 2)
                </span>
                <span className="metric-chip highlight">
                  <strong>1 Ambiguous</strong> Forwarded to LLM
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 3: LLM FORENSIC AUDITOR ── */}
        {activeChapterIndex === 2 && (
          <div className="scene-container scene-ai-reasoner">
            <div className="scene-overlay-header">
              <Brain size={18} style={{ color: currentChapter.color }} />
              <span>Step 3: Agent Judgment Layer (LLM CPA Forensic Reasoner)</span>
            </div>

            <div className="ai-terminal-wrapper">
              <div className="ai-terminal-header">
                <div className="terminal-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <span className="terminal-title">GROQ LLAMA 3.3 70B • FORENSIC AUDIT REASONER</span>
                <span className="terminal-badge">LIVE INFERENCE</span>
              </div>

              <div className="ai-terminal-body">
                <div className="terminal-line prompt">
                  <span className="t-label">EVALUATING PAIR:</span>
                  <span className="t-val">Bank: BNK_042 ($9,710.00) vs Ledger: LDG_042 ($10,000.00)</span>
                </div>
                <div className="terminal-line">
                  <span className="t-label">DETECTED VARIANCE:</span>
                  <span className="t-var">-$290.00 (2.90% deduction)</span>
                </div>
                <div className="terminal-line reasoning-box">
                  <Sparkles size={16} className="t-icon" />
                  <p>
                    "The shared reference token <strong>STR-PO-991</strong> confirms this is the same Stripe payout. 
                    The <strong>$290.00 difference matches standard 2.9% merchant processing fees</strong> deducted at source 
                    before settlement. <strong>Reconciliation approved.</strong>"
                  </p>
                </div>
                <div className="terminal-decision-row">
                  <span className="decision-pill approved">
                    <CheckCircle2 size={16} /> MATCH CONFIRMED (95% Confidence)
                  </span>
                  <span className="audit-logged-text">Audit Decision Logged to agent_decisions.jsonl</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 4: HONEST EXCEPTION REGISTRY ── */}
        {activeChapterIndex === 3 && (
          <div className="scene-container scene-exceptions">
            <div className="scene-overlay-header">
              <AlertOctagon size={18} style={{ color: currentChapter.color }} />
              <span>Step 4: Honest Exception Registry (Zero-Hallucination Isolation)</span>
            </div>

            <div className="exceptions-showcase">
              <div className="zero-hallucination-banner">
                <ShieldCheck size={24} style={{ color: '#10b981' }} />
                <div>
                  <strong>Zero-Hallucination Guarantee</strong>
                  <p>Real anomalies are never forced or hallucinated — quarantined for human sign-off.</p>
                </div>
                <span className="quarantine-count">12 Anomalies Isolated</span>
              </div>

              <div className="exceptions-cards-row">
                <div className="exception-mini-card">
                  <div className="ex-type">Duplicate Charge Risk</div>
                  <div className="ex-details">
                    <span>BNK_051 • $450.00</span>
                    <strong>Double debited by vendor</strong>
                  </div>
                  <span className="ex-tag danger">High Priority</span>
                </div>

                <div className="exception-mini-card">
                  <div className="ex-type">Timing Difference</div>
                  <div className="ex-details">
                    <span>LDG_054 • $3,200.00</span>
                    <strong>Deposit in transit (checks outstanding)</strong>
                  </div>
                  <span className="ex-tag warning">Deposit in Transit</span>
                </div>

                <div className="exception-mini-card">
                  <div className="ex-type">Unrecorded Bank Fee</div>
                  <div className="ex-details">
                    <span>BNK_058 • $35.00</span>
                    <strong>Intermediary wire surcharge</strong>
                  </div>
                  <span className="ex-tag info">Auto-Journal Ready</span>
                </div>
              </div>

              <div className="close-pack-bar">
                <span>Executive Month-End Close Pack Ready</span>
                {onLaunchStudio && (
                  <button className="btn btn-primary btn-sm" onClick={onLaunchStudio}>
                    Test in Reconciliation Studio
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar inside Screen */}
        <div className="explainer-scrubber-track">
          <div
            className="explainer-scrubber-fill"
            style={{
              width: `${(overallTime / TOTAL_DURATION) * 100}%`,
              background: currentChapter.color
            }}
          />
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="explainer-controls">
        <div className="explainer-controls-left">
          <button
            className="explainer-control-btn play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button
            className="explainer-control-btn"
            onClick={handleRestart}
            title="Restart from beginning"
          >
            <RotateCcw size={16} />
          </button>
          <div className="explainer-timestamp">
            <span>{formatTime(overallTime)}</span>
            <span className="divider">/</span>
            <span>{formatTime(TOTAL_DURATION)}</span>
          </div>
        </div>

        {/* Chapter Selection Pills */}
        <div className="explainer-chapter-pills">
          {CHAPTERS.map((c, idx) => (
            <button
              key={c.id}
              className={`chapter-pill ${idx === activeChapterIndex ? 'active' : ''}`}
              style={{
                '--pill-color': c.color
              } as React.CSSProperties}
              onClick={() => handleJumpToChapter(idx)}
            >
              <span className="chapter-idx">{c.id}</span>
              <span className="chapter-name">{c.title}</span>
            </button>
          ))}
        </div>

        <div className="explainer-controls-right">
          {onLaunchStudio && (
            <button className="btn btn-outline btn-sm launch-from-player" onClick={onLaunchStudio}>
              <span>Launch Studio</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
