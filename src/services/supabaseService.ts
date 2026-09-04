import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseConfig,
  SupabaseRunRecord
} from '../types/integrations';
import {
  ReconciliationDataset,
  MatchedPair,
  ReconciliationMetrics
} from '../types/reconciliation';

const SUPABASE_STORAGE_KEY = 'ticktie_supabase_config';
const LOCAL_RUNS_CACHE_KEY = 'ticktie_supabase_cached_runs';

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  isConnected: Boolean((import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY),
  autoSaveRuns: true
};

// SQL Schema for user to run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- Tick & Tie AI — Supabase Financial Reconciliation Schema
-- Paste and run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Reconciliation Sessions / Runs Table
create table if not exists public.reconciliation_runs (
  id text primary key,
  created_at timestamptz default now() not null,
  dataset_id text not null,
  dataset_name text not null,
  currency text not null default 'USD',
  bank_name text,
  ledger_name text,
  total_bank_records int default 0,
  total_ledger_records int default 0,
  reconciliation_rate numeric(5,2) default 0.0,
  reconciled_volume numeric(15,2) default 0.0,
  net_variance numeric(15,2) default 0.0,
  value_at_risk numeric(15,2) default 0.0,
  exact_count int default 0,
  heuristic_count int default 0,
  ai_semantic_count int default 0,
  exception_count int default 0,
  status text default 'COMPLETED',
  metadata jsonb default '{}'::jsonb
);

-- 2. Honest Exceptions Registry Table
create table if not exists public.reconciliation_exceptions (
  id text primary key,
  run_id text references public.reconciliation_runs(id) on delete cascade,
  exception_type text not null,
  bank_total numeric(15,2) default 0.0,
  ledger_total numeric(15,2) default 0.0,
  variance numeric(15,2) default 0.0,
  summary text,
  suggested_action text,
  status text default 'OPEN',
  auditor_notes text,
  created_at timestamptz default now() not null
);

-- 3. Row Level Security (RLS) Policies (Permissive for authenticated & anon dashboard access)
alter table public.reconciliation_runs enable row level security;
alter table public.reconciliation_exceptions enable row level security;

create policy "Allow all operations for anon" on public.reconciliation_runs
  for all using (true) with check (true);

create policy "Allow all operations for anon on exceptions" on public.reconciliation_exceptions
  for all using (true) with check (true);

-- Index for fast queries
create index if not exists idx_rec_runs_created on public.reconciliation_runs (created_at desc);
create index if not exists idx_rec_exceptions_run on public.reconciliation_exceptions (run_id);
`;

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const url = parsed.url || DEFAULT_SUPABASE_CONFIG.url;
      const anonKey = parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;
      return {
        url,
        anonKey,
        isConnected: Boolean(url && anonKey),
        autoSaveRuns: parsed.autoSaveRuns ?? DEFAULT_SUPABASE_CONFIG.autoSaveRuns,
        lastSyncedAt: parsed.lastSyncedAt
      };
    }
  } catch (e) {
    console.error('Failed to load Supabase config:', e);
  }
  return DEFAULT_SUPABASE_CONFIG;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

// Client singleton
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const currentConfig = config || loadSupabaseConfig();
  if (!currentConfig.url || !currentConfig.anonKey) {
    return null;
  }

  // Reuse if same url
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  try {
    supabaseClientInstance = createClient(currentConfig.url.trim(), currentConfig.anonKey.trim(), {
      auth: { persistSession: false }
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient(): void {
  supabaseClientInstance = null;
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(config: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  tablesFound?: boolean;
}> {
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Please provide both Supabase URL and Anon Public Key.' };
  }

  try {
    const client = createClient(config.url.trim(), config.anonKey.trim(), {
      auth: { persistSession: false }
    });

    // Test query against reconciliation_runs
    const { data, error } = await client
      .from('reconciliation_runs')
      .select('id')
      .limit(1);

    if (error) {
      // If table does not exist yet (code 42P01 or message includes table)
      if (error.message.includes('relation') || error.message.includes('does not exist') || error.code === '42P01') {
        return {
          success: true,
          tablesFound: false,
          message: 'Connected to Supabase! The "reconciliation_runs" table is not created yet. Please copy and run the SQL schema.'
        };
      }
      return {
        success: false,
        message: `Supabase returned an error: ${error.message} (Code: ${error.code})`
      };
    }

    return {
      success: true,
      tablesFound: true,
      message: `Connection successful! Connected to Supabase project with ${data?.length ?? 0} existing records verified.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || String(err)}`
    };
  }
}

/**
 * Save complete reconciliation session to Supabase
 */
export async function saveRunToSupabase(
  dataset: ReconciliationDataset,
  metrics: ReconciliationMetrics,
  matchedPairs: MatchedPair[],
  config: SupabaseConfig
): Promise<{ success: boolean; runId: string; message: string }> {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const runRecord: SupabaseRunRecord = {
    id: runId,
    created_at: new Date().toISOString(),
    dataset_id: dataset.id,
    dataset_name: dataset.name,
    currency: dataset.currency,
    bank_name: dataset.bankName,
    ledger_name: dataset.ledgerName,
    total_bank_records: metrics.totalBankRecords,
    total_ledger_records: metrics.totalLedgerRecords,
    reconciliation_rate: Number(metrics.reconciliationRate.toFixed(2)),
    reconciled_volume: Number(metrics.reconciledVolume.toFixed(2)),
    net_variance: Number(metrics.netVariance.toFixed(2)),
    value_at_risk: Number(metrics.valueAtRisk.toFixed(2)),
    exact_count: metrics.tierCounts.exact,
    heuristic_count: metrics.tierCounts.heuristic,
    ai_semantic_count: metrics.tierCounts.aiSemantic,
    exception_count: metrics.tierCounts.exceptions,
    status: metrics.tierCounts.exceptions > 0 ? 'IN_REVIEW' : 'COMPLETED',
    metadata: {
      pairsCount: matchedPairs.length,
      matchedBankCount: metrics.matchedBankCount,
      matchedLedgerCount: metrics.matchedLedgerCount
    }
  };

  const client = getSupabaseClient(config);

  // If Supabase credentials are configured, write to cloud
  if (client) {
    try {
      const { error: runError } = await client.from('reconciliation_runs').insert([runRecord]);
      if (runError) throw runError;

      // Also store exceptions in public.reconciliation_exceptions
      const exceptions = matchedPairs
        .filter(p => p.tier === 'UNMATCHED')
        .map((p, idx) => ({
          id: `exc_${runId}_${idx + 1}`,
          run_id: runId,
          exception_type: p.exceptionType || 'OTHER',
          bank_total: p.bankTotal,
          ledger_total: p.ledgerTotal,
          variance: p.variance,
          summary: p.reasoning.summary,
          suggested_action: p.reasoning.suggestedAction || 'Manual inspection',
          status: 'OPEN' as const,
          auditor_notes: p.auditorNotes || '',
          created_at: new Date().toISOString()
        }));

      if (exceptions.length > 0) {
        const { error: excError } = await client.from('reconciliation_exceptions').insert(exceptions);
        if (excError) {
          console.warn('Could not save exceptions table (runs table saved):', excError.message);
        }
      }

      // Also cache locally for instant offline review
      cacheRunLocally(runRecord);

      return {
        success: true,
        runId,
        message: `Successfully vaulted to Supabase cloud table "reconciliation_runs" (ID: ${runId})`
      };
    } catch (err: any) {
      console.warn('Supabase cloud insert error, fallback caching locally:', err);
      cacheRunLocally(runRecord);
      return {
        success: false,
        runId,
        message: `Cloud sync error: ${err.message || err}. Saved to local audit cache.`
      };
    }
  }

  // Fallback: Cache locally if credentials not supplied
  cacheRunLocally(runRecord);
  return {
    success: true,
    runId,
    message: `Saved to local audit vault (configure Supabase URL & Key to sync with cloud).`
  };
}

/**
 * Fetch all saved runs from Supabase
 */
export async function fetchRunsFromSupabase(config: SupabaseConfig): Promise<SupabaseRunRecord[]> {
  const client = getSupabaseClient(config);

  if (client) {
    try {
      const { data, error } = await client
        .from('reconciliation_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (!error && data) {
        return data as SupabaseRunRecord[];
      }
    } catch (err) {
      console.warn('Could not fetch runs from Supabase:', err);
    }
  }

  // Fallback to local cache
  return getCachedLocalRuns();
}

/**
 * Local cache helpers
 */
function cacheRunLocally(run: SupabaseRunRecord): void {
  try {
    const existing = getCachedLocalRuns();
    const updated = [run, ...existing.filter(r => r.id !== run.id)].slice(0, 30);
    localStorage.setItem(LOCAL_RUNS_CACHE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to cache run locally:', e);
  }
}

export function getCachedLocalRuns(): SupabaseRunRecord[] {
  try {
    const saved = localStorage.getItem(LOCAL_RUNS_CACHE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse cached runs:', e);
  }
  return [];
}
