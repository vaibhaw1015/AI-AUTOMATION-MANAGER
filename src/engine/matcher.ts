import {
  Transaction,
  MatchedPair,
  ReconciliationMetrics,
  ReconciliationDataset,
  LLMConfig,
  ExceptionCategory
} from '../types/reconciliation';
import { generateLLMReasoning } from './llmService';

export async function runReconciliationPipeline(
  dataset: ReconciliationDataset,
  llmConfig: LLMConfig
): Promise<{ matchedPairs: MatchedPair[]; metrics: ReconciliationMetrics }> {
  const bankTxs = [...dataset.bankTransactions];
  const ledgerTxs = [...dataset.ledgerTransactions];

  const matchedPairs: MatchedPair[] = [];
  const matchedBankIds = new Set<string>();
  const matchedLedgerIds = new Set<string>();

  // ==========================================
  // TIER 1: Deterministic Exact Matching (100% confidence)
  // ==========================================
  for (const bTx of bankTxs) {
    if (matchedBankIds.has(bTx.id)) continue;

    // Find candidate with identical amount
    const candidate = ledgerTxs.find(
      lTx =>
        !matchedLedgerIds.has(lTx.id) &&
        Math.abs(bTx.amount - lTx.amount) < 0.001 &&
        bTx.type === lTx.type &&
        Math.abs(getDaysDifference(bTx.date, lTx.date)) <= 1
    );

    if (candidate) {
      matchedBankIds.add(bTx.id);
      matchedLedgerIds.add(candidate.id);

      const reasoning = await generateLLMReasoning(
        {
          bankTx: [bTx],
          ledgerTx: [candidate],
          candidateType: 'exact',
          currency: dataset.currency
        },
        llmConfig
      );

      matchedPairs.push({
        id: `match-${bTx.id}-${candidate.id}`,
        tier: 'EXACT',
        confidence: 100,
        bankTxIds: [bTx.id],
        ledgerTxIds: [candidate.id],
        bankTotal: bTx.amount,
        ledgerTotal: candidate.amount,
        variance: 0,
        status: 'auto_matched',
        reasoning,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ==========================================
  // TIER 2: Heuristic & Fuzzy Rules Matching (85-95% confidence)
  // Date drift ±4 days, penny drift, standard fee deductions, normalized vendor names
  // ==========================================
  for (const bTx of bankTxs) {
    if (matchedBankIds.has(bTx.id)) continue;

    let bestCandidate: Transaction | null = null;
    let bestScore = 0;

    for (const lTx of ledgerTxs) {
      if (matchedLedgerIds.has(lTx.id)) continue;
      if (bTx.type !== lTx.type) continue;

      const daysDiff = Math.abs(getDaysDifference(bTx.date, lTx.date));
      if (daysDiff > 5) continue;

      const variance = Math.abs(Math.abs(bTx.amount) - Math.abs(lTx.amount));
      const amountRatio = Math.min(Math.abs(bTx.amount), Math.abs(lTx.amount)) /
        Math.max(Math.abs(bTx.amount), Math.abs(lTx.amount));

      const nameSim = computeEntitySimilarity(bTx.description, lTx.description);

      // Scoring criteria
      let score = 0;
      // Exact amount with slight date drift
      if (variance < 0.001) {
        score = 80 + (5 - daysDiff) * 3 + nameSim * 15;
      }
      // Penny rounding / FX drift (<= $0.10)
      else if (variance <= 0.10) {
        score = 75 + (5 - daysDiff) * 2 + nameSim * 20;
      }
      // Bank wire fee deduction ($1 to $50 standard fee)
      else if (variance >= 0.5 && variance <= 50.0 && amountRatio > 0.95) {
        score = 72 + nameSim * 25;
      }

      if (score > 65 && score > bestScore) {
        bestScore = score;
        bestCandidate = lTx;
      }
    }

    if (bestCandidate) {
      matchedBankIds.add(bTx.id);
      matchedLedgerIds.add(bestCandidate.id);

      const reasoning = await generateLLMReasoning(
        {
          bankTx: [bTx],
          ledgerTx: [bestCandidate],
          candidateType: 'fuzzy',
          currency: dataset.currency
        },
        llmConfig
      );

      const variance = bTx.amount - bestCandidate.amount;

      matchedPairs.push({
        id: `match-heur-${bTx.id}-${bestCandidate.id}`,
        tier: 'HEURISTIC',
        confidence: Math.min(96, Math.round(bestScore)),
        bankTxIds: [bTx.id],
        ledgerTxIds: [bestCandidate.id],
        bankTotal: bTx.amount,
        ledgerTotal: bestCandidate.amount,
        variance,
        status: 'auto_matched',
        reasoning,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ==========================================
  // TIER 3: AI Semantic Judgment & Split Matching (1-to-many payout batching)
  // ==========================================
  for (const bTx of bankTxs) {
    if (matchedBankIds.has(bTx.id)) continue;

    // Check if one bank payout corresponds to multiple ledger invoices (e.g. Stripe batch)
    const availableLedger = ledgerTxs.filter(
      l => !matchedLedgerIds.has(l.id) && l.type === bTx.type
    );

    if (availableLedger.length >= 2) {
      // Test pairs of 2 ledger transactions
      for (let i = 0; i < availableLedger.length; i++) {
        for (let j = i + 1; j < availableLedger.length; j++) {
          const l1 = availableLedger[i];
          const l2 = availableLedger[j];
          const combinedLedger = l1.amount + l2.amount;
          const fee = combinedLedger - bTx.amount;
          const feePercent = (fee / combinedLedger) * 100;

          // Typical merchant processor fee is 2.5% to 3.5%
          if (fee > 0 && feePercent >= 2.0 && feePercent <= 4.0) {
            matchedBankIds.add(bTx.id);
            matchedLedgerIds.add(l1.id);
            matchedLedgerIds.add(l2.id);

            const reasoning = await generateLLMReasoning(
              {
                bankTx: [bTx],
                ledgerTx: [l1, l2],
                candidateType: 'split',
                currency: dataset.currency
              },
              llmConfig
            );

            matchedPairs.push({
              id: `match-split-${bTx.id}`,
              tier: 'AI_SEMANTIC',
              confidence: 93,
              bankTxIds: [bTx.id],
              ledgerTxIds: [l1.id, l2.id],
              bankTotal: bTx.amount,
              ledgerTotal: combinedLedger,
              variance: fee,
              status: 'auto_matched',
              reasoning,
              isSplit: true,
              timestamp: new Date().toISOString()
            });
            break;
          }
        }
        if (matchedBankIds.has(bTx.id)) break;
      }
    }
  }

  // ==========================================
  // TIER 4: Honest Exception Registry (Zero Hallucination)
  // Transparently identifies un-matched entries and categorizes discrepancies
  // ==========================================

  // Check for duplicate bank charges
  const duplicateBankGroups = detectDuplicates(bankTxs.filter(b => !matchedBankIds.has(b.id)));
  const duplicateHandledIds = new Set<string>();

  for (const group of duplicateBankGroups) {
    if (group.length > 1) {
      group.forEach(tx => duplicateHandledIds.add(tx.id));
      matchedPairs.push({
        id: `exc-dup-${group[0].id}`,
        tier: 'UNMATCHED',
        confidence: 0,
        bankTxIds: group.map(t => t.id),
        ledgerTxIds: [],
        bankTotal: group.reduce((s, t) => s + t.amount, 0),
        ledgerTotal: 0,
        variance: group.reduce((s, t) => s + t.amount, 0),
        status: 'exception',
        exceptionType: 'DUPLICATE_SUSPICION',
        reasoning: {
          summary: `Suspected Duplicate Bank Charges: Found ${group.length} identical debits of ${dataset.currency} ${Math.abs(group[0].amount).toFixed(2)} for ${group[0].description}.`,
          steps: [
            {
              rule: 'Duplicate Frequency Check',
              passed: false,
              detail: `${group.length} charges recorded on ${group[0].date} with identical reference prefix.`,
              impactScore: -40
            }
          ],
          rulesMatched: [],
          discrepanciesNoted: ['Potential merchant double-billing or terminal re-try error.'],
          suggestedAction: 'Auditor should contact merchant/bank to reverse duplicate charge.'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Remaining unmatched bank records
  for (const bTx of bankTxs) {
    if (matchedBankIds.has(bTx.id) || duplicateHandledIds.has(bTx.id)) continue;

    const isBankFee = /FEE|CHARGE|SURCHARGE|SERVICE/i.test(bTx.description);
    const exceptionType: ExceptionCategory = isBankFee
      ? 'BANK_FEE_DISCREPANCY'
      : bTx.amount > 0
      ? 'MISSING_INVOICE'
      : 'UNRECORDED_WITHDRAWAL';

    matchedPairs.push({
      id: `exc-bank-${bTx.id}`,
      tier: 'UNMATCHED',
      confidence: 0,
      bankTxIds: [bTx.id],
      ledgerTxIds: [],
      bankTotal: bTx.amount,
      ledgerTotal: 0,
      variance: bTx.amount,
      status: 'exception',
      exceptionType,
      reasoning: {
        summary: isBankFee
          ? `Unrecorded Bank Fee: Bank debited ${dataset.currency} ${Math.abs(bTx.amount).toFixed(2)} for service fee without a corresponding ledger expense entry.`
          : `Unmatched Bank ${bTx.amount > 0 ? 'Credit' : 'Debit'}: Inbound transaction of ${dataset.currency} ${Math.abs(bTx.amount).toFixed(2)} with no corresponding general ledger entry.`,
        steps: [
          {
            rule: 'General Ledger Existence Check',
            passed: false,
            detail: 'Zero candidate matches found in accounting records within tolerance window.',
            impactScore: -50
          }
        ],
        rulesMatched: [],
        discrepanciesNoted: [
          isBankFee
            ? 'SVB/Bank fee not booked in ERP/QuickBooks.'
            : 'Remittance without sales invoice or credit note.'
        ],
        suggestedAction: isBankFee
          ? 'Post adjusting Journal Entry (Dr: Bank Fee Expense, Cr: Cash).'
          : 'Request remittance advice from counterparty to create invoice.'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Remaining unmatched ledger records
  for (const lTx of ledgerTxs) {
    if (matchedLedgerIds.has(lTx.id)) continue;

    // Check if it's a timing difference (e.g. invoice on the last days of month)
    const isEndOfMonth = parseInt(lTx.date.split('-')[2], 10) >= 28;
    const exceptionType: ExceptionCategory = isEndOfMonth ? 'TIMING_DIFFERENCE' : 'OTHER';

    matchedPairs.push({
      id: `exc-ledger-${lTx.id}`,
      tier: 'UNMATCHED',
      confidence: 0,
      bankTxIds: [],
      ledgerTxIds: [lTx.id],
      bankTotal: 0,
      ledgerTotal: lTx.amount,
      variance: -lTx.amount,
      status: 'exception',
      exceptionType,
      reasoning: {
        summary: isEndOfMonth
          ? `Timing Settlement Lag (Deposit in Transit): Ledger entry on ${lTx.date} (${dataset.currency} ${Math.abs(lTx.amount).toFixed(2)}) has not yet cleared the bank statement.`
          : `Unmatched Ledger Record: Booked entry of ${dataset.currency} ${Math.abs(lTx.amount).toFixed(2)} without bank settlement.`,
        steps: [
          {
            rule: 'Bank Clearing Verification',
            passed: false,
            detail: isEndOfMonth
              ? 'Transaction booked late in billing cycle. Expected to clear in subsequent period statement.'
              : 'No corresponding bank clearance detected.',
            impactScore: isEndOfMonth ? 0 : -30
          }
        ],
        rulesMatched: isEndOfMonth ? ['Month-End Timing Anomaly'] : [],
        discrepanciesNoted: [
          isEndOfMonth
            ? 'Deposit in Transit / Outstanding Check timing drift.'
            : 'Invoice uncollected or cancelled.'
        ],
        suggestedAction: isEndOfMonth
          ? 'Carry forward as Reconciling Item to next month closing binder.'
          : 'Verify with Accounts Receivable team.'
      },
      timestamp: new Date().toISOString()
    });
  }

  // ==========================================
  // METRICS & RECONCILIATION HEALTH SCORE
  // ==========================================
  const metrics = calculateMetrics(dataset, matchedPairs, matchedBankIds, matchedLedgerIds);

  return { matchedPairs, metrics };
}

function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

function computeEntitySimilarity(desc1: string, desc2: string): number {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['inc', 'corp', 'llc', 'ltd', 'wire', 'ach', 'the', 'services'].includes(w));

  const words1 = clean(desc1);
  const words2 = clean(desc2);

  if (words1.length === 0 || words2.length === 0) return 0.2;

  let common = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      common++;
    }
  }

  return (2 * common) / (words1.length + words2.length);
}

function detectDuplicates(txs: Transaction[]): Transaction[][] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = `${tx.amount}_${tx.date}_${tx.description.slice(0, 10)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.values()).filter(g => g.length > 1);
}

function calculateMetrics(
  dataset: ReconciliationDataset,
  matchedPairs: MatchedPair[],
  matchedBankIds: Set<string>,
  matchedLedgerIds: Set<string>
): ReconciliationMetrics {
  const totalBankRecords = dataset.bankTransactions.length;
  const totalLedgerRecords = dataset.ledgerTransactions.length;
  const totalRecords = totalBankRecords + totalLedgerRecords;

  const matchedBankCount = matchedBankIds.size;
  const matchedLedgerCount = matchedLedgerIds.size;
  const matchedCount = matchedBankCount + matchedLedgerCount;

  const unmatchedBankCount = totalBankRecords - matchedBankCount;
  const unmatchedLedgerCount = totalLedgerRecords - matchedLedgerCount;

  const reconciliationRate = totalRecords > 0 ? (matchedCount / totalRecords) * 100 : 0;

  const totalBankAmount = dataset.bankTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalLedgerAmount = dataset.ledgerTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);

  const reconciledPairs = matchedPairs.filter(p => p.status !== 'exception' && p.status !== 'rejected');
  const reconciledVolume = reconciledPairs.reduce((s, p) => s + Math.abs(p.bankTotal), 0);

  const netVariance = totalBankAmount - totalLedgerAmount;

  const exceptionPairs = matchedPairs.filter(p => p.status === 'exception');
  const valueAtRisk = exceptionPairs.reduce(
    (s, p) => s + Math.abs(p.bankTotal || p.ledgerTotal),
    0
  );

  const tierCounts = {
    exact: matchedPairs.filter(p => p.tier === 'EXACT').length,
    heuristic: matchedPairs.filter(p => p.tier === 'HEURISTIC').length,
    aiSemantic: matchedPairs.filter(p => p.tier === 'AI_SEMANTIC').length,
    exceptions: exceptionPairs.length
  };

  const exceptionCounts: Record<ExceptionCategory, number> = {
    TIMING_DIFFERENCE: 0,
    BANK_FEE_DISCREPANCY: 0,
    MISSING_INVOICE: 0,
    DUPLICATE_SUSPICION: 0,
    CURRENCY_DRIFT: 0,
    UNRECORDED_WITHDRAWAL: 0,
    OTHER: 0
  };

  for (const pair of exceptionPairs) {
    if (pair.exceptionType && exceptionCounts[pair.exceptionType] !== undefined) {
      exceptionCounts[pair.exceptionType]++;
    } else {
      exceptionCounts.OTHER++;
    }
  }

  return {
    totalBankRecords,
    totalLedgerRecords,
    matchedBankCount,
    matchedLedgerCount,
    unmatchedBankCount,
    unmatchedLedgerCount,
    reconciliationRate: Math.round(reconciliationRate * 10) / 10,
    totalBankAmount,
    totalLedgerAmount,
    reconciledVolume,
    netVariance,
    valueAtRisk,
    tierCounts,
    exceptionCounts
  };
}
