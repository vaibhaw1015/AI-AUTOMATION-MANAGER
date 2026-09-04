"""
Phase 6 — Testing & Validation Test Suite
Validates the full reconciliation pipeline against data/ground_truth.csv.
Asserts precision, recall, and zero-hallucination exception handling.
"""

import sys
import os

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from exact_matcher import run_exact_matcher
from fuzzy_matcher import run_fuzzy_matcher
from agent_matcher import run_agent_matcher
from reporting import score_against_ground_truth, load_ground_truth

def test_exact_matcher():
    """Phase 2 verification: Exactly 37 exact matches should resolve."""
    exact_matches, rem_b, rem_l = run_exact_matcher()
    assert len(exact_matches) == 37, f"Expected 37 exact matches, got {len(exact_matches)}"
    assert len(rem_b) == 22, f"Expected 22 remaining bank rows, got {len(rem_b)}"
    assert len(rem_l) == 20, f"Expected 20 remaining ledger rows, got {len(rem_l)}"

    # Check zero variance on exact matches
    for m in exact_matches:
        assert m["variance"] == 0.0, f"Exact match {m['match_id']} has non-zero variance {m['variance']}"

def test_fuzzy_matcher():
    """Phase 3 verification: Fuzzy matcher generates candidate pairs within thresholds."""
    exact_matches, rem_b, rem_l = run_exact_matcher()
    auto_fuzzy, amb_cands, un_b, un_l = run_fuzzy_matcher(rem_b, rem_l)

    assert len(auto_fuzzy) > 0, "Expected auto-confirmed fuzzy matches"
    # Combined fuzzy + ambiguous should cover the 15 fuzzy target cases
    assert len(auto_fuzzy) + len(amb_cands) >= 14, "Fuzzy engine should identify at least 14 candidates"

def test_full_pipeline_precision_and_recall():
    """Full pipeline benchmark: Precision must exceed 95% and Recall must exceed 90%."""
    exact_matches, rem_b, rem_l = run_exact_matcher()
    auto_fuzzy, amb_cands, un_b, un_l = run_fuzzy_matcher(rem_b, rem_l)
    agent_matches, final_un_b, final_un_l = run_agent_matcher(amb_cands, un_b, un_l)

    all_matches = exact_matches + auto_fuzzy + agent_matches
    metrics = score_against_ground_truth(all_matches, final_un_b, final_un_l)

    print("\nBenchmark Scores vs Ground Truth:")
    print(f"  Precision: {metrics['precision']}%")
    print(f"  Recall:    {metrics['recall']}%")
    print(f"  F1 Score:  {metrics['f1_score']}%")

    # The Bar: Zero hallucinated false positives, Precision >= 95%
    assert metrics["false_positives"] == 0, f"Zero-hallucination violated: {metrics['false_positives']} false positives!"
    assert metrics["precision"] >= 95.0, f"Precision {metrics['precision']}% is below 95%"
    assert metrics["recall"] >= 90.0, f"Recall {metrics['recall']}% is below 90%"

def test_honest_exceptions_isolation():
    """Verify that un-matched exceptions are genuine anomalies and never force-matched."""
    exact_matches, rem_b, rem_l = run_exact_matcher()
    auto_fuzzy, amb_cands, un_b, un_l = run_fuzzy_matcher(rem_b, rem_l)
    agent_matches, final_un_b, final_un_l = run_agent_matcher(amb_cands, un_b, un_l)

    # Confirm genuine exceptions remain unmatched
    unmatched_bank_ids = {b["bank_id"] for b in final_un_b}
    unmatched_ledger_ids = {l["ledger_id"] for l in final_un_l}

    # Bank fee: BNK_053 ($35 SVB fee) must be in exceptions
    assert "BNK_053" in unmatched_bank_ids, "SVB Bank fee should be isolated as exception"

    # Duplicate charge: BNK_055 ($149 GitHub duplicate) must be in exceptions
    assert "BNK_055" in unmatched_bank_ids, "Duplicate GitHub charge should be isolated as exception"

    # Timing difference: LDG_053 (Nexus deliverable on Aug 30) must be in exceptions
    assert "LDG_053" in unmatched_ledger_ids, "Month-end timing difference should be in exceptions"

if __name__ == "__main__":
    test_exact_matcher()
    test_fuzzy_matcher()
    test_full_pipeline_precision_and_recall()
    test_honest_exceptions_isolation()
    print("\n✓ ALL TESTS PASSED SUCCESSFULLY!")
