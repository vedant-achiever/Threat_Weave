/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Cpu, ArrowUpRight, ShieldCheck, Activity, UploadCloud } from 'lucide-react';
import { Incident, Alert, CanonicalEvent } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface DashboardOverviewProps {
  incidents: Incident[];
  alerts: Alert[];
  events: CanonicalEvent[];
  onSelectIncident: (incidentId: string) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  incidents,
  alerts,
  events,
  onSelectIncident,
  onNavigate
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const highCount = incidents.filter(i => i.severity === 'high').length;
  const pendingActionsCount = incidents.reduce((acc, i) => acc + i.recommended_actions.filter(a => a.status === 'pending_approval').length, 0);
  const injectionCount = events.filter(e => e.prompt_injection_flag).length;

  const riskData = incidents.map(i => ({
    name: i.incident_id,
    risk: i.risk_score,
    severity: i.severity
  }));

  const sourceData = [
    { name: 'Auth', value: events.filter(e => e.source_type === 'auth').length },
    { name: 'Endpoint', value: events.filter(e => e.source_type === 'endpoint').length },
    { name: 'Firewall', value: events.filter(e => e.source_type === 'firewall').length },
    { name: 'Email', value: events.filter(e => e.source_type === 'email').length },
    { name: 'IDS', value: events.filter(e => e.source_type === 'ids').length },
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Operations Command (SOC)</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time explainable agentic threat investigation & automated evidence correlation for SMEs & MSSPs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('ingestion')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Load Attack Scenarios
          </button>
          <button
            onClick={() => onNavigate('incidents')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" /> View Incidents ({incidents.length})
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Critical Incidents</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{criticalCount}</span>
            <span className="text-xs text-rose-400 font-medium">{highCount} high priority</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{pendingActionsCount}</span>
            <span className="text-xs text-amber-400 font-medium">Require SOC Sign-off</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Prompt Injections Guarded</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{injectionCount}</span>
            <span className="text-xs text-purple-400 font-medium">Isolated & Neutralised</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Canonical Events</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{events.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Grounded</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>Incident Risk Scores & Priority Distribution</span>
            <span className="text-xs text-slate-400 font-normal">Dynamic Risk Matrix</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="risk" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Event Source Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Active Threat Incidents</h3>
            <p className="text-xs text-slate-400">Click any incident to inspect verifiable evidence timeline and AI explanation.</p>
          </div>
          <button
            onClick={() => onNavigate('incidents')}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {incidents.map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onSelectIncident(inc.incident_id)}>
                  <td className="py-4 px-4 font-mono font-medium text-cyan-400">{inc.incident_id}</td>
                  <td className="py-4 px-4 font-medium text-white max-w-xs truncate">{inc.title}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      inc.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      inc.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${inc.risk_score > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${inc.risk_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">{inc.risk_score}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectIncident(inc.incident_id); }}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
