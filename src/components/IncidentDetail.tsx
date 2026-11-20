/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incident, Claim } from '../types';
import { ArrowLeft, ShieldAlert, Cpu, CheckCircle2, XCircle, FileText, Sparkles, AlertTriangle, ShieldCheck, Target, Eye, EyeOff, Shield, Zap, Bug, Play } from 'lucide-react';
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
  const [shieldDemo, setShieldDemo] = useState<{
    active: boolean;
    injected: boolean;
    shieldResult: any;
    attack: any;
  } | null>(null);

  const handleRunAI = async () => {
    setLoadingAI(true);
    try {
      const updated = await investigateIncident(incident.incident_id);
      onUpdateIncident(updated);
    } catch (e: any) {
      alert(e.message || 'Investigation failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleInjectAttack = async () => {
    try {
      const res = await injectAttack(incident.incident_id, {});
      setShieldDemo({
        active: true,
        injected: true,
        attack: res.attack,
        shieldResult: null,
      });
    } catch (e: any) {
      alert(e.message || 'Injection attack failed');
    }
  };

  const handleRunShield = async () => {
    setShieldDemo(prev => ({
      active: true,
      injected: (prev?.injected ?? false),
      attack: (prev?.attack ?? null),
      shieldResult: null,
    }));
    try {
      const res = await investigateShield(incident.incident_id);
      setShieldDemo(prev => ({
        ...(prev || { active: true, injected: false, attack: null, shieldResult: null }),
        active: true,
        shieldResult: res.shield,
      }));
      // Refresh incident data from server
      const updated = await fetch(`/api/incidents/${incident.incident_id}`).then(r => r.json());
      onUpdateIncident(updated.incident || updated);
    } catch (e: any) {
      alert(e.message || 'Shield investigation failed');
    }
  };

  const handleAction = async (actionId: string, decision: 'approve' | 'reject') => {
    setActionLoading(actionId);
    try {
      await setActionDecision(actionId, decision);
      // update local state
      const updatedActions = incident.recommended_actions.map(a =>
        a.action_id === actionId ? { ...a, status: decision === 'approve' ? ('approved' as const) : ('rejected' as const) } : a
      );
      onUpdateIncident({ ...incident, recommended_actions: updatedActions });
    } catch (e: any) {
      alert(e.message || 'Action update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerdict = async (verdict: string) => {
    try {
      const updated = await submitVerdict(incident.incident_id, verdict);
      onUpdateIncident(updated);
    } catch (e: any) {
      alert(e.message || 'Verdict update failed');
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Back to Queue</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenCertInReport(incident.incident_id)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-cyan-400" /> CERT-In 6-Hour Report
          </button>
          <button
            onClick={handleRunAI}
            disabled={loadingAI}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {loadingAI ? 'Running AI Investigation...' : 'Re-Run Agentic Investigation'}
          </button>
        </div>
      </div>

      {/* Prompt Injection Warning Banner */}
      {incident.prompt_injection_warnings && incident.prompt_injection_warnings.length > 0 && (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-5 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-purple-300">Prompt-Injection Attack Guard Triggered</h4>
            {incident.prompt_injection_warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-purple-200 mt-1 font-mono">{warn}</p>
            ))}
            <p className="text-xs text-slate-400 mt-2">
              ThreatWeave AI successfully wrapped raw log payloads in untrusted delimiters and ignored malicious injected commands.
            </p>
          </div>
        </div>
      )}

      {/* ATTACK THE AI: Shield Demo */}
      {shieldDemo && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-white">Attack the AI — Injection Shield Demo</h3>
              <p className="text-sm text-slate-300 mt-1">
                Inject a malicious instruction into a log field, then run the shielded investigation to verify the
                prompt injection is quarantined and the verdict is unchanged.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!shieldDemo.injected && (
              <button
                onClick={handleInjectAttack}
                disabled={loadingAI}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Bug className="w-4 h-4" /> Inject Malicious Instruction
              </button>
            )}
            {shieldDemo.injected && !shieldDemo.shieldResult && (
              <button
                onClick={handleRunShield}
                disabled={loadingAI}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" /> Run Shielded Investigation
              </button>
            )}
            {shieldDemo.shieldResult && (
              <button
                onClick={() => setShieldDemo(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Reset Demo
              </button>
            )}
          </div>

          {/* Injection payload shown after attack */}
          {shieldDemo.injected && shieldDemo.attack && !shieldDemo.shieldResult && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-300">Malicious Instruction Injected</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Injected into event <span className="font-mono text-cyan-300">{shieldDemo.attack.event_id}</span>, field{' '}
                    <span className="font-mono text-cyan-300">{shieldDemo.attack.field}</span>
                  </p>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mt-2 font-mono text-xs text-rose-200">
                    {shieldDemo.attack.injected_value}
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Run the shielded investigation to see how ThreatWeave quarantines this injection before it
                    reaches the model.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shield result */}
          {shieldDemo.shieldResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl ${shieldDemo.shieldResult.injection_detected ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Injection Detected
                  </div>
                  <div className={`text-sm font-bold ${shieldDemo.shieldResult.injection_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {shieldDemo.shieldResult.injection_detected ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Events Quarantined
                  </div>
                  <div className="text-sm font-bold text-white">
                    {shieldDemo.shieldResult.shielded_events.filter((e: any) => e.quarantined).length}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${shieldDemo.shieldResult.verdict_unchanged ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-rose-500/20 border border-rose-500/30'}`}>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Verdict Unchanged
                  </div>
                  <div className={`text-sm font-bold ${shieldDemo.shieldResult.verdict_unchanged ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {shieldDemo.shieldResult.verdict_unchanged ? 'CONFIRMED' : 'CHANGED'}
                  </div>
                </div>
              </div>

              {/* Before/After verdict comparison */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start space-x-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Verdict Comparison</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The injection attempted to sway the model to "benign". The shield quarantined it, so the
                      verdict is unchanged.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-900/30 border border-rose-500/30 rounded-xl p-4">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">BEFORE (no shield)</div>
                    <div className="text-sm font-mono text-rose-300 mb-1">
                      {shieldDemo.shieldResult.verdict_before ?? '—'}
                    </div>
                    <p className="text-xs text-slate-400">
                      Injection would reach the model and attempt to override the verdict.
                    </p>
                  </div>
                  <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">AFTER (shielded)</div>
                    <div className="text-sm font-mono text-emerald-300 mb-1">
                      {shieldDemo.shieldResult.verdict_after ?? '—'}
                    </div>
                    <p className="text-xs text-slate-400">
                      Injection quarantined before the prompt; verdict unchanged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payload highlighted + quarantined */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start space-x-3 mb-4">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Payload Highlighted & Quarantined</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Each event is inspected; injected payloads are stripped before the model sees them.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {shieldDemo.shieldResult.shielded_events.map((ev: any) => (
                    <div key={ev.event_id} className={`p-3 rounded-lg border ${ev.injection_detected ? 'bg-rose-900/30 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-cyan-300">{ev.event_id}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${ev.injection_detected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                          {ev.injection_detected ? 'INJECTION' : 'CLEAN'}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${ev.quarantined ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-600 text-slate-400'}`}>
                          {ev.quarantined ? 'QUARANTINED' : 'PASSTHROUGH'}
                        </span>
                      </div>
                      {ev.payload_snippet && (
                        <div className="bg-slate-950 rounded p-2 font-mono text-xs text-rose-200 overflow-x-auto">
                          {ev.payload_snippet}
                        </div>
                      )}
                      {ev.injection_detected && ev.quarantined && (
                        <p className="text-xs text-emerald-400 mt-1">
                          ✓ Injected instruction stripped from prompt before model call.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit log entry */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start space-x-3 mb-4">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Shield Audit Log Entry</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Immutable record of the injection detection and quarantine action.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Audit ID:</span>
                    <span className="text-white">{shieldDemo.shieldResult.audit_entry.audit_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Incident:</span>
                    <span className="text-white">{shieldDemo.shieldResult.audit_entry.incident_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event:</span>
                    <span className="text-white">{shieldDemo.shieldResult.audit_entry.event_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Action:</span>
                    <span className="text-emerald-400">{shieldDemo.shieldResult.audit_entry.action}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verdict Before:</span>
                    <span className="text-rose-300">{shieldDemo.shieldResult.audit_entry.verdict_before ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verdict After:</span>
                    <span className="text-emerald-300">{shieldDemo.shieldResult.audit_entry.verdict_after ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shielded:</span>
                    <span className="text-emerald-400">{String(shieldDemo.shieldResult.audit_entry.shielded)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payload Snippet:</span>
                    <span className="text-cyan-300">{shieldDemo.shieldResult.audit_entry.payload_snippet}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
                {incident.incident_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                incident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {incident.severity}
              </span>
              <span className="text-xs text-slate-400 font-medium">Tenant: {incident.tenant_id}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{incident.title}</h1>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 px-5 py-3 rounded-xl">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Grounding Score</div>
              <div className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> {(incident.grounding_score * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Risk Score</div>
              <div className="text-lg font-mono font-bold text-rose-400">{incident.risk_score} / 100</div>
            </div>
          </div>
        </div>

        {/* Claims: structured investigation output with per-claim grounding */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-start space-x-3 mb-6">
            <Target className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-white">Investigation Claims & Grounding</h3>
              <p className="text-sm text-slate-300 mt-1">
                <strong>What am I looking at?</strong> Each sentence below is a structured claim from the
                agentic investigation. Every claim is validated against the evidence timeline:{" "}
                <span className="text-emerald-400 font-semibold">SUPPORTED</span> = verified (green),{" "}
                <span className="text-amber-400 font-semibold">INFERRED</span> = inference with evidence (amber),{" "}
                <span className="text-rose-400 font-semibold">STRIPPED</span> = fabricated/missing IDs removed from the story (red). Click a claim to highlight its events in the timeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Supported + Inferred claims (kept in story) */}
            <div className="lg:col-span-2 space-y-3">
              {incident.claims.map((claim) => {
                const validation = incident.claim_validations.find(v => v.claim_id === claim.claim_id);
                const isSelected = selectedClaimId === claim.claim_id;
                const statusCfg: Record<string, { bg: string; border: string; text: string }> = {
                  SUPPORTED: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                  INFERRED: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
                  STRIPPED: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
                };
                const cfg = statusCfg[validation?.status ?? 'STRIPPED'];
                const typeColor = claim.type === 'fact' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-purple-400 border-purple-500/30 bg-purple-500/10';
                const evidenceIds = claim.evidence_event_ids.join(', ') || '—';

                return (
                  <div
                    key={claim.claim_id}
                    onClick={() => setSelectedClaimId(isSelected ? null : claim.claim_id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${isSelected ? 'bg-slate-800/50 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${typeColor}`}>
                          {claim.type}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          {validation?.status ?? 'STRIPPED'}
                        </span>
                      </div>
                      {isSelected ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed mb-2">{claim.text}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-slate-400 font-mono">Evidence: {evidenceIds}</span>
                      {claim.knowledge_refs.length > 0 && (
                        <span className="text-slate-400 font-mono">Refs: {claim.knowledge_refs.join(', ')}</span>
                      )}
                      <span className={`text-xs font-medium ${cfg.text}`}>
                        {validation?.reason ?? 'Validated'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {incident.claims.length === 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No investigation claims yet. Run the agentic investigation to generate structured claims.
                </div>
              )}
            </div>

            {/* Rejected claims log */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-rose-900/30 border border-rose-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">Rejected Claims</h4>
                    <p className="text-xs text-rose-200 mt-0.5">
                      Stripped from the story — kept in the rejected log.
                    </p>
                  </div>
                </div>
                {incident.rejected_claims.length > 0 ? (
                  incident.rejected_claims.map((claim) => {
                    const validation = incident.claim_validations.find(v => v.claim_id === claim.claim_id);
                    return (
                      <div key={claim.claim_id} className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 mb-3 last:mb-0">
                        <p className="text-xs text-rose-200 mb-1 italic">"{claim.text}"</p>
                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                            STRIPPED
                          </span>
                          <span className="text-rose-300 font-mono">{claim.evidence_event_ids.join(', ') || '—'}</span>
                          <span className="text-slate-500">{validation?.reason ?? ''}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No rejected claims.</p>
                )}
              </div>

              {/* What would disprove this? */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" /> What would disprove this?
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  {incident.disproof_evidence.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-400 text-xs shrink-0 mt-0.5">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {incident.disproof_evidence.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No disproof evidence recorded.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Verifiable Evidence Timeline</span>
            <span className="text-xs bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 font-mono">
              {incident.evidence_event_ids.length} Event IDs Linked
            </span>
          </h3>

          <div className="space-y-4 relative pl-4 border-l-2 border-cyan-500/30">
            {incident.timeline.map((item, idx) => {
              const selectedClaim = incident.claims.find(c => c.claim_id === selectedClaimId);
              const isHighlighted = selectedClaim && selectedClaim.evidence_event_ids.includes(item.event_id);
              return (
                <div key={idx} className={`relative pl-6 transition-all ${isHighlighted ? 'bg-cyan-500/10 border-l-4 border-cyan-400 rounded-r-lg pl-2' : ''}`}>
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-cyan-950">
                    {isHighlighted ? (
                      <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className={`font-mono px-2 py-0.5 rounded border ${isHighlighted ? 'bg-cyan-900 text-cyan-300 border-cyan-400' : 'bg-slate-950 text-cyan-300 border-slate-800'}`}>
                      {item.event_id}
                    </span>
                    <span>{new Date(item.time).toLocaleTimeString()}</span>
                  </div>
                  <p className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-slate-200'}`}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Breakdown & SHAP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Risk Score & SHAP Factor Breakdown</h3>
          <p className="text-xs text-slate-400">Transparent factor contribution computed by ML Isolation Forest & XGBoost.</p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Severity Weight</span>
                <span className="font-mono font-bold text-cyan-400">25 / 25</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Intel Reputation (AbuseIPDB / URLhaus)</span>
                <span className="font-mono font-bold text-amber-400">20 / 20</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Kill-Chain Stage Progression</span>
                <span className="font-mono font-bold text-purple-400">15 / 15</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>ML Anomaly Score (Isolation Forest)</span>
                <span className="font-mono font-bold text-rose-400">14 / 15</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[93%]"></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge References</h4>
            <div className="flex flex-wrap gap-2">
              {incident.knowledge_refs.map((ref, idx) => (
                <span key={idx} className="bg-slate-950 text-slate-300 font-mono text-xs px-3 py-1 rounded-lg border border-slate-800">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Response Actions Approval Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white">Recommended Response Actions (Human-in-the-Loop)</h3>
          <p className="text-xs text-slate-400">Every response action requires formal SOC analyst approval before execution.</p>
        </div>

        <div className="space-y-4">
          {incident.recommended_actions.map((act) => (
            <div key={act.action_id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {act.action_id}
                  </span>
                  <span className="font-bold text-white text-sm uppercase">{act.action_type.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-400 font-mono">Target: {act.target}</span>
                </div>
                <p className="text-xs text-slate-300">{act.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  act.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  act.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {act.status.replace('_', ' ')}
                </span>

                {act.status === 'pending_approval' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(act.action_id, 'approve')}
                      disabled={actionLoading === act.action_id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(act.action_id, 'reject')}
                      disabled={actionLoading === act.action_id}
                      className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verdict & Feedback Loop */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Analyst Verdict & Feedback Loop</h3>
          <p className="text-xs text-slate-400 mt-1">Submit final verdict to adjust ML risk weights and feed incident into the RAG knowledge layer.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleVerdict('confirmed_malicious')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              incident.verdict === 'confirmed_malicious'
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Confirmed Malicious
          </button>
          <button
            onClick={() => handleVerdict('false_positive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              incident.verdict === 'false_positive'
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            False Positive
          </button>
        </div>
      </div>
    </div>
  );
};
