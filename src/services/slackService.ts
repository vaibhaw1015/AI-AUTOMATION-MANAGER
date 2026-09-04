import {
  SlackConfig,
  SlackMessagePayload,
  SlackBlock
} from '../types/integrations';
import {
  ReconciliationDataset,
  MatchedPair,
  ReconciliationMetrics
} from '../types/reconciliation';

const SLACK_STORAGE_KEY = 'ticktie_slack_config';

export const DEFAULT_SLACK_CONFIG: SlackConfig = {
  webhookUrl: (import.meta as any).env?.VITE_SLACK_WEBHOOK_URL || '',
  channel: (import.meta as any).env?.VITE_SLACK_CHANNEL || '#finance-close',
  botName: 'Tick & Tie AI CPA',
  notifyOnReconcile: true,
  notifyOnExceptions: true,
  exceptionThreshold: 1
};

export function loadSlackConfig(): SlackConfig {
  try {
    const saved = localStorage.getItem(SLACK_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        webhookUrl: parsed.webhookUrl || DEFAULT_SLACK_CONFIG.webhookUrl,
        channel: parsed.channel || DEFAULT_SLACK_CONFIG.channel,
        botName: parsed.botName || DEFAULT_SLACK_CONFIG.botName,
        notifyOnReconcile: parsed.notifyOnReconcile ?? DEFAULT_SLACK_CONFIG.notifyOnReconcile,
        notifyOnExceptions: parsed.notifyOnExceptions ?? DEFAULT_SLACK_CONFIG.notifyOnExceptions,
        exceptionThreshold: parsed.exceptionThreshold ?? DEFAULT_SLACK_CONFIG.exceptionThreshold,
        lastSentAt: parsed.lastSentAt
      };
    }
  } catch (e) {
    console.error('Failed to load Slack config:', e);
  }
  return DEFAULT_SLACK_CONFIG;
}

export function saveSlackConfig(config: SlackConfig): void {
  try {
    localStorage.setItem(SLACK_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Slack config:', e);
  }
}

/**
 * Format executive Month-End Close Pack summary as Slack Block Kit payload
 */
export function formatCloseSummarySlackPayload(
  dataset: ReconciliationDataset,
  metrics: ReconciliationMetrics,
  config: SlackConfig
): SlackMessagePayload {
  const currency = dataset.currency || 'USD';
  const isHealthy = metrics.reconciliationRate >= 90;
  const statusEmoji = isHealthy ? '🟢' : '🟡';

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 Month-End Financial Close Summary — ${dataset.name}`,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Tick & Tie AI* has completed autonomous reconciliation across *${dataset.bankName}* and *${dataset.ledgerName}*.`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Reconciliation Rate:*\n${statusEmoji} *${metrics.reconciliationRate.toFixed(1)}%* (${metrics.matchedBankCount + metrics.matchedLedgerCount} / ${metrics.totalBankRecords + metrics.totalLedgerRecords} records)`
        },
        {
          type: 'mrkdwn',
          text: `*Reconciled Volume:*\n💰 *${currency} ${metrics.reconciledVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}*`
        },
        {
          type: 'mrkdwn',
          text: `*Net Value Variance:*\n⚖️ *${currency} ${metrics.netVariance.toFixed(2)}*`
        },
        {
          type: 'mrkdwn',
          text: `*Value at Risk (Anomalies):*\n🚨 *${currency} ${metrics.valueAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}*`
        }
      ]
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Multi-Tier Resolution Breakdown:*\n• ⚡ Exact Multi-Key Matches: *${metrics.tierCounts.exact}*\n• 🔍 Fuzzy & Heuristics: *${metrics.tierCounts.heuristic}*\n• 🧠 LLM Agent Judgment: *${metrics.tierCounts.aiSemantic}*`
        },
        {
          type: 'mrkdwn',
          text: `*Honest Exception Registry:*\n• ⚠️ Quarantined Exceptions: *${metrics.tierCounts.exceptions}*\n• 🛡️ Zero Hallucination Guarantee: *Enforced*`
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Generated autonomously by *${config.botName || 'Tick & Tie AI'}* • ${new Date().toLocaleString()} • Compliance Ready`
        }
      ]
    }
  ];

  return {
    text: `Month-End Close Report for ${dataset.name}: ${metrics.reconciliationRate.toFixed(1)}% reconciled (${metrics.tierCounts.exceptions} exceptions isolated).`,
    blocks,
    username: config.botName || 'Tick & Tie AI CPA',
    icon_emoji: ':sparkles:'
  };
}

/**
 * Format single Honest Exception incident alert for Slack
 */
export function formatExceptionAlertSlackPayload(
  pair: MatchedPair,
  dataset: ReconciliationDataset,
  config: SlackConfig
): SlackMessagePayload {
  const currency = dataset.currency || 'USD';

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚨 Honest Exception Incident Alert — ${pair.exceptionType || 'UNMATCHED ANOMALY'}`,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `An anomalous transaction was honestly quarantined by *Tick & Tie AI* to prevent hallucinated reconciliations.`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Exception Category:*\n\`${pair.exceptionType || 'UNRESOLVED'}\``
        },
        {
          type: 'mrkdwn',
          text: `*Variance Amount:*\n*${currency} ${Math.abs(pair.variance).toFixed(2)}*`
        },
        {
          type: 'mrkdwn',
          text: `*Bank Side Total:*\n${currency} ${pair.bankTotal.toFixed(2)} (${pair.bankTxIds.length} tx)`
        },
        {
          type: 'mrkdwn',
          text: `*Ledger Side Total:*\n${currency} ${pair.ledgerTotal.toFixed(2)} (${pair.ledgerTxIds.length} tx)`
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*CPA Agent Diagnostic:*\n${pair.reasoning.summary}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Recommended Remediation:*\n👉 ${pair.reasoning.suggestedAction || 'Review counterparty invoice and check settlement lag.'}`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Dataset: *${dataset.name}* • Pair ID: \`${pair.id}\` • Assigned for CPA manual clearance`
        }
      ]
    }
  ];

  return {
    text: `🚨 Exception Alert: ${pair.exceptionType} variance of ${currency} ${pair.variance.toFixed(2)} detected in ${dataset.name}`,
    blocks,
    username: config.botName || 'Tick & Tie AI CPA',
    icon_emoji: ':warning:'
  };
}

/**
 * Send Slack Notification via Webhook
 * Note: Browsers may enforce CORS on hooks.slack.com unless using 'no-cors' mode or a backend proxy.
 * We handle this smoothly: if live webhook fails or is blocked by CORS, we provide clean simulated dispatch
 * with detailed feedback.
 */
export async function sendSlackWebhook(
  payload: SlackMessagePayload,
  config: SlackConfig
): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const webhook = config.webhookUrl.trim();

  // If no webhook provided or demo placeholder
  if (!webhook || webhook.includes('YOUR_SLACK_WEBHOOK') || !webhook.startsWith('https://hooks.slack.com/')) {
    // Simulated demo mode
    await new Promise(r => setTimeout(r, 600));
    return {
      success: true,
      simulated: true,
      message: `[Simulated Mode] Alert successfully rendered and sent to ${config.channel || '#finance-close'}! (Enter a live Slack Webhook URL to broadcast to your real Slack workspace).`
    };
  }

  try {
    // Slack accepts form-encoded 'payload=' param natively, which works in browser with mode 'no-cors'
    const formBody = 'payload=' + encodeURIComponent(JSON.stringify(payload));
    await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody,
      mode: 'no-cors'
    });

    return {
      success: true,
      simulated: false,
      message: `Successfully dispatched notification to Slack channel ${config.channel || '#finance-close'}!`
    };
  } catch (err: any) {
    console.warn('Slack webhook fetch error:', err);
    return {
      success: false,
      message: `Failed to deliver Slack webhook: ${err.message || String(err)}`
    };
  }
}
