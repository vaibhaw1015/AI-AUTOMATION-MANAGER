# Tick & Tie AI — Autonomous Financial Reconciliation Agent

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--automation--manager.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-automation-manager.vercel.app/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-automation-manager.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://ai-automation-manager.vercel.app/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://ai-automation-manager.vercel.app/)
[![Python 3.12](https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://ai-automation-manager.vercel.app/)

> 🌐 **Live Web Application**: **[https://ai-automation-manager.vercel.app/](https://ai-automation-manager.vercel.app/)**

An autonomous AI agent that takes two messy financial record-sets (e.g. bank transaction feed and internal company ledger) and automatically figures out which entries match — the way an accountant manually "ticks and ties" transactions during month-end close — while **honestly isolating what it cannot resolve** instead of guessing.

---

## The Problem It Solves

Reconciliation is one of the most repetitive, error-prone bottlenecks in finance operations. Today, finance teams rely on:
1. **Manual Spreadsheet Eyeballing**: Scrolling through hundreds of rows cross-checking amounts, dates, and references by eye.
2. **Rigid Legacy Rule Software**: Catches only exact 1:1 matches (same amount, same date, same ID) and dumps everything else into a massive pile a human still has to sort by hand.

Real-world financial records almost never match cleanly:
- Payment gateways settle 1–3 days later than the invoice date.
- Amounts undergo micro-penny rounding or foreign exchange translation drift.
- Payment platforms (Stripe, Razorpay) deduct merchant fees at source ($9,710 net vs. $10,000 gross).
- Intermediary banks deduct wire transfer dispatch surcharges ($1 to $35).
- Descriptions are abbreviated differently across systems (`"AMZN WEB SERV"` vs `"Amazon Web Services Inc"`).

This AI agent handles the entire spectrum: deterministic exact matches, heuristic fuzzy matches, and **LLM contextual judgment** on the ambiguous cases, with a **zero-hallucination guarantee** that routes genuine anomalies to an **Honest Exception Registry**.

---

## 7-Phase Architecture & Roadmap

```
├── data/
│   ├── bank_transactions.csv      # 59 realistic bank records
│   ├── ledger_entries.csv         # 57 ERP ledger entries
│   └── ground_truth.csv           # 64 labeled benchmarks (37 exact, 15 fuzzy, 12 exceptions)
├── src/
│   ├── exact_matcher.py           # Phase 2: Exact matching engine
│   ├── fuzzy_matcher.py           # Phase 3: Fuzzy matching with rapidfuzz
│   ├── agent_matcher.py           # Phase 4: Groq Llama 3.3 70B agent reasoner
│   └── reporting.py               # Phase 5: Metrics, HTML report, exceptions CSV
├── tests/
│   └── test_matcher.py            # Phase 6: Automated verification test suite
├── output/
│   ├── agent_decisions.jsonl      # Complete LLM audit decision log
│   ├── exceptions.csv             # Categorized honest exceptions list
│   └── reconciliation_report.html # Standalone executive HTML close report
├── main.py                        # Phase 7: One-command CLI pipeline
└── README.md
```

### Phase 1 — Synthetic Data Generation
Generates realistic, messy benchmark data:
- `data/bank_transactions.csv` (59 rows)
- `data/ledger_entries.csv` (57 rows)
- `data/ground_truth.csv` (64 relationships: 37 exact, 15 fuzzy, 12 exceptions)

### Phase 2 — Exact Match Engine
- Normalizes fields (ISO dates, 2-decimal rounded amounts, sanitized reference tokens).
- Joins on `(amount, date, reference_id)`.
- Auto-confirms exact matches and subtracts them from the pool (~37 matches resolved).

### Phase 3 — Fuzzy Match Engine
- Builds candidate pairs within date window (±3 days) and amount tolerance (±2% or fee deductions).
- Scores description similarity using `rapidfuzz` token-sort algorithms.
- High-confidence candidates (score ≥ 78) are auto-confirmed.
- Ambiguous candidates (score 55–77) are pushed to Phase 4.

### Phase 4 — Agent Judgment Layer (Groq Llama 3.3 70B)
- Ambiguous pairs are sent to **Meta Llama 3.3 70B** via the Groq API.
- Prompt enforces a CPA forensic auditor persona.
- Returns structured JSON: `{"match": bool, "confidence": float, "rationale": string}`.
- Every decision is logged line-by-line into `output/agent_decisions.jsonl` as an auditable compliance trail.

### Phase 5 — Reporting & Scoring
- Computes Precision, Recall, and F1 score against `data/ground_truth.csv`.
- Generates `output/exceptions.csv` with categorized root causes:
  - Timing differences (deposits in transit / checks outstanding)
  - Unrecorded bank fees & surcharges
  - Duplicate charges (double-billing risk)
  - Unidentified remittances
- Generates a standalone, dark-themed `output/reconciliation_report.html` for executive review.

### Phase 6 — Testing & Validation
- Comprehensive `pytest` test suite in `tests/test_matcher.py`.
- Enforces:
  - Exactly 37 exact matches in Phase 2
  - Zero false positives (zero hallucinations)
  - Precision ≥ 95%
  - Recall ≥ 90%
  - Proper isolation of genuine anomalies in the exception list.

### Phase 7 — Polish for Demo
- `main.py`: One-command CLI that executes all phases and renders an ASCII reconciliation distribution chart.

---

## Sample Performance Numbers

| Metric | Result | Benchmark Target |
| :--- | :--- | :--- |
| **Precision** | **100.0%** | ≥ 95.0% |
| **Recall** | **96.2%** | ≥ 90.0% |
| **F1 Score** | **98.0%** | ≥ 92.0% |
| **False Positives (Hallucinations)** | **0** | 0 |
| **Exact Matches (Tier 1)** | 37 | 37 |
| **Fuzzy Matches (Tier 2)** | 13 | 12–14 |
| **Agent Matches (Tier 3)** | 2 | 1–3 |
| **Honest Exceptions Isolated (Tier 4)** | 12 | 12 |

---

## How to Run

### 1. Run the Full Reconciliation Pipeline
```powershell
python main.py
```

### 2. Run the Test Suite
```powershell
python -m pytest tests/test_matcher.py -v
```

### 3. Inspect Generated Reports
- **Executive HTML Close Report**: Open `output/reconciliation_report.html` in any browser.
- **Exceptions List**: Open `output/exceptions.csv` in Excel or pandas.
- **LLM Audit Trail**: Inspect `output/agent_decisions.jsonl` to see every reasoning step.

---

## Optional: Interactive Web UI Studio
The project also includes an interactive Vite + React dual-pane Tick & Tie Studio with drag-and-drop CSV upload, live connector lines, and side-by-side audit drawers:
```powershell
npm run dev
```
Navigate to: `http://localhost:5173/`

---

## Cloud Integrations

### 1. Supabase Cloud Vault (PostgreSQL Persistence)
- **Persistent Close Sessions**: Vault month-end close records (`reconciliation_runs`) with reconciliation rates, volume, and tier breakdowns.
- **Exception Quarantine DB**: Sync honest exceptions (`reconciliation_exceptions`) to cloud PostgreSQL for team review and clearance tracking.
- **SQL Schema DDL Included**: Instant copy-paste DDL for Supabase SQL Editor with full RLS policies.
- **Demo & Offline Fallback**: Instant test credentials with local browser cache fallback.

### 2. Slack Incident & Close Reporting
- **Block Kit Executive Close Packs**: Dispatches rich Slack messages with reconciliation rate, volume, multi-tier breakdown, and status badges.
- **Honest Exception Escalation**: One-click alerting directly from the Exception Registry to `#finance-close` or `#cpa-exceptions`.
- **Live Block Kit Preview**: Real-time Slack chat bubble preview in UI before dispatching.

