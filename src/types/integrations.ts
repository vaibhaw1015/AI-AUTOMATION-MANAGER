import { ExceptionCategory } from './reconciliation';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSaveRuns: boolean;
  lastSyncedAt?: string;
}

export interface SupabaseRunRecord {
  id: string;
  created_at: string;
  dataset_id: string;
  dataset_name: string;
  currency: string;
  bank_name: string;
  ledger_name: string;
  total_bank_records: number;
  total_ledger_records: number;
  reconciliation_rate: number;
  reconciled_volume: number;
  net_variance: number;
  value_at_risk: number;
  exact_count: number;
  heuristic_count: number;
  ai_semantic_count: number;
  exception_count: number;
  status: 'COMPLETED' | 'IN_REVIEW' | 'FLAGGED';
  metadata?: Record<string, any>;
}

export interface SupabaseExceptionRecord {
  id: string;
  run_id: string;
  exception_type: ExceptionCategory;
  bank_total: number;
  ledger_total: number;
  variance: number;
  summary: string;
  suggested_action: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ADJUSTED' | 'RESOLVED';
  auditor_notes?: string;
  created_at: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  botName: string;
  notifyOnReconcile: boolean;
  notifyOnExceptions: boolean;
  exceptionThreshold: number; // e.g. notify if > 0 or > 5 exceptions
  lastSentAt?: string;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: any[];
}

export interface SlackMessagePayload {
  text: string;
  blocks?: SlackBlock[];
  username?: string;
  icon_emoji?: string;
}
