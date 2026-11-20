/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incident } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { setActionDecision } from '../api/client';

interface ApprovalsQueueProps {
  incidents: Incident[];
  onRefresh: () => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ incidents, onRefresh }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingActions: { incidentId: string; incidentTitle: string; action: any }[] = [];
  for (const inc of incidents) {
    for (const act of inc.recommended_actions) {
      if (act.status === 'pending_approval') {
        pendingActions.push({
          incidentId: inc.incident_id,
          incidentTitle: inc.title,
          action: act
        });
      }
    }
  }

  const handleDecision = async (actionId: string, decision: 'approve' | 'reject') => {
    setBusyId(actionId);
    setErrorMsg(null);
    try {
      await setActionDecision(actionId, decision);
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Action update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Response Approvals Queue
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Human-in-the-loop review for containment and remediation actions across active incidents.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] text-[#9b3232] dark:text-[#e59898] rounded-xl px-4 py-3 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
        {pendingActions.length === 0 ? (
          <div className="py-14 text-center text-slate-500 dark:text-slate-400 text-sm">
            No pending response actions requiring approval right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-[#2b3442]">
            {pendingActions.map(({ incidentId, incidentTitle, action }) => (
              <div
                key={action.action_id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#232b36] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6]">{action.action_id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{incidentId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {action.action_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{incidentTitle}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Target: <span className="font-mono">{action.target}</span> — {action.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleDecision(action.action_id, 'approve')}
                    disabled={busyId === action.action_id}
                    className="bg-[#286b49] hover:bg-[#1f563a] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision(action.action_id, 'reject')}
                    disabled={busyId === action.action_id}
                    className="bg-white hover:bg-[#fdf2f2] dark:bg-[#1c222b] dark:hover:bg-[#2e1e20] text-[#b43b3b] dark:text-[#e08b8b] border border-slate-200 dark:border-[#4c2e32] px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
