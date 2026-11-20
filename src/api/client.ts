/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalEvent, Alert, Incident } from '../types';

export interface InjectionAttack {
  attack_id: string;
  incident_id: string;
  event_id: string;
  field: string;
  original_value: string;
  injected_value: string;
  injected_at: string;
}

export interface ShieldEventResult {
  event_id: string;
  injection_detected: boolean;
  quarantined: boolean;
  payload_snippet: string | null;
}

export interface ShieldResult {
  injection_detected: boolean;
  shielded_events: ShieldEventResult[];
  verdict_before: string | null;
  verdict_after: string | null;
  verdict_unchanged: boolean;
  audit_entry: any;
}

export interface InvestigateShieldResponse {
  status: string;
  incident: Incident;
  shield: ShieldResult;
}

export interface InjectAttackResponse {
  status: string;
  message: string;
  attack: InjectionAttack;
}

export async function fetchHealth(): Promise<{ status: string; mock_llm: boolean }> {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchEvents(tenantId?: string): Promise<CanonicalEvent[]> {
  const url = tenantId ? `/api/events?tenant_id=${tenantId}` : '/api/events';
  const res = await fetch(url);
  return res.json();
}

export async function fetchAlerts(tenantId?: string): Promise<Alert[]> {
  const url = tenantId ? `/api/alerts?tenant_id=${tenantId}` : '/api/alerts';
  const res = await fetch(url);
  return res.json();
}

export async function fetchIncidents(tenantId?: string): Promise<Incident[]> {
  const url = tenantId ? `/api/incidents?tenant_id=${tenantId}` : '/api/incidents';
  const res = await fetch(url);
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string): Promise<Incident> {
  const res = await fetch(`/api/incidents/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch incident detail');
  return res.json();
}

export async function investigateIncident(incidentId: string): Promise<Incident> {
  const res = await fetch(`/api/incidents/${incidentId}/investigate`, { method: 'POST' });
  const data = await res.json();
  return data.incident;
}

export async function setActionDecision(actionId: string, decision: 'approve' | 'reject'): Promise<void> {
  await fetch(`/api/actions/${actionId}/${decision}`, { method: 'POST' });
}

export async function submitVerdict(incidentId: string, verdict: string): Promise<Incident> {
  const res = await fetch(`/api/incidents/${incidentId}/verdict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verdict })
  });
  const data = await res.json();
  return data.incident;
}

export async function seedSyntheticData(): Promise<void> {
  await fetch('/api/seed', { method: 'POST' });
}

export async function ingestEvents(tenantId: string, events: any[]): Promise<any> {
  const res = await fetch('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_id: tenantId, events })
  });
  return res.json();
}

export async function reindexKnowledge(): Promise<any> {
  const res = await fetch('/api/knowledge/reindex', { method: 'POST' });
  return res.json();
}

export async function injectAttack(incidentId: string, body: { event_id?: string; field?: string }): Promise<InjectAttackResponse> {
  const res = await fetch(`/api/incidents/${incidentId}/inject-attack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function investigateShield(incidentId: string): Promise<InvestigateShieldResponse> {
  const res = await fetch(`/api/incidents/${incidentId}/investigate-shield`, { method: 'POST' });
  return res.json();
}
