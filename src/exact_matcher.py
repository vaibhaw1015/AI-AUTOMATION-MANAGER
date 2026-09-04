"""
Phase 2 — Exact Match Engine
Loads bank_transactions.csv and ledger_entries.csv,
normalizes fields (dates, amount rounding, text case),
joins on exact (amount, date, reference_id) to auto-confirm exact matches,
and removes matched pairs from the active pool.
"""

import os
import csv
from typing import Dict, List, Tuple, Any

def normalize_date(d_str: str) -> str:
    """Normalize date string to YYYY-MM-DD."""
    return d_str.strip()

def normalize_amount(val: Any) -> float:
    """Normalize and round amount to 2 decimal places."""
    return round(float(val), 2)

def normalize_ref(ref_str: str) -> str:
    """Sanitize and uppercase reference ID."""
    return ref_str.strip().upper()

def run_exact_matcher(
    bank_csv_path: str = "data/bank_transactions.csv",
    ledger_csv_path: str = "data/ledger_entries.csv"
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Executes Phase 2 Exact Matching.
    Returns:
      (exact_matches, remaining_bank, remaining_ledger)
    """
    bank_rows: List[Dict[str, Any]] = []
    with open(bank_csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            bank_rows.append({
                "bank_id": row["bank_id"],
                "date": normalize_date(row["date"]),
                "amount": normalize_amount(row["amount"]),
                "description": row["description"].strip(),
                "reference_id": normalize_ref(row["reference_id"]),
                "raw_description": row["description"]
            })

    ledger_rows: List[Dict[str, Any]] = []
    with open(ledger_csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ledger_rows.append({
                "ledger_id": row["ledger_id"],
                "date": normalize_date(row["date"]),
                "amount": normalize_amount(row["amount"]),
                "description": row["description"].strip(),
                "reference_id": normalize_ref(row["reference_id"]),
                "raw_description": row["description"]
            })

    exact_matches: List[Dict[str, Any]] = []
    matched_bank_ids = set()
    matched_ledger_ids = set()

    # Index ledger records by key: (amount, date, reference_id)
    ledger_index: Dict[Tuple[float, str, str], List[Dict[str, Any]]] = {}
    for l_row in ledger_rows:
        key = (l_row["amount"], l_row["date"], l_row["reference_id"])
        ledger_index.setdefault(key, []).append(l_row)

    for b_row in bank_rows:
        key = (b_row["amount"], b_row["date"], b_row["reference_id"])
        candidates = ledger_index.get(key, [])
        for cand in candidates:
            if cand["ledger_id"] not in matched_ledger_ids:
                matched_bank_ids.add(b_row["bank_id"])
                matched_ledger_ids.add(cand["ledger_id"])
                exact_matches.append({
                    "match_id": f"EXACT_{len(exact_matches)+1:03d}",
                    "bank_id": b_row["bank_id"],
                    "ledger_id": cand["ledger_id"],
                    "match_type": "exact",
                    "confidence": 1.0,
                    "bank_amount": b_row["amount"],
                    "ledger_amount": cand["amount"],
                    "variance": 0.0,
                    "bank_date": b_row["date"],
                    "ledger_date": cand["date"],
                    "reference_id": b_row["reference_id"],
                    "rationale": f"Identical amount ({b_row['amount']}), settlement date ({b_row['date']}), and reference ID ({b_row['reference_id']})."
                })
                break

    remaining_bank = [b for b in bank_rows if b["bank_id"] not in matched_bank_ids]
    remaining_ledger = [l for l in ledger_rows if l["ledger_id"] not in matched_ledger_ids]

    total_bank = len(bank_rows)
    match_rate = (len(exact_matches) / total_bank) * 100 if total_bank > 0 else 0

    print("=" * 60)
    print("PHASE 2: EXACT MATCH ENGINE RESULTS")
    print("=" * 60)
    print(f"Total Bank Records:     {total_bank}")
    print(f"Total Ledger Records:   {len(ledger_rows)}")
    print(f"Exact Matches Confirmed: {len(exact_matches)} / {total_bank} ({match_rate:.1f}%)")
    print(f"Unmatched Bank Left:    {len(remaining_bank)}")
    print(f"Unmatched Ledger Left:  {len(remaining_ledger)}")
    print("=" * 60)

    return exact_matches, remaining_bank, remaining_ledger

if __name__ == "__main__":
    run_exact_matcher()
