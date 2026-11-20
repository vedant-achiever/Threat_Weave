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
  IOC: 'IOC (Indicator of Compromise) — a piece of forensic evidence, such as an IP address, domain or file hash, that suggests a breach.',
};

const INSIGHTS: InsightCard[] = [
  {
    title: 'ML Anomaly Score',
    plain: 'How unusual this activity looks compared to normal behaviour, scored by the ML model.',
    jargon: 'ML Anomaly Score',
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
  const TOOLTIP_MAP = JARGON_TOOLTIPS;

  return (
    <div className="p-8 space-y-8">
      {/* Page header with "What am I looking at?" helper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start space-x-3">
        <Info className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-white">Investigation Insights</h2>
          <p className="text-sm text-slate-300 mt-1">
            <strong>What am I looking at?</strong> This page explains the key signals behind each incident in
            plain language. Jargon terms (SHAP, ATT&CK, IOC) have one-line tooltips — hover or tap them to
            see what they mean. Colours are always paired with meaning: green = verified, amber = inferred or
            caution, red = rejected or danger.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INSIGHTS.map((insight) => {
          const statusCfg: Record<string, { bg: string; border: string; text: string; dot: string }> = {
            verified: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
            caution: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
            danger: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
          };
          const cfg = statusCfg[insight.status];
          const Icon = insight.icon;
          const tooltip = insight.jargonTooltip || '';

          return (
            <div
              key={insight.title}
              className={`bg-slate-900 border ${cfg.border} rounded-2xl p-6 flex flex-col`}
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.text} shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-white ${cfg.text}`}>{insight.title}</div>
                  {tooltip && (
                    <span className="inline-block ml-2 text-xs border border-slate-700/50 rounded px-1.5 py-0.5 text-slate-400 bg-slate-950/50" title={tooltip}>
                      ?
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {insight.jargon}
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{insight.plain}</p>

              <div className="mt-auto pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-300">Value</span>
                  <span className={`text-xs font-mono font-bold ${cfg.text}`}>{insight.value}</span>
                </div>
                <div className={`w-full bg-slate-950 h-2 rounded-full overflow-hidden ${cfg.bg}`}>
                  <div className="h-full" style={{ width: insight.status === 'danger' ? '90%' : insight.status === 'verified' ? '70%' : '50%' }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jargon legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Jargon guide</h3>
        <p className="text-xs text-slate-400 mb-4">
          Terms used across ThreatWeave AI. Hover any term marked with a <span className="text-cyan-400">?</span>
          badge for a one-line plain-language explanation.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(TOOLTIP_MAP).map(([term, desc]) => (
            <div key={term} className="flex items-start space-x-2 bg-slate-950/50 border border-slate-800/50 rounded-lg p-3">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-900/40 px-2 py-0.5 rounded shrink-0">
                {term}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empty-state style hint */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <BarChart3 className="w-6 h-6 text-slate-500 mx-auto mb-3" />
        <p className="text-sm text-slate-400">
          Insights are populated automatically from detected incidents and ML scoring. Load attack scenarios
          from Ingestion to see them here.
        </p>
      </div>
    </div>
  );
};
