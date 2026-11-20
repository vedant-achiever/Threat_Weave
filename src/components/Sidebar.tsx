/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  FileText,
  ShieldCheck,
  BookOpen,
  X,
  Shield,
  BarChart3,
  UploadCloud,
  Building2
} from 'lucide-react';

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
  group: 'operations' | 'intelligence';
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'operations', tooltip: 'Command centre — incidents, alerts, and events at a glance.' },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, group: 'operations', tooltip: 'Risk-ranked queue of correlated security incidents.' },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare, group: 'operations', tooltip: 'Human-in-the-loop queue for containment and remediation actions.' },
  { id: 'ingestion', label: 'Log Ingestion', icon: UploadCloud, group: 'operations', tooltip: 'Upload telemetry or load reproducible attack scenarios.' },
  { id: 'mssp', label: 'Clients', icon: Building2, group: 'operations', tooltip: 'Multi-tenant client overview for MSSPs.' },
  { id: 'reports', label: 'Reports', icon: FileText, group: 'intelligence', tooltip: 'CERT-In 6-hour statutory incident reports and compliance exports.' },
  { id: 'privacy', label: 'Privacy Gateway', icon: Shield, group: 'intelligence', tooltip: 'How PII is redacted locally before any model sees data.' },
  { id: 'insights', label: 'Insights', icon: BarChart3, group: 'intelligence', tooltip: 'Plain-language guide to ML scores, ATT&CK techniques, and IOCs.' },
  { id: 'vaccines', label: 'Threat Vaccines', icon: ShieldCheck, group: 'intelligence', tooltip: 'Learned detection patterns from confirmed incidents.' },
  { id: 'knowledge', label: 'Playbooks', icon: BookOpen, group: 'intelligence', tooltip: 'Investigation playbooks and RAG knowledge layer.' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingApprovalsCount, isOpen, onClose }) => {
  const operationsItems = MENU_ITEMS.filter(item => item.group === 'operations');
  const intelligenceItems = MENU_ITEMS.filter(item => item.group === 'intelligence');

  const renderNavGroup = (title: string, items: MenuItem[]) => (
    <div className="space-y-1">
      <div className="px-3 pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const badge = item.id === 'approvals' ? pendingApprovalsCount : 0;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#edf4f8] dark:bg-[#22313f] text-[#234d65] dark:text-[#9cc5e0]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232b36]'
            }`}
            title={item.tooltip}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2c5f7c] dark:text-[#8ab8d6]' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {badge > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-[#9a6318] dark:text-[#dfb06a] bg-[#fef9ee] dark:bg-[#2c2419] px-2 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1c222b] border-r border-slate-200 dark:border-[#2b3442] flex flex-col shrink-0 transition-transform duration-200
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 px-5 border-b border-slate-200 dark:border-[#2b3442] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#2c5f7c] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight whitespace-nowrap truncate">
              ThreatWeave
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232b36]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {renderNavGroup('Operations', operationsItems)}
          {renderNavGroup('Governance & Intelligence', intelligenceItems)}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-[#2b3442] bg-slate-50/70 dark:bg-[#171d25]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Privacy Gateway</span>
            <span className="text-[#286b49] dark:text-[#72b893] font-medium">DPDP Active</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Local PII redaction and claim grounding enabled.
          </p>
        </div>
      </aside>
    </>
  );
};
