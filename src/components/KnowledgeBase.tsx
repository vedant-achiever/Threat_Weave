/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, RefreshCw, CheckCircle2, Shield, Terminal } from 'lucide-react';
import { reindexKnowledge } from '../api/client';

export const KnowledgeBase: React.FC = () => {
  const [reindexing, setReindexing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReindex = async () => {
    setReindexing(true);
    setSuccessMsg(null);
    try {
      const res = await reindexKnowledge();
      setSuccessMsg(res.message);
    } catch (e: any) {
      alert(e.message || 'Reindex failed');
    } finally {
      setReindexing(false);
    }
  };

  const playbooks = [
    { id: 'PLAYBOOK-BRUTE-FORCE-01', title: 'SSH & RDP Brute Force Defense Playbook', stage: 'Credential Access', status: 'Active (pgvector indexed)' },
    { id: 'PLAYBOOK-PHISHING-COMPROMISE', title: 'Phishing Credential Harvesting & PowerShell Triage', stage: 'Execution', status: 'Active (pgvector indexed)' },
    { id: 'PLAYBOOK-ENDPOINT-EXFIL', title: 'Outbound Reverse Shell & Data Exfiltration Containment', stage: 'Command & Control', status: 'Active (pgvector indexed)' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Layer & RAG Playbooks</h2>
          <p className="text-sm text-slate-400 mt-1">
            Vector embeddings database for ATT&CK techniques, CVE/KEV samples, and SOC investigation playbooks.
          </p>
        </div>
        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reindexing ? 'animate-spin' : ''}`} />
          <span>{reindexing ? 'Re-indexing Vector Store...' : 'Re-index pgvector Store'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white">Loaded Investigation Playbooks</h3>
        <div className="space-y-4">
          {playbooks.map(pb => (
            <div key={pb.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">{pb.id}</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">{pb.stage}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{pb.title}</h4>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                {pb.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
