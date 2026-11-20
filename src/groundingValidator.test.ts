/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vitest tests for the ThreatWeave AI grounding validator.
 * Tests the structured claim validation and grounding score computation.
 */

import { describe, it, expect } from 'vitest';
import { validateClaim, computeGroundingScore } from './groundingValidator';
import { Claim, ClaimValidation, Incident, CanonicalEvent } from './types';

function makeEvent(overrides: Partial<CanonicalEvent> = {}): CanonicalEvent {
  return {
    event_id: 'EVT-001',
    tenant_id: 'tenant-1',
    timestamp: '2026-01-01T00:00:00Z',
    source_type: 'auth',
    host: 'host-1',
    user: 'user-1',
    src_ip: '10.0.0.1',
    dst_ip: '10.0.0.2',
    dst_port: 22,
    process: 'sshd',
    action: 'login',
    outcome: 'success',
    raw: {},
    severity: 'high',
    ...overrides,
  } as CanonicalEvent;
}

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    incident_id: 'INC-1',
    tenant_id: 'tenant-1',
    title: 'Test Incident',
    summary: '',
    severity: 'high',
    status: 'investigating',
    risk_score: 50,
    risk_breakdown: {
      severity_weight: 10,
      intel_reputation: 10,
      kill_chain_stage: 10,
      asset_criticality: 10,
      ml_score: 10,
      correlation_count: 10,
    },
    timeline: [],
    root_cause: '',
    lateral_movement: '',
    attack_techniques: [],
    evidence_event_ids: ['EVT-001', 'EVT-002'],
    knowledge_refs: [],
    recommended_actions: [],
    claims: [],
    rejected_claims: [],
    claim_validations: [],
    disproof_evidence: [],
    grounding_score: 0,
    prompt_injection_warnings: [],
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claim_id: 'CLM-1',
    text: 'Test claim',
    type: 'fact',
    evidence_event_ids: ['EVT-001'],
    knowledge_refs: [],
    ...overrides,
  };
}

const allEvents: CanonicalEvent[] = [
  makeEvent({ event_id: 'EVT-001' }),
  makeEvent({ event_id: 'EVT-002' }),
];

describe('validateClaim', () => {
  it('returns SUPPORTED for a fact claim whose IDs all exist and belong to the incident', () => {
    const claim = makeClaim({ type: 'fact', evidence_event_ids: ['EVT-001', 'EVT-002'] });
    const incident = makeIncident();
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('SUPPORTED');
    expect(result.claim_id).toBe('CLM-1');
    expect(result.reason).toContain('All evidence IDs exist and belong');
  });

  it('returns INFERRED for an inference claim with at least one valid belonging ID', () => {
    const claim = makeClaim({ type: 'inference', evidence_event_ids: ['EVT-001'] });
    const incident = makeIncident();
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('INFERRED');
    expect(result.reason).toContain('at least one valid evidence ID');
  });

  it('returns INFERRED for an inference claim where only one of several IDs belongs', () => {
    const incident = makeIncident({ evidence_event_ids: ['EVT-001'] });
    const claim = makeClaim({
      type: 'inference',
      evidence_event_ids: ['EVT-001', 'EVT-002'],
    });
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('INFERRED');
  });

  it('returns STRIPPED for a claim with a fabricated/missing event ID', () => {
    const claim = makeClaim({
      type: 'fact',
      evidence_event_ids: ['EVT-001', 'EVT-99999'],
    });
    const incident = makeIncident();
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('STRIPPED');
    expect(result.reason).toContain('EVT-99999');
    expect(result.reason).toContain('Fabricated or missing');
  });

  it('returns STRIPPED for a fact claim whose IDs exist but do not all belong to the incident', () => {
    const incident = makeIncident({ evidence_event_ids: ['EVT-001'] });
    const claim = makeClaim({ type: 'fact', evidence_event_ids: ['EVT-002'] });
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('STRIPPED');
    expect(result.reason).toContain('does not all belong');
  });

  it('returns STRIPPED for an inference claim with no valid belonging IDs', () => {
    const incident = makeIncident({ evidence_event_ids: ['EVT-001'] });
    const claim = makeClaim({
      type: 'inference',
      evidence_event_ids: ['EVT-99999'],
    });
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('STRIPPED');
  });

  it('returns STRIPPED for a claim with empty evidence IDs', () => {
    const claim = makeClaim({ type: 'fact', evidence_event_ids: [] });
    const incident = makeIncident();
    const result = validateClaim(claim, incident, allEvents);
    expect(result.status).toBe('STRIPPED');
  });
});

describe('computeGroundingScore', () => {
  it('returns supported / total when there are supported claims', () => {
    const validations: ClaimValidation[] = [
      { claim_id: 'CLM-1', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-2', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-3', status: 'INFERRED', reason: 'ok' },
      { claim_id: 'CLM-4', status: 'STRIPPED', reason: 'bad' },
    ];
    expect(computeGroundingScore(validations)).toBe(0.5); // 2 supported / 4 total
  });

  it('returns 1.0 when all claims are supported', () => {
    const validations: ClaimValidation[] = [
      { claim_id: 'CLM-1', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-2', status: 'SUPPORTED', reason: 'ok' },
    ];
    expect(computeGroundingScore(validations)).toBe(1);
  });

  it('returns 0 when no claims are supported', () => {
    const validations: ClaimValidation[] = [
      { claim_id: 'CLM-1', status: 'INFERRED', reason: 'ok' },
      { claim_id: 'CLM-2', status: 'STRIPPED', reason: 'bad' },
    ];
    expect(computeGroundingScore(validations)).toBe(0);
  });

  it('returns 0 for an empty validation list', () => {
    expect(computeGroundingScore([])).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const validations: ClaimValidation[] = [
      { claim_id: 'CLM-1', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-2', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-3', status: 'SUPPORTED', reason: 'ok' },
      { claim_id: 'CLM-4', status: 'STRIPPED', reason: 'bad' },
      { claim_id: 'CLM-5', status: 'STRIPPED', reason: 'bad' },
      { claim_id: 'CLM-6', status: 'STRIPPED', reason: 'bad' },
      { claim_id: 'CLM-7', status: 'STRIPPED', reason: 'bad' },
    ];
    // 3 / 7 = 0.428571... -> 0.43
    expect(computeGroundingScore(validations)).toBe(0.43);
  });
});

describe('integrated validation flow', () => {
  it('validates INC-7049 style claims: 2 SUPPORTED, 2 INFERRED, 1 STRIPPED => grounding 0.4', () => {
    const incident = makeIncident({
      incident_id: 'INC-7049',
      evidence_event_ids: ['EVT-00101', 'EVT-00102'],
    });
    const events = [
      makeEvent({ event_id: 'EVT-00101' }),
      makeEvent({ event_id: 'EVT-00102' }),
    ];

    const claims: Claim[] = [
      { claim_id: 'CLM-1', text: '50 failed logins', type: 'fact', evidence_event_ids: ['EVT-00101'], knowledge_refs: [] },
      { claim_id: 'CLM-2', text: 'successful root login', type: 'fact', evidence_event_ids: ['EVT-00102'], knowledge_refs: [] },
      { claim_id: 'CLM-3', text: 'SSH tunnel lateral movement', type: 'inference', evidence_event_ids: ['EVT-00102'], knowledge_refs: ['ATT&CK-TA0001'] },
      { claim_id: 'CLM-4', text: 'weak root password', type: 'inference', evidence_event_ids: ['EVT-00101', 'EVT-00102'], knowledge_refs: ['PLAYBOOK-BRUTE-FORCE-01'] },
      { claim_id: 'CLM-5', text: 'exfiltrated 5GB', type: 'fact', evidence_event_ids: ['EVT-99999'], knowledge_refs: [] },
    ];

    const validations = claims.map((c) => validateClaim(c, incident, events));
    const statuses = validations.map((v) => v.status);
    expect(statuses).toEqual([
      'SUPPORTED',
      'SUPPORTED',
      'INFERRED',
      'INFERRED',
      'STRIPPED',
    ]);

    const kept = claims.filter((_, i) => validations[i].status !== 'STRIPPED');
    expect(kept).toHaveLength(4);

    const score = computeGroundingScore(validations);
    expect(score).toBe(0.4); // 2 supported / 5 total
  });
});
