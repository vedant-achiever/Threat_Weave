/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incident } from '../types';
import { Search, Filter, ArrowUpRight } from 'lucide-react';

interface IncidentQueueProps {
  incidents: Incident[];
  onSelectIncident: (incidentId: string) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ incidents, onSelectIncident }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = incidents.filter(i => {
    const matchesSearch = i.incident_id.toLowerCase().includes(search.toLowerCase()) ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.summary.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || i.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const severityClass = (severity: string) => {
    if (severity === 'critical') return 'text-[#b43b3b] dark:text-[#e08b8b] font-semibold';
    if (severity === 'high') return 'text-[#9a6318] dark:text-[#dfb06a] font-semibold';
    return 'text-[#2c5f7c] dark:text-[#8ab8d6] font-medium';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Incident Queue
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Risk-ranked security incidents correlated across multi-source telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, title, or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#323d4d] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#2c5f7c] dark:focus:border-[#7db0d1] w-64 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#323d4d] rounded-lg px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#1c222b]">All Severities</option>
              <option value="critical" className="bg-white dark:bg-[#1c222b]">Critical</option>
              <option value="high" className="bg-white dark:bg-[#1c222b]">High</option>
              <option value="medium" className="bg-white dark:bg-[#1c222b]">Medium</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[820px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2b3442] text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#171d25]">
              <th className="py-3.5 px-6">Incident ID</th>
              <th className="py-3.5 px-4">Tenant</th>
              <th className="py-3.5 px-4">Title & Summary</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Risk Score</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#2b3442] text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No matching incidents found.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr
                  key={inc.incident_id}
                  className="hover:bg-slate-50 dark:hover:bg-[#232b36] transition-colors cursor-pointer"
                  onClick={() => onSelectIncident(inc.incident_id)}
                >
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-[#2c5f7c] dark:text-[#8ab8d6] whitespace-nowrap">
                    {inc.incident_id}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                    {inc.tenant_id}
                  </td>
                  <td className="py-4 px-4 max-w-md">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{inc.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{inc.summary}</div>
                  </td>
                  <td className="py-4 px-4 text-xs capitalize whitespace-nowrap">
                    <span className={severityClass(inc.severity)}>{inc.severity}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
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
                  <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 capitalize whitespace-nowrap">
                    {inc.status.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectIncident(inc.incident_id); }}
                      className="bg-[#edf4f8] hover:bg-[#dfecf4] dark:bg-[#22313f] dark:hover:bg-[#2a3d4f] text-[#234d65] dark:text-[#9cc5e0] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Investigate</span> <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
