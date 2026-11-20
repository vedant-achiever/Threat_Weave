/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, Terminal, Database } from 'lucide-react';
import { seedSyntheticData, ingestEvents } from '../api/client';

interface IngestionUploadProps {
  onRefresh: () => void;
}

export const IngestionUpload: React.FC<IngestionUploadProps> = ({ onRefresh }) => {
  const [tenantId, setTenantId] = useState('tenant-sme-mumbai-01');
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await seedSyntheticData();
      await onRefresh();
      setMessage({
        text: 'Synthetic attack scenarios loaded successfully (SSH Brute Force, Phishing-to-Compromise, and Prompt-Injection Guard test).',
        type: 'success'
      });
    } catch (e: any) {
      setMessage({ text: e.message || 'Failed to load synthetic scenarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomIngest = async () => {
    if (!jsonInput.trim()) {
      setMessage({ text: 'Please enter valid JSON events or paste a log payload.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        parsed = [{ event_id: `EVT-${Math.floor(Math.random() * 90000 + 10000)}`, raw_text: jsonInput, source_type: 'siem', severity: 'medium' }];
      }

      if (!Array.isArray(parsed)) parsed = [parsed];

      const res = await ingestEvents(tenantId, parsed);
      await onRefresh();
      setMessage({ text: `Successfully ingested ${res.ingested_count} event(s) into tenant ${tenantId}.`, type: 'success' });
      setJsonInput('');
    } catch (e: any) {
      setMessage({ text: e.message || 'Ingestion error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Log Ingestion & Attack Scenarios
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Submit multi-source security telemetry (JSON or raw logs) or load reproducible synthetic attack scenarios.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-[#f0f8f4] dark:bg-[#1b2b23] border-[#cce5d7] dark:border-[#2c4a3b] text-[#286b49] dark:text-[#72b893]'
              : 'bg-[#fdf2f2] dark:bg-[#2e1e20] border-[#f3d4d4] dark:border-[#593337] text-[#9b3232] dark:text-[#e59898]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* One-click Synthetic Scenarios */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#2c5f7c] dark:text-[#8ab8d6]">
            <Database className="w-4 h-4" />
            <span>Reproducible Dataset</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Load 3 Multi-Source Attack Scenarios
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Populate the workspace with SSH brute force leading to root access, phishing credential harvesting with encoded PowerShell (including an embedded prompt-injection test log), and outbound reverse shell activity.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-5 py-2.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Loading Scenarios...' : 'Load Synthetic Scenarios'}
        </button>
      </div>

      {/* Custom Log Ingestion */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Custom Telemetry Ingestion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste JSON events or raw SIEM text. PII is sanitized locally via the Privacy Gateway.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <label htmlFor="ingest-tenant" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Target Tenant:
            </label>
            <select
              id="ingest-tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="bg-slate-50 dark:bg-[#141920] border border-slate-200 dark:border-[#323d4d] text-slate-800 dark:text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="tenant-sme-mumbai-01">tenant-sme-mumbai-01 (SME)</option>
              <option value="tenant-mssp-client-02">tenant-mssp-client-02 (MSSP Client)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="event-payload" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            Event Payload (JSON array, object, or raw text)
          </label>
          <textarea
            id="event-payload"
            rows={7}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[\n  {\n    "event_id": "EVT-9999",\n    "source_type": "firewall",\n    "host": "fw-mumbai-01",\n    "user": "admin@enterprise.in",\n    "src_ip": "198.51.100.88",\n    "dst_ip": "10.0.1.5",\n    "action": "drop",\n    "severity": "high"\n  }\n]`}
            className="w-full bg-slate-50 dark:bg-[#141920] border border-slate-200 dark:border-[#323d4d] rounded-lg p-4 font-mono text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#2c5f7c] dark:focus:border-[#7db0d1]"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCustomIngest}
            disabled={loading}
            className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-5 py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-4 h-4" /> Ingest & Normalize Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
