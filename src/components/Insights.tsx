/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, Target, Info, BarChart3 } from 'lucide-react';

interface InsightCard {
  title: string;
  plain: string;
  jargon: string;
  jargonTooltip: string;
  status: 'verified' | 'caution' | 'danger';
  icon: React.ElementType;
  value: string;
  detail: string;
}

const JARGON_TOOLTIPS: Record<string, string> = {
  SHAP: 'SHAP (SHapley Additive exPlanations) — shows which features most influenced the ML risk score.',
  'ATT&CK': 'ATT&CK — a globally known knowledge base of adversary tactics and techniques (e.g. T1110 Brute Force).',
  IOC: 'IOC (Indicator of Compromise) — forensic evidence such as an IP address, domain, or file hash suggesting a breach.',
};

const INSIGHTS: InsightCard[] = [
  {
    title: 'ML Anomaly Score',
    plain: 'How unusual this activity looks compared to normal behaviour, scored by the ML model.',
    jargon: 'SHAP / Anomaly Score',
    jargonTooltip: JARGON_TOOLTIPS.SHAP,
    status: 'danger',
    icon: AlertTriangle,
    value: '0.98',
    detail: 'Near-maximum anomaly — strongest contributor is an encoded PowerShell command line.',
  },
  {
    title: 'Attack Technique',
    plain: 'The recognised adversary behaviour pattern matched against a known framework.',
    jargon: 'ATT&CK Technique',
    jargonTooltip: JARGON_TOOLTIPS['ATT&CK'],
    status: 'verified',
    icon: Target,
    value: 'T1059.001',
    detail: 'Command and Scripting Interpreter: PowerShell — mapped to MITRE ATT&CK Execution tactic.',
  },
  {
    title: 'Indicator of Compromise',
    plain: 'A specific piece of evidence observed in this incident that suggests compromise.',
    jargon: 'IOC',
    jargonTooltip: JARGON_TOOLTIPS.IOC,
    status: 'caution',
    icon: ShieldAlert,
    value: '198.51.100.45',
    detail: 'External IP tied to 50 failed SSH logins followed by a successful root login.',
  },
];

export const Insights: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Investigation Insights</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            This guide explains the key signals behind each incident in plain language. Security terms (SHAP, ATT&amp;CK, IOC) include hover tooltips, and every status indicator pairs color with clear text.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {INSIGHTS.map((insight) => {
          const statusCfg = {
            verified: {
              text: 'text-[#286b49] dark:text-[#72b893]',
              bar: 'bg-[#4f8e6d]',
              label: 'Verified',
              width: '72%',
            },
            caution: {
              text: 'text-[#9a6318] dark:text-[#dfb06a]',
              bar: 'bg-[#b88f4c]',
              label: 'Caution',
              width: '55%',
            },
            danger: {
              text: 'text-[#b43b3b] dark:text-[#e08b8b]',
              bar: 'bg-[#b43b3b]',
              label: 'High Risk',
              width: '92%',
            },
          }[insight.status];

          const Icon = insight.icon;

          return (
            <div
              key={insight.title}
              className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${statusCfg.text}`} />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{insight.title}</h3>
                </div>
                <span
                  className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#323d4d] rounded px-1.5 py-0.5 cursor-help"
                  title={insight.jargonTooltip}
                >
                  ?
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                {insight.jargon} · <span className={`font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">{insight.plain}</p>

              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#2b3442]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Observed Value</span>
                  <span className={`text-xs font-mono font-semibold tabular-nums ${statusCfg.text}`}>
                    {insight.value}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#2a3441] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusCfg.bar}`} style={{ width: statusCfg.width }} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glossary */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Security Terms Glossary</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Plain-language definitions for common abbreviations used throughout ThreatWeave.
        </p>
        <div className="divide-y divide-slate-200 dark:divide-[#2b3442]">
          {Object.entries(JARGON_TOOLTIPS).map(([term, desc]) => (
            <div key={term} className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <span className="text-xs font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6] w-24 shrink-0">
                {term}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442] rounded-xl p-5 flex items-center justify-center gap-2.5 text-center">
        <BarChart3 className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Insights update from detected incidents and ML scoring. Load attack scenarios from Log Ingestion to explore live records.
        </p>
      </div>
    </div>
  );
};
