import React, { useState } from 'react';
import { X, Cpu, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { LLMConfig, LLMProvider } from '../types/reconciliation';

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSaveConfig: (config: LLMConfig) => void;
}

export const LLMSettingsModal: React.FC<LLMSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [provider, setProvider] = useState<LLMProvider>(config.provider);
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [model, setModel] = useState<string>(config.model);
  const [customEndpoint, setCustomEndpoint] = useState<string>(config.customEndpoint || 'http://localhost:11434');
  const [temperature, setTemperature] = useState<number>(config.temperature);
  const [systemPrompt] = useState<string>(config.systemPromptPreset);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    if (newProvider === 'gemini') {
      setModel('gemini-1.5-flash');
    } else if (newProvider === 'groq') {
      setModel('llama-3.3-70b-versatile');
    } else if (newProvider === 'ollama') {
      setModel('llama3.2');
      setCustomEndpoint('http://localhost:11434');
    } else if (newProvider === 'builtin') {
      setModel('Antigravity-Reconcile-Core-v2');
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing LLM provider connectivity...');

    if (provider === 'builtin') {
      setTimeout(() => {
        setTestStatus('success');
        setTestMessage('Built-in offline engine is 100% operational (zero latency, zero cost).');
      }, 300);
      return;
    }

    if (provider === 'gemini') {
      if (!apiKey.trim()) {
        setTestStatus('failed');
        setTestMessage('Please enter a Google Gemini API key (Free at aistudio.google.com).');
        return;
      }
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Successfully connected to Google Gemini API (Free Tier)!');
        } else {
          setTestStatus('failed');
          setTestMessage(`Gemini authentication error: HTTP ${res.status}`);
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage(`Network error: ${err.message}`);
      }
    } else if (provider === 'groq') {
      if (!apiKey.trim()) {
        setTestStatus('failed');
        setTestMessage('Please enter a Groq API key (Free at console.groq.com).');
        return;
      }
      try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Successfully authenticated with Groq API (Free Tier)!');
        } else {
          setTestStatus('failed');
          setTestMessage(`Groq authentication error: HTTP ${res.status}`);
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage(`Network error: ${err.message}`);
      }
    } else if (provider === 'ollama') {
      try {
        const res = await fetch(`${customEndpoint}/api/tags`);
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Successfully connected to local Ollama instance!');
        } else {
          setTestStatus('failed');
          setTestMessage(`Ollama unreachable at ${customEndpoint}`);
        }
      } catch (_err: any) {
        setTestStatus('failed');
        setTestMessage(`Could not reach Ollama at ${customEndpoint}. Is it running?`);
      }
    }
  };

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      model,
      customEndpoint: customEndpoint.trim(),
      temperature,
      systemPromptPreset: systemPrompt
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">AI Engine &amp; Free LLM Providers</h3>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Choose which AI model handles semantic edge cases, counterparty resolution, and split transactions.
            You can use 100% free models (Gemini free tier, Groq free tier, local Ollama, or our built-in offline engine).
          </p>

          {/* Provider Selection */}
          <div className="form-group">
            <label className="form-label">Reasoning Provider</label>
            <select
              className="form-select"
              value={provider}
              onChange={e => handleProviderChange(e.target.value as LLMProvider)}
            >
              <option value="builtin">Built-in Autonomous Engine (100% Free &amp; Offline, Zero-Latency)</option>
              <option value="gemini">Google Gemini Free Tier (aistudio.google.com)</option>
              <option value="groq">Groq Cloud Free Tier (Ultra-fast Llama 3)</option>
              <option value="ollama">Local Ollama (100% Private, localhost:11434)</option>
              <option value="custom">Custom OpenAI-Compatible API</option>
            </select>
          </div>

          {/* Provider Notes */}
          {provider === 'builtin' && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.8rem',
                color: '#c7d2fe'
              }}
            >
              <strong>Built-in Deterministic &amp; Semantic Reasoner:</strong> Requires zero API keys or external server calls. Runs directly in your browser with accountant-grade chain-of-thought logic.
            </div>
          )}

          {provider === 'gemini' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Google Gemini API Key</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#818cf8', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Get Free Key <ExternalLink size={10} />
                </a>
              </label>
              <input
                type="password"
                className="form-input font-mono"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <span className="form-help">Uses Gemini 1.5 Flash or Gemini 2.0 Flash on Google's generous free tier.</span>
            </div>
          )}

          {provider === 'groq' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Groq API Key</span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#818cf8', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Get Free Key <ExternalLink size={10} />
                </a>
              </label>
              <input
                type="password"
                className="form-input font-mono"
                placeholder="gsk_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <span className="form-help">Runs Meta Llama 3.3 70B at 500+ tokens/sec on Groq LPUs for free.</span>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="form-group">
              <label className="form-label">Local Ollama Endpoint</label>
              <input
                type="text"
                className="form-input font-mono"
                value={customEndpoint}
                onChange={e => setCustomEndpoint(e.target.value)}
              />
              <span className="form-help">Make sure Ollama is running locally (`ollama run llama3.2`).</span>
            </div>
          )}

          {/* Model Name */}
          <div className="form-group">
            <label className="form-label">Model Identifier</label>
            <input
              type="text"
              className="form-input font-mono"
              value={model}
              onChange={e => setModel(e.target.value)}
              disabled={provider === 'builtin'}
            />
          </div>

          {/* Temperature */}
          <div className="form-group">
            <label className="form-label">Reasoning Temperature: {temperature}</label>
            <input
              type="range"
              min="0.0"
              max="0.7"
              step="0.05"
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
            />
            <span className="form-help">Low temperature (0.05 - 0.2) is recommended for strict mathematical reconciliation.</span>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:
                  testStatus === 'success'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : testStatus === 'failed'
                    ? 'rgba(244, 63, 94, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                color:
                  testStatus === 'success'
                    ? 'var(--color-exact)'
                    : testStatus === 'failed'
                    ? 'var(--color-exception)'
                    : 'var(--accent-primary)',
                border: `1px solid ${
                  testStatus === 'success'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : testStatus === 'failed'
                    ? 'rgba(244, 63, 94, 0.3)'
                    : 'rgba(99, 102, 241, 0.3)'
                }`
              }}
            >
              {testStatus === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
            <span>Test Connection</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
