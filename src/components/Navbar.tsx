/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Cpu, RefreshCw, Menu } from 'lucide-react';
import { Tenant } from '../types';

interface NavbarProps {
  tenants: Tenant[];
  selectedTenant: string;
  setSelectedTenant: (tenantId: string) => void;
  mockLlm: boolean;
  onRefresh: () => void;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ tenants, selectedTenant, setSelectedTenant, mockLlm, onRefresh, onOpenSidebar }) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 max-w-[240px] md:max-w-none">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Tenant Context:</span>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="bg-transparent text-xs md:text-sm font-medium text-white focus:outline-none cursor-pointer truncate"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Tenants (MSSP Global View)</option>
            {tenants.map(t => (
              <option key={t.tenant_id} value={t.tenant_id} className="bg-slate-900 text-slate-200">
                {t.name} ({t.industry})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Cpu className={`w-4 h-4 ${mockLlm ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="text-slate-300 font-medium">
            Engine: {mockLlm ? 'Deterministic Fallback (Mock LLM)' : 'Google Gemini Flash Active'}
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-slate-700"
          title="Refresh Data & Re-sync"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Sync</span>
        </button>

        <div className="flex items-center space-x-3 pl-2 md:pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
            SOC
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-white">Lead Security Analyst</div>
            <div className="text-[10px] text-emerald-400 font-medium">CERT-In Response Team</div>
          </div>
        </div>
      </div>
    </header>
  );
};
