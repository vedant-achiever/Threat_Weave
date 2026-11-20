/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Incident } from '../types';
import { CheckSquare, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { setActionDecision } from '../api/client';

interface ApprovalsQueueProps {
  incidents: Incident[];
  onRefresh: () => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ incidents, onRefresh }) => {
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
    try {
      await setActionDecision(actionId, decision);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Response Actions Approval Queue</h2>
        <p className="text-sm text-slate-400 mt-1">
          Human-in-the-loop review queue for containment and remediation actions across all active incidents.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {pendingActions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No pending response actions requiring approval at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {pendingActions.map(({ incidentId, incidentTitle, action }) => (
              <div key={action.action_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {action.action_id}
                    </span>
                    <span className="font-mono text-xs text-slate-400">Incident: {incidentId}</span>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded uppercase">
                      {action.action_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{incidentTitle}</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong className="text-slate-400">Target:</strong> {action.target} &mdash; {action.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleDecision(action.action_id, 'approve')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Action
                  </button>
                  <button
                    onClick={() => handleDecision(action.action_id, 'reject')}
                    className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
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
