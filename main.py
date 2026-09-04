"""
Phase 7 — Polish for Demo: Main Pipeline CLI Entrypoint
Runs the complete 7-Phase AI Financial Reconciliation Pipeline in one command:
1. Exact Match Engine (Tier 1)
2. Fuzzy Match Engine with Rapidfuzz (Tier 2)
3. Agent Judgment Layer with Groq Llama 3.3 (Tier 3)
4. Reporting, Scoring vs Ground Truth, and Exceptions CSV / HTML Report (Tier 4)
"""

import os
import sys
import time

# Ensure src is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from exact_matcher import run_exact_matcher
from fuzzy_matcher import run_fuzzy_matcher
from agent_matcher import run_agent_matcher
from reporting import run_reporting_and_scoring

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def print_banner():
    banner = """
========================================================================
   TICK & TIE AI -- AUTONOMOUS FINANCIAL RECONCILIATION AGENT
   Multi-Tier Matching Engine * Groq LLM Agent * Honest Exceptions
========================================================================
    """
    print(banner)

def render_ascii_chart(exact_count: int, fuzzy_count: int, agent_count: int, exc_count: int):
    total = exact_count + fuzzy_count + agent_count + exc_count
    bar_width = 32

    def make_bar(cnt: int) -> str:
        filled = int((cnt / total) * bar_width) if total > 0 else 0
        return "#" * filled + "-" * (bar_width - filled)

    print("\n" + "-" * 60)
    print("RECONCILIATION DISTRIBUTION BY RESOLUTION TIER")
    print("-" * 60)
    print(f"Tier 1 (Exact Match):  [{make_bar(exact_count)}]  {exact_count:2d}  ({(exact_count/total*100):.1f}%)")
    print(f"Tier 2 (Fuzzy Rules):  [{make_bar(fuzzy_count)}]  {fuzzy_count:2d}  ({(fuzzy_count/total*100):.1f}%)")
    print(f"Tier 3 (Agent Llama):  [{make_bar(agent_count)}]  {agent_count:2d}  ({(agent_count/total*100):.1f}%)")
    print(f"Tier 4 (Exceptions):   [{make_bar(exc_count)}]  {exc_count:2d}  ({(exc_count/total*100):.1f}%)")
    print("-" * 60)

def main():
    start_time = time.time()
    print_banner()

    # Verify synthetic data exists
    if not os.path.exists("data/bank_transactions.csv") or not os.path.exists("data/ground_truth.csv"):
        print("[Notice: Generating synthetic datasets in data/ ...]")
        from scripts.generate_synthetic_data import generate_datasets
        generate_datasets("data")

    # Step 1: Exact Match Engine
    exact_matches, rem_bank, rem_ledger = run_exact_matcher(
        "data/bank_transactions.csv",
        "data/ledger_entries.csv"
    )

    # Step 2: Fuzzy Match Engine
    fuzzy_matches, amb_cands, un_bank, un_ledger = run_fuzzy_matcher(
        rem_bank,
        rem_ledger
    )

    # Step 3: Agent Judgment Layer (Groq Llama 3.3 70B)
    agent_matches, final_bank, final_ledger = run_agent_matcher(
        amb_cands,
        un_bank,
        un_ledger
    )

    # Step 4: Reporting, Scoring vs Ground Truth, and HTML generation
    metrics, exceptions = run_reporting_and_scoring(
        exact_matches,
        fuzzy_matches,
        agent_matches,
        final_bank,
        final_ledger,
        total_bank_count=59,
        total_ledger_count=57
    )

    # Visual Distribution Chart
    render_ascii_chart(
        len(exact_matches),
        len(fuzzy_matches),
        len(agent_matches),
        len(exceptions)
    )

    elapsed = time.time() - start_time
    print(f"\nPipeline completed in {elapsed:.2f} seconds.")
    print("\nArtifacts generated:")
    print("  1. Audit Decisions:     output/agent_decisions.jsonl")
    print("  2. Exception Registry:  output/exceptions.csv")
    print("  3. Executive HTML Close: output/reconciliation_report.html")
    print("=" * 72 + "\n")

if __name__ == "__main__":
    main()
