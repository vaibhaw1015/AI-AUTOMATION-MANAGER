"""
Phase 3 — Fuzzy Match Engine
For remaining unmatched records from Phase 2:
1. Builds candidate pairs (date window ±3 days, amount tolerance ±2% or fee offset).
2. Scores description similarity using rapidfuzz (with token overlap fallback).
3. Ranks candidates and tags each as high-confidence (auto-confirmed) or ambiguous (pushed to Phase 4).
"""

from datetime import datetime
from typing import Dict, List, Tuple, Any

try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    import difflib
    HAS_RAPIDFUZZ = False

def get_days_diff(d1_str: str, d2_str: str) -> int:
    """Returns absolute difference in calendar days."""
    d1 = datetime.strptime(d1_str, "%Y-%m-%d")
    d2 = datetime.strptime(d2_str, "%Y-%m-%d")
    return abs((d1 - d2).days)

def compute_similarity(s1: str, s2: str) -> float:
    """Computes string similarity score between 0.0 and 100.0."""
    clean1 = s1.lower().replace("_", " ").replace("-", " ")
    clean2 = s2.lower().replace("_", " ").replace("-", " ")

    if HAS_RAPIDFUZZ:
        # Token sort ratio handles rearranged words and abbreviations
        token_score = fuzz.token_sort_ratio(clean1, clean2)
        partial_score = fuzz.partial_ratio(clean1, clean2)
        return max(token_score, partial_score)
    else:
        matcher = difflib.SequenceMatcher(None, clean1, clean2)
        return matcher.ratio() * 100.0

def run_fuzzy_matcher(
    remaining_bank: List[Dict[str, Any]],
    remaining_ledger: List[Dict[str, Any]],
    date_tolerance_days: int = 3,
    amount_tolerance_pct: float = 0.035  # up to ~3% for typical merchant/gateway fee drift
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Executes Phase 3 Fuzzy Matching.
    Returns:
      (auto_fuzzy_matches, ambiguous_candidates, unmatched_bank, unmatched_ledger)
    """
    matched_bank_ids = set()
    matched_ledger_ids = set()

    auto_fuzzy_matches: List[Dict[str, Any]] = []
    ambiguous_candidates: List[Dict[str, Any]] = []

    # All candidate pairs
    scored_candidates: List[Dict[str, Any]] = []

    for b in remaining_bank:
        for l in remaining_ledger:
            days_diff = get_days_diff(b["date"], l["date"])
            if days_diff > date_tolerance_days:
                continue

            b_amt = abs(b["amount"])
            l_amt = abs(l["amount"])
            amt_diff = abs(b_amt - l_amt)
            max_amt = max(b_amt, l_amt)

            pct_diff = amt_diff / max_amt if max_amt > 0 else 0

            # Check if amount tolerance matches (within pct_diff OR small wire fee deduction <= $50)
            is_amt_tolerated = (pct_diff <= amount_tolerance_pct) or (amt_diff <= 50.0 and pct_diff <= 0.05)
            if not is_amt_tolerated:
                continue

            # Compute description similarity
            desc_sim = compute_similarity(b["description"], l["description"])

            # Reference token bonus
            ref_match = (
                b["reference_id"] and
                l["reference_id"] and
                (b["reference_id"] in l["description"] or l["reference_id"] in b["description"] or b["reference_id"] == l["reference_id"])
            )

            # Composite confidence score
            amt_score = max(0, 100 - (pct_diff * 1000))
            date_score = max(0, 100 - (days_diff * 15))
            desc_weight = 0.50
            amt_weight = 0.35
            date_weight = 0.15

            composite_score = (desc_sim * desc_weight) + (amt_score * amt_weight) + (date_score * date_weight)
            if ref_match:
                composite_score = min(98.0, composite_score + 15)

            if composite_score >= 55.0:
                scored_candidates.append({
                    "bank": b,
                    "ledger": l,
                    "score": composite_score,
                    "desc_sim": desc_sim,
                    "days_diff": days_diff,
                    "amt_diff": amt_diff,
                    "variance": round(b["amount"] - l["amount"], 2),
                    "ref_match": ref_match
                })

    # Sort candidates by highest score
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)

    for cand in scored_candidates:
        b_id = cand["bank"]["bank_id"]
        l_id = cand["ledger"]["ledger_id"]

        if b_id in matched_bank_ids or l_id in matched_ledger_ids:
            continue

        score = cand["score"]
        variance = cand["variance"]
        days_diff = cand["days_diff"]

        # High Confidence: auto-confirm
        if score >= 78.0:
            matched_bank_ids.add(b_id)
            matched_ledger_ids.add(l_id)
            auto_fuzzy_matches.append({
                "match_id": f"FUZZY_{len(auto_fuzzy_matches)+1:03d}",
                "bank_id": b_id,
                "ledger_id": l_id,
                "match_type": "fuzzy",
                "confidence": round(score / 100.0, 2),
                "bank_amount": cand["bank"]["amount"],
                "ledger_amount": cand["ledger"]["amount"],
                "variance": variance,
                "bank_date": cand["bank"]["date"],
                "ledger_date": cand["ledger"]["date"],
                "bank_desc": cand["bank"]["description"],
                "ledger_desc": cand["ledger"]["description"],
                "rationale": (
                    f"High-confidence fuzzy match (score {score:.1f}%): "
                    f"Date drift {days_diff}d, variance ${variance:.2f}, "
                    f"description similarity {cand['desc_sim']:.1f}%."
                )
            })
        # Ambiguous: push to Phase 4 Agent Judgment Layer
        elif score >= 55.0:
            ambiguous_candidates.append({
                "bank": cand["bank"],
                "ledger": cand["ledger"],
                "score": round(score / 100.0, 2),
                "desc_sim": cand["desc_sim"],
                "days_diff": days_diff,
                "variance": variance
            })

    unmatched_bank = [b for b in remaining_bank if b["bank_id"] not in matched_bank_ids]
    unmatched_ledger = [l for l in remaining_ledger if l["ledger_id"] not in matched_ledger_ids]

    print("=" * 60)
    print("PHASE 3: FUZZY MATCH ENGINE RESULTS")
    print("=" * 60)
    print(f"Auto-Confirmed Fuzzy Matches: {len(auto_fuzzy_matches)}")
    print(f"Ambiguous Pushed to Phase 4:  {len(ambiguous_candidates)}")
    print(f"Remaining Bank Unmatched:     {len(unmatched_bank)}")
    print(f"Remaining Ledger Unmatched:   {len(unmatched_ledger)}")
    print("=" * 60)

    return auto_fuzzy_matches, ambiguous_candidates, unmatched_bank, unmatched_ledger

if __name__ == "__main__":
    from exact_matcher import run_exact_matcher
    _, rem_b, rem_l = run_exact_matcher()
    run_fuzzy_matcher(rem_b, rem_l)
