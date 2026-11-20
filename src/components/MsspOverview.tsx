/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tenant, Incident } from '../types';
import { Building2, ArrowUpRight } from 'lucide-react';

interface MsspOverviewProps {
  tenants: Tenant[];
  incidents: Incident[];
  onSelectTenant: (tenantId: string) => void;
}

export const MsspOverview: React.FC<MsspOverviewProps> = ({ tenants, incidents, onSelectTenant }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          MSSP Multi-Client Overview
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Monitor SME and enterprise client workspaces and switch directly into any tenant view.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tenants.map((t) => {
          const tenantIncidents = incidents.filter(i => i.tenant_id === t.tenant_id);
          const criticals = tenantIncidents.filter(i => i.severity === 'critical').length;

          return (
            <div
              key={t.tenant_id}
              className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#edf4f8] dark:bg-[#22313f] flex items-center justify-center text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.name}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t.industry} · {t.tier}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    criticals > 0
                      ? 'text-[#b43b3b] dark:text-[#e08b8b]'
                      : 'text-[#286b49] dark:text-[#72b893]'
                  }`}
                >
                  {criticals > 0 ? `${criticals} Critical` : 'Nominal'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-[#2b3442]">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Endpoints Monitored</div>
                  <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 font-mono tabular-nums">
                    {t.endpoints_count}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Active Incidents</div>
                  <div className={`text-xl font-semibold mt-0.5 font-mono tabular-nums ${tenantIncidents.length > 0 ? 'text-[#b43b3b] dark:text-[#e08b8b]' : 'text-slate-900 dark:text-slate-100'}`}>
                    {tenantIncidents.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#2b3442]">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{t.tenant_id}</span>
                <button
                  onClick={() => onSelectTenant(t.tenant_id)}
                  className="bg-[#edf4f8] hover:bg-[#dfecf4] dark:bg-[#22313f] dark:hover:bg-[#2a3d4f] text-[#234d65] dark:text-[#9cc5e0] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Workspace</span> <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
