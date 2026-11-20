/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Vaccine {
  vaccine_id: string;
  source_incident_id: string;
  pattern_name: string;
  signature: string;
  action_recommended: string;
  created_at: string;
  prevented_count: number;
}

export const ProactiveVaccines: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadVaccines = async () => {
    try {
      const res = await fetch('/api/proactive/vaccines');
      const data = await res.json();
      setVaccines(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadVaccines();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/proactive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setScanResult(data);
      await loadVaccines();
    } catch (e: any) {
      setErrorMsg(e.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#286b49] dark:text-[#72b893]" />
            <span>Proactive Threat Vaccines</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detection patterns learned automatically from confirmed incidents to help block repeat attacks.
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Running Scan...' : 'Run Proactive Scan'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] text-[#9b3232] dark:text-[#e59898] p-4 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {scanResult && (
        <div className="bg-[#f0f8f4] dark:bg-[#1b2b23] border border-[#cce5d7] dark:border-[#2c4a3b] text-[#286b49] dark:text-[#72b893] p-5 rounded-xl flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Proactive Scan Completed</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{scanResult.message}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
              <span>Scanned Events: <strong>{scanResult.scanned_events}</strong></span>
              <span>Preventions: <strong className="text-[#286b49] dark:text-[#72b893]">{scanResult.proactive_preventions}</strong></span>
              <span>Active Vaccines: <strong>{scanResult.active_vaccines}</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2b3442]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Active Learned Vaccines</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-[#2b3442]">
          {vaccines.map((vac) => (
            <div
              key={vac.vaccine_id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#232b36] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-[#286b49] dark:text-[#72b893]">{vac.vaccine_id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Source: {vac.source_incident_id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#286b49] dark:text-[#72b893] font-medium">Active</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{vac.pattern_name}</h4>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300">Signature: {vac.signature}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Recommended Action: {vac.action_recommended}</p>
              </div>

              <div className="md:text-right shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Attacks Intercepted</div>
                <div className="text-lg font-mono font-semibold tabular-nums text-[#286b49] dark:text-[#72b893]">
                  {vac.prevented_count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
