/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Mail, Smartphone, CreditCard, Hash, Monitor, AlertTriangle, Info } from 'lucide-react';

interface RedactionRule {
  icon: React.ElementType;
  label: string;
  plain: string;
  jargon?: string;
  example: string;
}

const REDACTION_RULES: RedactionRule[] = [
  {
    icon: Mail,
    label: 'Email addresses',
    plain: 'Personal or work email addresses are replaced with a safe token before anything leaves this app.',
    example: 'rahul.sharma@enterprise.in  →  [REDACTED_EMAIL_0]',
  },
  {
    icon: Smartphone,
    label: 'Phone numbers',
    plain: 'Indian mobile numbers are masked so they cannot be read by any model or logged in plain text.',
    example: '+91 98765 43210  →  [REDACTED_PHONE_0]',
  },
  {
    icon: CreditCard,
    label: 'PAN (tax ID)',
    plain: 'Permanent Account Numbers are tokenised so tax identifiers never reach a model.',
    example: 'ABCDE1234F  →  [REDACTED_PAN_0]',
  },
  {
    icon: Hash,
    label: 'Aadhaar numbers',
    plain: 'Aadhaar IDs are redacted before processing, keeping identity data local and safe.',
    example: '1234 5678 9012  →  [REDACTED_AADHAAR_0]',
  },
  {
    icon: Monitor,
    label: 'Internal IP addresses',
    plain: 'Private network IPs (10.x and 192.168.x) are replaced with tokens so internal topology stays private.',
    example: '10.0.1.15  →  [REDACTED_INTERNAL_IP_0]',
  },
];

export const Privacy: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Page header with "What am I looking at?" helper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start space-x-3">
        <Info className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-white">Privacy Gateway</h2>
          <p className="text-sm text-slate-300 mt-1">
            <strong>What am I looking at?</strong> This page shows how ThreatWeave AI protects personally
            identifiable information (PII) before any data is processed. All redaction happens locally in
            your browser/environment — nothing unredacted ever leaves this app.
          </p>
        </div>
      </div>

      {/* Gateway status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Privacy Gateway</div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                DPDP Active — Local PII Redaction
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Zero data leaves unredacted
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Every prompt sent to a model is sanitised first. Emails, phones, PANs, Aadhaar numbers and internal
          IPs are replaced with harmless tokens. The original values are kept only in a local map that never
          leaves this environment, so unredacted data can never reach a model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REDACTION_RULES.map((rule, idx) => (
            <div key={rule.label} className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-300">
                  <rule.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">{rule.label}</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">{rule.plain}</p>
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">
                  Example
                </div>
                <div className="text-xs font-mono text-cyan-300">{rule.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">How the Privacy Gateway works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <div className="font-medium text-white text-sm">Data enters the app</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Logs, events and incident text are captured locally.
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
              2
            </div>
            <div>
              <div className="font-medium text-white text-sm">PII is redacted locally</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Emails, phones, PANs, Aadhaar and internal IPs become tokens. Nothing unredacted leaves.
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
              3
            </div>
            <div>
              <div className="font-medium text-white text-sm">Only sanitised text reaches a model</div>
              <div className="text-xs text-slate-400 mt-0.5">
                In MOCK_LLM mode no model is called at all. In live mode, the gateway strips PII before any
                Gemini call, so unredacted data can never reach a model.
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
              4
            </div>
            <div>
              <div className="font-medium text-white text-sm">Original values stay local</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Token-to-original mapping is kept only in this environment and is never transmitted.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty-state style hint (kept minimal since this is an informational page) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-3" />
        <p className="text-sm text-slate-300">
          No action needed — the gateway runs automatically on every ingestion, investigation and report.
        </p>
      </div>
    </div>
  );
};
