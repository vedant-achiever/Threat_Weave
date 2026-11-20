/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incident } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Target,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Bug,
  RotateCcw
} from 'lucide-react';
import { investigateIncident, setActionDecision, submitVerdict, injectAttack, investigateShield } from '../api/client';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onUpdateIncident: (updated: Incident) => void;
  onOpenCertInReport: (incidentId: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onBack,
  onUpdateIncident,
  onOpenCertInReport
}) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shieldDemo, setShieldDemo] = useState<{
    active: boolean;
    injected: boolean;
    shieldResult: any;
    attack: any;
  } | null>(null);

  const handleRunAI = async () => {
    setLoadingAI(true);
    setErrorMsg(null);
    try {
      const updated = await investigateIncident(incident.incident_id);
      onUpdateIncident(updated);
    } catch (e: any) {
      setErrorMsg(e.message || 'Investigation failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleInjectAttack = async () => {
    setErrorMsg(null);
    try {
      const res = await injectAttack(incident.incident_id, {});
      setShieldDemo({
        active: true,
        injected: true,
        attack: res.attack,
        shieldResult: null,
      });
    } catch (e: any) {
      setErrorMsg(e.message || 'Injection test failed');
    }
  };

  const handleRunShield = async () => {
    setErrorMsg(null);
    setShieldDemo(prev => ({
      active: true,
      injected: prev?.injected ?? false,
      attack: prev?.attack ?? null,
      shieldResult: null,
    }));
    try {
      const res = await investigateShield(incident.incident_id);
      setShieldDemo(prev => ({
        ...(prev || { active: true, injected: false, attack: null, shieldResult: null }),
        active: true,
        shieldResult: res.shield,
      }));
      const updated = await fetch(`/api/incidents/${incident.incident_id}`).then(r => r.json());
      onUpdateIncident(updated.incident || updated);
    } catch (e: any) {
      setErrorMsg(e.message || 'Shield investigation failed');
    }
  };

  const handleAction = async (actionId: string, decision: 'approve' | 'reject') => {
    setActionLoading(actionId);
    setErrorMsg(null);
    try {
      await setActionDecision(actionId, decision);
      const updatedActions = incident.recommended_actions.map(a =>
        a.action_id === actionId
          ? { ...a, status: decision === 'approve' ? ('approved' as const) : ('rejected' as const) }
          : a
      );
      onUpdateIncident({ ...incident, recommended_actions: updatedActions });
    } catch (e: any) {
      setErrorMsg(e.message || 'Action update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerdict = async (verdict: string) => {
    setErrorMsg(null);
    try {
      const updated = await submitVerdict(incident.incident_id, verdict);
      onUpdateIncident(updated);
    } catch (e: any) {
      setErrorMsg(e.message || 'Verdict update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#323d4d] px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Back to Queue</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShieldDemo(prev => prev ? null : { active: true, injected: false, attack: null, shieldResult: null })}
            className="bg-white hover:bg-slate-50 dark:bg-[#1c222b] dark:hover:bg-[#232b36] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#323d4d] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[#4a558a] dark:text-[#9aa8dc]" />
            <span>{shieldDemo ? 'Hide Shield Test' : 'Test Injection Shield'}</span>
          </button>
          <button
            onClick={() => onOpenCertInReport(incident.incident_id)}
            className="bg-white hover:bg-slate-50 dark:bg-[#1c222b] dark:hover:bg-[#232b36] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#323d4d] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#2c5f7c] dark:text-[#8ab8d6]" /> CERT-In 6-Hour Report
          </button>
          <button
            onClick={handleRunAI}
            disabled={loadingAI}
            className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
            <span>{loadingAI ? 'Running Investigation...' : 'Re-Run Investigation'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] text-[#9b3232] dark:text-[#e59898] rounded-xl px-4 py-3 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Prompt Injection Warning Banner */}
      {incident.prompt_injection_warnings && incident.prompt_injection_warnings.length > 0 && (
        <div className="bg-[#f2f4fa] dark:bg-[#202436] border border-[#d7ddf0] dark:border-[#343c5c] rounded-xl p-5 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-[#4a558a] dark:text-[#9aa8dc] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Prompt-Injection Guard Triggered
            </h4>
            {incident.prompt_injection_warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-mono leading-relaxed">{warn}</p>
            ))}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Raw log payloads were wrapped in untrusted delimiters and injected commands were ignored.
            </p>
          </div>
        </div>
      )}

      {/* Injection Shield Demo Panel */}
      {shieldDemo && (
        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Injection Shield Verification
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Inject a sample prompt-override instruction into a log field, then run the shielded investigation to verify the payload is quarantined and the verdict remains intact.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!shieldDemo.injected && (
              <button
                onClick={handleInjectAttack}
                disabled={loadingAI}
                className="bg-[#b43b3b] hover:bg-[#993030] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Bug className="w-4 h-4" /> Inject Test Instruction
              </button>
            )}
            {shieldDemo.injected && !shieldDemo.shieldResult && (
              <button
                onClick={handleRunShield}
                disabled={loadingAI}
                className="bg-[#2c5f7c] hover:bg-[#234d65] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> Run Shielded Investigation
              </button>
            )}
            {shieldDemo.shieldResult && (
              <button
                onClick={() => setShieldDemo(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-[#232b36] dark:hover:bg-[#2d3745] text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Close Test
              </button>
            )}
          </div>

          {shieldDemo.injected && shieldDemo.attack && !shieldDemo.shieldResult && (
            <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-semibold text-[#9b3232] dark:text-[#e59898]">
                Test Instruction Injected into {shieldDemo.attack.event_id} ({shieldDemo.attack.field})
              </h4>
              <div className="bg-white dark:bg-[#141920] border border-slate-200 dark:border-[#2b3442] rounded-md p-3 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                {shieldDemo.attack.injected_value}
              </div>
            </div>
          )}

          {shieldDemo.shieldResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442]">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Injection Detected</div>
                  <div className={`text-sm font-semibold mt-1 ${shieldDemo.shieldResult.injection_detected ? 'text-[#b43b3b] dark:text-[#e08b8b]' : 'text-[#286b49] dark:text-[#72b893]'}`}>
                    {shieldDemo.shieldResult.injection_detected ? 'Yes — Flagged' : 'None'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442]">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Events Quarantined</div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                    {shieldDemo.shieldResult.shielded_events.filter((e: any) => e.quarantined).length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442]">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Verdict Integrity</div>
                  <div className={`text-sm font-semibold mt-1 ${shieldDemo.shieldResult.verdict_unchanged ? 'text-[#286b49] dark:text-[#72b893]' : 'text-[#b43b3b] dark:text-[#e08b8b]'}`}>
                    {shieldDemo.shieldResult.verdict_unchanged ? 'Preserved' : 'Changed'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#fdf2f2] dark:bg-[#2e1e20] border border-[#f3d4d4] dark:border-[#593337] rounded-lg p-4">
                  <div className="text-xs font-semibold text-[#9b3232] dark:text-[#e59898] mb-1">
                    Without Shield (Simulated)
                  </div>
                  <div className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    {shieldDemo.shieldResult.verdict_before ?? '—'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Raw injection would reach the prompt and try to force a benign verdict.
                  </p>
                </div>
                <div className="bg-[#f0f8f4] dark:bg-[#1b2b23] border border-[#cce5d7] dark:border-[#2c4a3b] rounded-lg p-4">
                  <div className="text-xs font-semibold text-[#286b49] dark:text-[#72b893] mb-1">
                    With Shield Active
                  </div>
                  <div className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    {shieldDemo.shieldResult.verdict_after ?? '—'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Injected instruction quarantined prior to reasoning; verdict preserved.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442] rounded-lg p-4 text-xs font-mono space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="font-sans font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Audit Record · {shieldDemo.shieldResult.audit_entry.audit_id}
                </div>
                <div>Event: {shieldDemo.shieldResult.audit_entry.event_id} · Action: {shieldDemo.shieldResult.audit_entry.action}</div>
                <div className="truncate">Snippet: {shieldDemo.shieldResult.audit_entry.payload_snippet}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incident Header & Grounded Claims */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6]">{incident.incident_id}</span>
              <span aria-hidden="true">·</span>
              <span className={`capitalize font-semibold ${incident.severity === 'critical' ? 'text-[#b43b3b] dark:text-[#e08b8b]' : 'text-[#9a6318] dark:text-[#dfb06a]'}`}>
                {incident.severity} severity
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{incident.tenant_id}</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {incident.title}
            </h1>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442] px-5 py-3 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Grounding Score</div>
              <div className="text-lg font-mono font-semibold tabular-nums text-[#286b49] dark:text-[#72b893] flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4" /> {(incident.grounding_score * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-px h-9 bg-slate-200 dark:bg-[#2b3442]" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Risk Score</div>
              <div className="text-lg font-mono font-semibold tabular-nums text-[#b43b3b] dark:text-[#e08b8b] mt-0.5">
                {incident.risk_score} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Claims Section */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#2b3442]">
          <div className="flex items-start gap-3 mb-5">
            <Target className="w-5 h-5 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Investigation Claims & Evidence Grounding
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Every claim is validated against logged evidence:{' '}
                <span className="text-[#286b49] dark:text-[#72b893] font-semibold">Supported</span> (verified by log IDs),{' '}
                <span className="text-[#9a6318] dark:text-[#dfb06a] font-semibold">Inferred</span> (reasoning linked to evidence),{' '}
                <span className="text-[#b43b3b] dark:text-[#e08b8b] font-semibold">Stripped</span> (unverified claims removed). Select a claim to highlight its events below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Supported + Inferred claims */}
            <div className="lg:col-span-2 divide-y divide-slate-200 dark:divide-[#2b3442] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
              {incident.claims.map((claim) => {
                const validation = incident.claim_validations.find(v => v.claim_id === claim.claim_id);
                const isSelected = selectedClaimId === claim.claim_id;
                const statusText =
                  validation?.status === 'SUPPORTED'
                    ? 'text-[#286b49] dark:text-[#72b893]'
                    : validation?.status === 'INFERRED'
                    ? 'text-[#9a6318] dark:text-[#dfb06a]'
                    : 'text-[#b43b3b] dark:text-[#e08b8b]';

                return (
                  <div
                    key={claim.claim_id}
                    onClick={() => setSelectedClaimId(isSelected ? null : claim.claim_id)}
                    className={`cursor-pointer p-4 transition-colors ${
                      isSelected
                        ? 'bg-[#edf4f8] dark:bg-[#22313f]'
                        : 'bg-white dark:bg-[#1c222b] hover:bg-slate-50 dark:hover:bg-[#222933]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${statusText}`}>
                          {validation?.status === 'SUPPORTED' ? 'Supported' : validation?.status === 'INFERRED' ? 'Inferred' : 'Stripped'}
                        </span>
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span className="capitalize text-slate-500 dark:text-slate-400">{claim.type}</span>
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {claim.evidence_event_ids.join(', ') || '—'}
                        </span>
                      </div>
                      {isSelected ? (
                        <EyeOff className="w-4 h-4 text-[#2c5f7c] dark:text-[#8ab8d6] shrink-0" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{claim.text}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span>{validation?.reason ?? 'Validated'}</span>
                      {claim.knowledge_refs.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">Refs: {claim.knowledge_refs.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {incident.claims.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No claims recorded yet. Run the investigation to generate structured claims.
                </div>
              )}
            </div>

            {/* Rejected claims & Disproof criteria */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#fdf2f2] dark:bg-[#281d1f] border border-[#f3d4d4] dark:border-[#4c2e32] rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#b43b3b] dark:text-[#e08b8b] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#9b3232] dark:text-[#e59898]">Rejected Claims</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Stripped from the narrative due to missing or fabricated IDs.
                    </p>
                  </div>
                </div>
                {incident.rejected_claims.length > 0 ? (
                  <div className="space-y-2.5">
                    {incident.rejected_claims.map((claim) => {
                      const validation = incident.claim_validations.find(v => v.claim_id === claim.claim_id);
                      return (
                        <div key={claim.claim_id} className="bg-white/80 dark:bg-[#1c1618] border border-[#f3d4d4] dark:border-[#4c2e32] rounded-lg p-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">"{claim.text}"</p>
                          <div className="text-[11px] text-[#9b3232] dark:text-[#e08b8b] mt-1.5 font-mono">
                            Stripped · {claim.evidence_event_ids.join(', ') || '—'}
                          </div>
                          {validation?.reason && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{validation.reason}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No rejected claims.</p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-[#171d25] border border-slate-200 dark:border-[#2b3442] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                  What would disprove this?
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {incident.disproof_evidence.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {incident.disproof_evidence.length === 0 && (
                    <li className="text-slate-500 italic">No disproof evidence recorded.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Evidence Timeline</h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {incident.evidence_event_ids.length} linked events
            </span>
          </div>

          <div className="space-y-3">
            {incident.timeline.map((item, idx) => {
              const selectedClaim = incident.claims.find(c => c.claim_id === selectedClaimId);
              const isHighlighted = selectedClaim && selectedClaim.evidence_event_ids.includes(item.event_id);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-colors ${
                    isHighlighted
                      ? 'bg-[#edf4f8] dark:bg-[#22313f] border-[#9bc0d6] dark:border-[#4b7291]'
                      : 'bg-slate-50/70 dark:bg-[#171d25] border-slate-200 dark:border-[#2b3442]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6]">
                      {item.event_id} · {item.source}
                    </span>
                    <span className="font-mono tabular-nums">{new Date(item.time).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Score Breakdown */}
        <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Risk Score & SHAP Factor Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Factor contributions computed by deterministic rules and ML scoring.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Severity Weight', value: incident.risk_breakdown.severity_weight, max: 25, color: 'bg-[#3b6e8c]' },
              { label: 'Intel Reputation (AbuseIPDB / URLhaus)', value: incident.risk_breakdown.intel_reputation, max: 20, color: 'bg-[#b88f4c]' },
              { label: 'Kill-Chain Stage Progression', value: incident.risk_breakdown.kill_chain_stage, max: 15, color: 'bg-[#6b729e]' },
              { label: 'ML Anomaly Score (Isolation Forest)', value: incident.risk_breakdown.ml_score, max: 15, color: 'bg-[#b43b3b]' },
            ].map((factor) => {
              const pct = Math.min(100, Math.round((factor.value / factor.max) * 100));
              return (
                <div key={factor.label}>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>{factor.label}</span>
                    <span className="font-mono font-medium tabular-nums">
                      {factor.value} / {factor.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#2a3441] h-2 rounded-full overflow-hidden">
                    <div className={`${factor.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#2b3442]">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Knowledge References</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-700 dark:text-slate-300">
              {incident.knowledge_refs.map((ref, idx) => (
                <span key={idx}>{ref}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Response Actions */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-[#2b3442]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Recommended Response Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every containment action requires analyst approval before execution.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#2b3442]">
          {incident.recommended_actions.map((act) => {
            const statusTextClass =
              act.status === 'approved' || act.status === 'executed'
                ? 'text-[#286b49] dark:text-[#72b893]'
                : act.status === 'rejected'
                ? 'text-[#b43b3b] dark:text-[#e08b8b]'
                : 'text-[#9a6318] dark:text-[#dfb06a]';

            return (
              <div key={act.action_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#2c5f7c] dark:text-[#8ab8d6]">{act.action_id}</span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                      {act.action_type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">Target: {act.target}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{act.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium capitalize ${statusTextClass}`}>
                    {act.status.replace('_', ' ')}
                  </span>

                  {act.status === 'pending_approval' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(act.action_id, 'approve')}
                        disabled={actionLoading === act.action_id}
                        className="bg-[#286b49] hover:bg-[#1f563a] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(act.action_id, 'reject')}
                        disabled={actionLoading === act.action_id}
                        className="bg-white hover:bg-[#fdf2f2] dark:bg-[#1c222b] dark:hover:bg-[#2e1e20] text-[#b43b3b] dark:text-[#e08b8b] border border-slate-200 dark:border-[#4c2e32] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analyst Verdict */}
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Analyst Verdict & Feedback Loop
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record your final verdict to calibrate risk scoring and generate proactive threat vaccines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleVerdict('confirmed_malicious')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
              incident.verdict === 'confirmed_malicious'
                ? 'bg-[#b43b3b] text-white border-[#b43b3b]'
                : 'bg-white dark:bg-[#232b36] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#323d4d] hover:bg-slate-50 dark:hover:bg-[#2a3442]'
            }`}
          >
            Confirmed Malicious
          </button>
          <button
            onClick={() => handleVerdict('false_positive')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
              incident.verdict === 'false_positive'
                ? 'bg-[#9a6318] text-white border-[#9a6318]'
                : 'bg-white dark:bg-[#232b36] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#323d4d] hover:bg-slate-50 dark:hover:bg-[#2a3442]'
            }`}
          >
            False Positive
          </button>
        </div>
      </div>
    </div>
  );
};
