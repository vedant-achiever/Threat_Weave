/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incident } from '../types';
import { ShieldAlert, Search, Filter, ArrowUpRight } from 'lucide-react';

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Risk-Ranked Incident Queue</h2>
          <p className="text-sm text-slate-400 mt-1">
            Prioritised security incidents correlated across multi-source telemetry.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search incident ID, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500/50 w-64"
            />
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical</option>
              <option value="high" className="bg-slate-900">High</option>
              <option value="medium" className="bg-slate-900">Medium</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[850px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-4 px-6">Incident ID</th>
              <th className="py-4 px-6">Tenant</th>
              <th className="py-4 px-6">Title & Summary</th>
              <th className="py-4 px-6">Severity</th>
              <th className="py-4 px-6">Risk Score</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  No matching incidents found.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onSelectIncident(inc.incident_id)}>
                  <td className="py-4 px-6 font-mono font-bold text-cyan-400">{inc.incident_id}</td>
                  <td className="py-4 px-6 text-xs text-slate-300">{inc.tenant_id}</td>
                  <td className="py-4 px-6 max-w-md">
                    <div className="font-medium text-white">{inc.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{inc.summary}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      inc.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      inc.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6">
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectIncident(inc.incident_id); }}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
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
