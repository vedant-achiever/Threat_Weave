/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    try {
      const res = await fetch('/api/proactive/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      setScanResult(data);
      await loadVaccines();
    } catch (e: any) {
      alert(e.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>AI Proactive Threat Vaccines & Learning Engine</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            ThreatWeave AI automatically learns from confirmed past incidents and generates zero-day detection vaccines to block attacks before they occur a second time.
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Running Proactive Scan...' : 'Run Proactive Threat Scan'}</span>
        </button>
      </div>

      {scanResult && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-5 rounded-2xl flex items-center space-x-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-white">Proactive Scan Completed Successfully</h4>
            <p className="text-xs text-emerald-200 mt-0.5">{scanResult.message}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs font-mono">
              <span>Scanned Events: <strong>{scanResult.scanned_events}</strong></span>
              <span>Preventions: <strong className="text-emerald-400">{scanResult.proactive_preventions}</strong></span>
              <span>Active Vaccines: <strong>{scanResult.active_vaccines}</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white">Learned Threat Vaccines Active in Memory</h3>
        <div className="space-y-4">
          {vaccines.map((vac) => (
            <div key={vac.vaccine_id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
                    {vac.vaccine_id}
                  </span>
                  <span className="font-mono text-xs text-slate-400">Source Incident: {vac.source_incident_id}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{vac.pattern_name}</h4>
                <p className="text-xs font-mono text-cyan-300">Signature: {vac.signature}</p>
                <p className="text-xs text-slate-400">Action: {vac.action_recommended}</p>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Attacks Intercepted</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">{vac.prevented_count}</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-full font-bold">
                  Active Vaccine
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
