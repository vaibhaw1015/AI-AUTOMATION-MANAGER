import { Transaction, RecordSource } from '../types/reconciliation';

export interface CSVParseResult {
  transactions: Transaction[];
  headers: string[];
  detectedMapping: {
    dateCol: string;
    amountCol: string;
    descriptionCol: string;
    referenceCol?: string;
  };
  errors: string[];
}

export function parseFinancialCSV(
  csvText: string,
  source: RecordSource,
  columnMappingOverride?: {
    dateCol?: string;
    amountCol?: string;
    descriptionCol?: string;
    referenceCol?: string;
  }
): CSVParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    return {
      transactions: [],
      headers: [],
      detectedMapping: { dateCol: '', amountCol: '', descriptionCol: '' },
      errors: ['File is empty or contains only a header row.']
    };
  }

  // Parse header
  const headers = parseCSVRow(lines[0]);

  // Auto-detect columns if not explicitly provided
  const dateCol = columnMappingOverride?.dateCol || findBestColumnMatch(headers, ['date', 'txn_date', 'posted_date', 'timestamp', 'booking_date']);
  const amountCol = columnMappingOverride?.amountCol || findBestColumnMatch(headers, ['amount', 'net', 'gross', 'value', 'total', 'transaction_amount']);
  const descriptionCol = columnMappingOverride?.descriptionCol || findBestColumnMatch(headers, ['description', 'memo', 'narration', 'details', 'name', 'payee', 'vendor', 'counterparty']);
  const referenceCol = columnMappingOverride?.referenceCol || findBestColumnMatch(headers, ['reference', 'ref', 'id', 'txn_id', 'transaction_id', 'invoice', 'check_number']);

  const dateIdx = headers.indexOf(dateCol);
  const amountIdx = headers.indexOf(amountCol);
  const descIdx = headers.indexOf(descriptionCol);
  const refIdx = referenceCol ? headers.indexOf(referenceCol) : -1;

  const errors: string[] = [];
  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rawDate = row[dateIdx] || '';
    const rawAmount = row[amountIdx] || '0';
    const rawDesc = row[descIdx] || `Transaction Row ${i}`;
    const rawRef = refIdx !== -1 && row[refIdx] ? row[refIdx] : `REF-${source.toUpperCase()}-${i.toString().padStart(4, '0')}`;

    const parsedDate = normalizeDate(rawDate);
    const parsedAmount = cleanAmount(rawAmount);

    if (isNaN(parsedAmount)) {
      errors.push(`Row ${i}: Could not parse amount "${rawAmount}"`);
      continue;
    }

    transactions.push({
      id: `${source}-custom-${i}`,
      date: parsedDate,
      amount: parsedAmount,
      description: rawDesc.trim(),
      reference: rawRef.trim(),
      type: parsedAmount >= 0 ? 'credit' : 'debit',
      rawSource: source
    });
  }

  return {
    transactions,
    headers,
    detectedMapping: {
      dateCol,
      amountCol,
      descriptionCol,
      referenceCol: referenceCol || undefined
    },
    errors
  };
}

function parseCSVRow(rowStr: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function findBestColumnMatch(headers: string[], candidates: string[]): string {
  const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const c of candidates) {
    const idx = lowerHeaders.findIndex(h => h.includes(c.replace(/[^a-z0-9]/g, '')));
    if (idx !== -1) return headers[idx];
  }
  return headers[0] || '';
}

function cleanAmount(val: string): number {
  // Handles "$ 1,234.50", "($500.00)", "-€250", etc.
  const isParenthesisNegative = val.includes('(') && val.includes(')');
  const sanitized = val.replace(/[^0-9.-]/g, '');
  let num = parseFloat(sanitized);
  if (isParenthesisNegative && num > 0) {
    num = -num;
  }
  return num;
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  // Check if standard ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Try Date parse
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // MM/DD/YYYY or DD/MM/YYYY
  const parts = raw.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // MM/DD/YYYY
      const m = parts[0].padStart(2, '0');
      const d = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }

  return raw;
}
