/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tenant, Incident } from '../types';
import { Building2, ShieldAlert, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface MsspOverviewProps {
  tenants: Tenant[];
  incidents: Incident[];
  onSelectTenant: (tenantId: string) => void;
}

export const MsspOverview: React.FC<MsspOverviewProps> = ({ tenants, incidents, onSelectTenant }) => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">MSSP Multi-Client Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Managed Security Service Provider multi-tenant dashboard for monitoring SME clients in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map((t) => {
          const tenantIncidents = incidents.filter(i => i.tenant_id === t.tenant_id);
          const criticals = tenantIncidents.filter(i => i.severity === 'critical').length;

          return (
            <div key={t.tenant_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.name}</h3>
                    <span className="text-xs text-slate-400">{t.industry} &bull; {t.tier}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  criticals > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {criticals > 0 ? `${criticals} Critical Threats` : 'Secure'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Endpoints Monitored</div>
                  <div className="text-xl font-bold text-white mt-1 font-mono">{t.endpoints_count}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Active Incidents</div>
                  <div className="text-xl font-bold text-rose-400 mt-1 font-mono">{tenantIncidents.length}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onSelectTenant(t.tenant_id)}
                  className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Switch to Tenant SOC</span> <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
