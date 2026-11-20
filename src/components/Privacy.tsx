/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Mail, Smartphone, CreditCard, Hash, Monitor, Info } from 'lucide-react';

interface RedactionRule {
  icon: React.ElementType;
  label: string;
  plain: string;
  example: string;
}

const REDACTION_RULES: RedactionRule[] = [
  {
    icon: Mail,
    label: 'Email addresses',
    plain: 'Personal or work email addresses are replaced with a safe token before anything leaves this environment.',
    example: 'rahul.sharma@enterprise.in  →  [REDACTED_EMAIL_0]',
  },
  {
    icon: Smartphone,
    label: 'Phone numbers',
    plain: 'Indian mobile numbers are masked so they cannot be read by any external model or stored in plain text.',
    example: '+91 98765 43210  →  [REDACTED_PHONE_0]',
  },
  {
    icon: CreditCard,
    label: 'PAN (tax ID)',
    plain: 'Permanent Account Numbers are tokenised so tax identifiers never reach external services.',
    example: 'ABCDE1234F  →  [REDACTED_PAN_0]',
  },
  {
    icon: Hash,
    label: 'Aadhaar numbers',
    plain: 'Aadhaar IDs are redacted locally before processing, keeping identity data protected.',
    example: '1234 5678 9012  →  [REDACTED_AADHAAR_0]',
  },
  {
    icon: Monitor,
    label: 'Internal IP addresses',
    plain: 'Private network IPs (10.x and 192.168.x) are replaced with tokens to keep internal topology private.',
    example: '10.0.1.15  →  [REDACTED_INTERNAL_IP_0]',
  },
];

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Data enters the workspace',
    desc: 'Logs, alerts, and incident telemetry are captured locally.',
  },
  {
    step: '02',
    title: 'PII is redacted locally',
    desc: 'Emails, phone numbers, PANs, Aadhaar IDs, and internal IPs are replaced with tokens before processing.',
  },
  {
    step: '03',
    title: 'Only sanitised text reaches analysis',
    desc: 'In deterministic mode no external model is called. In live mode, the gateway strips PII prior to every model call.',
  },
  {
    step: '04',
    title: 'Original values stay local',
    desc: 'Token-to-original mapping remains strictly in local memory and is never transmitted externally.',
  },
];

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Privacy Gateway (DPDP Compliance)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            ThreatWeave protects personally identifiable information (PII) locally before any investigation runs. Nothing unredacted leaves the application.
          </p>
        </div>
      </div>

      {/* Gateway rules */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#f0f8f4] dark:bg-[#1b2b23] flex items-center justify-center text-[#286b49] dark:text-[#72b893]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Local PII Redaction Active
              </div>
              <div className="text-xs text-[#286b49] dark:text-[#72b893]">
                DPDP safeguard enabled automatically on every request
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Zero unredacted egress
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {REDACTION_RULES.map((rule) => (
            <div
              key={rule.label}
              className="bg-slate-50/70 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442] rounded-lg p-4 flex flex-col"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <rule.icon className="w-4 h-4 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0" />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.label}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{rule.plain}</p>
              <div className="mt-auto bg-white dark:bg-[#141920] border border-slate-200 dark:border-[#2b3442] rounded-md p-2.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Example</div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{rule.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          How the Privacy Gateway Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PIPELINE_STEPS.map((item) => (
            <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 dark:bg-[#171d25]">
              <span className="font-mono text-xs font-semibold text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5">
                {item.step}.
              </span>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
