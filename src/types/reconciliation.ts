export type TransactionType = 'credit' | 'debit';
export type RecordSource = 'bank' | 'ledger';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // positive = credit/inflow, negative = debit/outflow
  description: string;
  reference: string;
  type: TransactionType;
  rawSource: RecordSource;
  counterparty?: string;
  category?: string;
  currency?: string;
  metadata?: Record<string, string | number>;
}

export type MatchTier = 'EXACT' | 'HEURISTIC' | 'AI_SEMANTIC' | 'UNMATCHED';

export type MatchStatus = 'auto_matched' | 'confirmed' | 'rejected' | 'under_review' | 'exception';

export type ExceptionCategory =
  | 'TIMING_DIFFERENCE'
  | 'BANK_FEE_DISCREPANCY'
  | 'MISSING_INVOICE'
  | 'DUPLICATE_SUSPICION'
  | 'CURRENCY_DRIFT'
  | 'UNRECORDED_WITHDRAWAL'
  | 'OTHER';

export interface AuditStep {
  rule: string;
  passed: boolean;
  detail: string;
  impactScore: number;
}

export interface MatchReasoning {
  summary: string;
  steps: AuditStep[];
  rulesMatched: string[];
  discrepanciesNoted: string[];
  suggestedAction?: string;
  llmChainOfThought?: string;
}

export interface MatchedPair {
  id: string;
  tier: MatchTier;
  confidence: number; // 0 to 100
  bankTxIds: string[];
  ledgerTxIds: string[];
  bankTotal: number;
  ledgerTotal: number;
  variance: number; // bankTotal - ledgerTotal
  status: MatchStatus;
  reasoning: MatchReasoning;
  exceptionType?: ExceptionCategory;
  auditorNotes?: string;
  timestamp: string;
  isSplit?: boolean;
}

export interface ReconciliationMetrics {
  totalBankRecords: number;
  totalLedgerRecords: number;
  matchedBankCount: number;
  matchedLedgerCount: number;
  unmatchedBankCount: number;
  unmatchedLedgerCount: number;
  reconciliationRate: number; // percentage (0 - 100)
  totalBankAmount: number;
  totalLedgerAmount: number;
  reconciledVolume: number;
  netVariance: number;
  valueAtRisk: number;
  tierCounts: {
    exact: number;
    heuristic: number;
    aiSemantic: number;
    exceptions: number;
  };
  exceptionCounts: Record<ExceptionCategory, number>;
}

export type LLMProvider = 'builtin' | 'gemini' | 'groq' | 'ollama' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  customEndpoint?: string;
  temperature: number;
  systemPromptPreset: string;
}

export interface ReconciliationDataset {
  id: string;
  name: string;
  description: string;
  currency: string;
  bankName: string;
  ledgerName: string;
  bankTransactions: Transaction[];
  ledgerTransactions: Transaction[];
}
