/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Grounding validator for ThreatWeave AI structured claims.
 *
 * Every claim produced by the investigation agent is validated against the
 * canonical event store:
 *   SUPPORTED  - all cited event IDs exist and belong to the incident
 *   INFERRED   - labelled inference with at least one valid evidence ID
 *   STRIPPED   - fabricated/missing IDs; removed from the story, logged in rejected claims
 *
 * Grounding score = supported claims / total claims.
 */

import { Claim, ClaimValidation, CanonicalEvent, Incident } from './types';

export function validateClaim(
  claim: Claim,
  incident: Incident,
  allEvents: CanonicalEvent[]
): ClaimValidation {
  const eventIdSet = new Set(allEvents.map((e) => e.event_id));
  const incidentEvidenceSet = new Set(incident.evidence_event_ids);

  // STRIPPED: no evidence cited at all
  if (claim.evidence_event_ids.length === 0) {
    return {
      claim_id: claim.claim_id,
      status: 'STRIPPED',
      reason: 'No evidence event IDs cited',
    };
  }

  // STRIPPED: any fabricated or missing event ID
  const missingIds = claim.evidence_event_ids.filter((id) => !eventIdSet.has(id));
  if (missingIds.length > 0) {
    return {
      claim_id: claim.claim_id,
      status: 'STRIPPED',
      reason: `Fabricated or missing event IDs: ${missingIds.join(', ')}`,
    };
  }

  // All cited IDs exist. Check belonging to this incident.
  const belongingIds = claim.evidence_event_ids.filter((id) => incidentEvidenceSet.has(id));

  if (claim.type === 'fact') {
    if (belongingIds.length === claim.evidence_event_ids.length) {
      return {
        claim_id: claim.claim_id,
        status: 'SUPPORTED',
        reason: 'All evidence IDs exist and belong to this incident',
      };
    }
    return {
      claim_id: claim.claim_id,
      status: 'STRIPPED',
      reason: 'Fact claim evidence does not all belong to this incident',
    };
  }

  // inference: at least one valid belonging ID
  if (belongingIds.length >= 1) {
    return {
      claim_id: claim.claim_id,
      status: 'INFERRED',
      reason: 'Inference with at least one valid evidence ID belonging to incident',
    };
  }
  return {
    claim_id: claim.claim_id,
    status: 'STRIPPED',
    reason: 'Inference with no valid evidence IDs belonging to incident',
  };
}

export function computeGroundingScore(validations: ClaimValidation[]): number {
  if (validations.length === 0) return 0;
  const supported = validations.filter((v) => v.status === 'SUPPORTED').length;
  return Number((supported / validations.length).toFixed(2));
}
