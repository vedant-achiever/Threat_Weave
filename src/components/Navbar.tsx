/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, Menu, Sun, Moon } from 'lucide-react';
import { Tenant } from '../types';

interface NavbarProps {
  tenants: Tenant[];
  selectedTenant: string;
  setSelectedTenant: (tenantId: string) => void;
  mockLlm: boolean;
  onRefresh: () => void;
  onOpenSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tenants,
  selectedTenant,
  setSelectedTenant,
  mockLlm,
  onRefresh,
  onOpenSidebar,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="h-16 bg-white dark:bg-[#1c222b] border-b border-slate-200 dark:border-[#2b3442] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg bg-slate-100 dark:bg-[#232b36] transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#141920] border border-slate-200 dark:border-[#2b3442] rounded-lg px-3 py-1.5 max-w-[260px] md:max-w-none">
          <label htmlFor="tenant-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
            Workspace:
          </label>
          <select
            id="tenant-select"
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="bg-transparent text-xs md:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
          >
            <option value="" className="bg-white dark:bg-[#1c222b] text-slate-800 dark:text-slate-100">
              All Tenants (MSSP Global View)
            </option>
            {tenants.map(t => (
              <option key={t.tenant_id} value={t.tenant_id} className="bg-white dark:bg-[#1c222b] text-slate-800 dark:text-slate-100">
                {t.name} ({t.industry})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
        <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {mockLlm ? 'Deterministic Analysis Mode' : 'Gemini Analysis Active'}
        </span>

        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#232b36] dark:hover:bg-[#2b3544] text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title={theme === 'light' ? 'Switch to soft dark mode' : 'Switch to soft light mode'}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-500" /> : <Sun className="w-3.5 h-3.5 text-slate-300" />}
          <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-[#232b36] dark:hover:bg-[#2b3544] text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-[#323d4d] whitespace-nowrap shrink-0 cursor-pointer"
          title="Refresh data"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-[#2b3442]">
          <div className="w-8 h-8 rounded-full bg-[#edf4f8] dark:bg-[#22313f] text-[#2c5f7c] dark:text-[#9cc5e0] flex items-center justify-center font-semibold text-xs">
            SA
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">Security Analyst</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">CERT-In Response</div>
          </div>
        </div>
      </div>
    </header>
  );
};
