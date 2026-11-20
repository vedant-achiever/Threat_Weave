/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, LayoutDashboard, AlertTriangle, CheckSquare, FileText, ShieldCheck, BookOpen, X, Shield, Activity, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  tooltip?: string;
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, tooltip: 'SOC command centre — incidents, alerts and events at a glance.' },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, tooltip: 'Risk-ranked queue of security incidents correlated across telemetry.' },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: 0, tooltip: 'Human-in-the-loop queue for containment and remediation actions.' },
  { id: 'reports', label: 'Reports', icon: FileText, tooltip: 'CERT-In 6-hour statutory incident reports and compliance exports.' },
  { id: 'privacy', label: 'Privacy', icon: Shield, tooltip: 'Privacy Gateway — how PII is redacted locally before any model sees data.' },
  { id: 'insights', label: 'Insights', icon: BarChart3, tooltip: 'Plain-language explanation of ML scores, ATT&CK techniques and IOCs.' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, tooltip: 'Investigation playbooks and RAG knowledge layer for ATT&CK techniques.' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingApprovalsCount, isOpen, onClose }) => {
  const menuItems = MENU_ITEMS.map((item) => ({
    ...item,
    badge: item.id === 'approvals' ? pendingApprovalsCount : undefined,
  }));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-wide">ThreatWeave</h1>
              <span className="text-xs font-medium text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                AI SOC Engine v2.4
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={item.tooltip}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Privacy Gateway</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> DPDP Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Local PII Redaction & Grounding Validator online.
          </div>
        </div>
      </aside>
    </>
  );
};
