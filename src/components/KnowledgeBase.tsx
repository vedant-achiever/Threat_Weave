/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { reindexKnowledge } from '../api/client';

export const KnowledgeBase: React.FC = () => {
  const [reindexing, setReindexing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReindex = async () => {
    setReindexing(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await reindexKnowledge();
      setSuccessMsg(res.message);
    } catch (e: any) {
      setErrorMsg(e.message || 'Reindex failed');
    } finally {
      setReindexing(false);
    }
  };

  const playbooks = [
    { id: 'PLAYBOOK-BRUTE-FORCE-01', title: 'SSH & RDP Brute Force Defense Playbook', stage: 'Credential Access', status: 'Active · Indexed' },
    { id: 'PLAYBOOK-PHISHING-COMPROMISE', title: 'Phishing Credential Harvesting & PowerShell Triage', stage: 'Execution', status: 'Active · Indexed' },
    { id: 'PLAYBOOK-ENDPOINT-EXFIL', title: 'Outbound Reverse Shell & Data Exfiltration Containment', stage: 'Command & Control', status: 'Active · Indexed' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Playbooks & Knowledge Layer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Indexed investigation playbooks, MITRE ATT&amp;CK references, and CVE/KEV context used during analysis.
          </p>
        </div>
        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
          <span>{reindexing ? 'Re-indexing...' : 'Re-index Knowledge Store'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-[#f0f8f4] dark:bg-[#1b2b23] border border-[#cce5d7] dark:border-[#2c4a3b] text-[#286b49] dark:text-[#72b893] p-4 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] text-[#9b3232] dark:text-[#e59898] p-4 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2b3442]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Loaded Investigation Playbooks</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-[#2b3442]">
          {playbooks.map(pb => (
            <div key={pb.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#232b36] transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#edf4f8] dark:bg-[#22313f] flex items-center justify-center text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6]">{pb.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pb.stage}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{pb.title}</h4>
                </div>
              </div>

              <span className="text-xs font-medium text-[#286b49] dark:text-[#72b893] whitespace-nowrap shrink-0">
                {pb.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
