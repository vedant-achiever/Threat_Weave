/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, CheckCircle2, Cpu, ArrowUpRight, Activity, UploadCloud } from 'lucide-react';
import { Incident, Alert, CanonicalEvent } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

interface DashboardOverviewProps {
  incidents: Incident[];
  alerts: Alert[];
  events: CanonicalEvent[];
  theme?: 'light' | 'dark';
  onSelectIncident: (incidentId: string) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  incidents,
  events,
  theme = 'light',
  onSelectIncident,
  onNavigate
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const highCount = incidents.filter(i => i.severity === 'high').length;
  const pendingActionsCount = incidents.reduce(
    (acc, i) => acc + i.recommended_actions.filter(a => a.status === 'pending_approval').length,
    0
  );
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
  ].filter(d => d.value > 0);

  // Calm, muted, low-saturation chart colors
  const CHART_COLORS = ['#3b6e8c', '#638ea8', '#5e8c73', '#b88f4c', '#7c789e'];
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#8b9cb0' : '#64748b';
  const gridColor = isDark ? '#28313e' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1c222b' : '#ffffff',
    borderColor: isDark ? '#323d4d' : '#cbd5e1',
    borderRadius: '8px',
    color: isDark ? '#e6ecf2' : '#1e293b',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
  };

  const severityLabelClass = (severity: string) => {
    if (severity === 'critical') return 'text-[#b43b3b] dark:text-[#e08b8b] font-semibold';
    if (severity === 'high') return 'text-[#9a6318] dark:text-[#dfb06a] font-semibold';
    return 'text-[#2c5f7c] dark:text-[#8ab8d6] font-medium';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Security Operations Overview
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explainable threat investigation and evidence correlation across SME and MSSP workspaces.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('ingestion')}
            className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Load Scenarios
          </button>
          <button
            onClick={() => onNavigate('incidents')}
            className="bg-white hover:bg-slate-50 dark:bg-[#1c222b] dark:hover:bg-[#232b36] text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-slate-200 dark:border-[#323d4d] flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#b43b3b] dark:text-[#e08b8b]" /> View Incidents ({incidents.length})
          </button>
        </div>
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-[#b43b3b] dark:text-[#e08b8b]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {criticalCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {highCount} high priority
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Approvals</span>
            <CheckCircle2 className="w-4 h-4 text-[#9a6318] dark:text-[#dfb06a]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {pendingActionsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Awaiting analyst sign-off
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Prompt Injections Guarded</span>
            <Cpu className="w-4 h-4 text-[#4a558a] dark:text-[#9aa8dc]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {injectionCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Isolated and neutralised
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Canonical Events</span>
            <Activity className="w-4 h-4 text-[#286b49] dark:text-[#72b893]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {events.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Grounded telemetry records
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Incident Risk Scores
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">0–100 scale</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} barSize={44}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }} />
                <Bar dataKey="risk" fill={isDark ? '#6395b5' : '#3b6e8c'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Event Source Breakdown
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-2 border-t border-slate-100 dark:border-[#28313e]">
            {sourceData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span>{item.name}</span>
                <span className="font-mono tabular-nums text-slate-500">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Threat Incidents Table */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-[#2b3442] flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Active Threat Incidents</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any incident to inspect its evidence timeline, grounding validation, and response actions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('incidents')}
            className="text-[#2c5f7c] dark:text-[#8ab8d6] hover:underline text-xs font-medium flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2b3442] bg-slate-50/70 dark:bg-[#171d25] text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-6">Incident ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2b3442] text-sm">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No active incidents for this workspace.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr
                    key={inc.incident_id}
                    className="hover:bg-slate-50 dark:hover:bg-[#232b36] transition-colors cursor-pointer"
                    onClick={() => onSelectIncident(inc.incident_id)}
                  >
                    <td className="py-3.5 px-6 font-mono text-xs font-semibold text-[#2c5f7c] dark:text-[#8ab8d6] whitespace-nowrap">
                      {inc.incident_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {inc.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize whitespace-nowrap">
                      <span className={severityLabelClass(inc.severity)}>{inc.severity}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 bg-slate-200 dark:bg-[#2a3441] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${inc.risk_score > 80 ? 'bg-[#b43b3b] dark:bg-[#d16d6d]' : 'bg-[#b88f4c]'}`}
                            style={{ width: `${inc.risk_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                          {inc.risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 capitalize whitespace-nowrap">
                      {inc.status.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectIncident(inc.incident_id); }}
                        className="bg-[#edf4f8] hover:bg-[#dfecf4] dark:bg-[#22313f] dark:hover:bg-[#2a3d4f] text-[#234d65] dark:text-[#9cc5e0] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
