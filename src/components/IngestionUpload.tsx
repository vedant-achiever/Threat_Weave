/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
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
      setMessage({ text: 'Synthetic attack scenarios loaded successfully (SSH Brute Force, Phishing-to-Compromise, and Prompt-Injection Guard Test)!', type: 'success' });
    } catch (e: any) {
      setMessage({ text: e.message || 'Failed to load synthetic scenarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomIngest = async () => {
    if (!jsonInput.trim()) {
      setMessage({ text: 'Please enter valid JSON events or paste CEF/CSV log payload', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (err) {
        // Wrap as single event if raw text
        parsed = [{ event_id: `EVT-${Math.floor(Math.random()*90000+10000)}`, raw_text: jsonInput, source_type: 'siem', severity: 'medium' }];
      }

      if (!Array.isArray(parsed)) parsed = [parsed];

      const res = await ingestEvents(tenantId, parsed);
      await onRefresh();
      setMessage({ text: `Successfully ingested ${res.ingested_count} events into tenant ${tenantId}!`, type: 'success' });
      setJsonInput('');
    } catch (e: any) {
      setMessage({ text: e.message || 'Ingestion error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Log Ingestion & Attack Scenarios</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload multi-source security telemetry (CSV, JSON, CEF) or instantly load reproducible synthetic attack scenarios.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* One-click Synthetic Scenarios */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> <span>Reproducible Demo Dataset</span>
            </div>
            <h3 className="text-xl font-bold text-white">Load 3 Multi-Source Attack Scenarios</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Instantly populate the SOC with SSH brute force leading to root access, phishing credential harvesting with suspicious PowerShell execution (including a hidden prompt-injection test log), and outbound reverse shell exfiltration.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Loading Scenarios...' : 'Load Synthetic Scenarios'}
          </button>
        </div>
      </div>

      {/* Custom Log Ingestion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Custom Telemetry Ingestion</h3>
            <p className="text-xs text-slate-400">Paste JSON events or CEF logs. PII is automatically sanitized locally via the Privacy Gateway.</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-400">Target Tenant:</span>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="tenant-sme-mumbai-01">tenant-sme-mumbai-01 (SME)</option>
              <option value="tenant-mssp-client-02">tenant-mssp-client-02 (MSSP Client)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Event Payload (JSON Array or Object)
          </label>
          <textarea
            rows={6}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[\n  {\n    "event_id": "EVT-9999",\n    "source_type": "firewall",\n    "host": "fw-mumbai-01",\n    "user": "admin@enterprise.in",\n    "src_ip": "198.51.100.88",\n    "dst_ip": "10.0.1.5",\n    "action": "drop",\n    "severity": "high"\n  }\n]`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/50"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCustomIngest}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" /> Ingest & Normalize Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
