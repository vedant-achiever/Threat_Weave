/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CanonicalEvent {
  event_id: string;
  tenant_id: string;
  timestamp: string;
  source_type: 'firewall' | 'endpoint' | 'auth' | 'email' | 'ids' | 'siem';
  host: string;
  user: string;
  src_ip: string;
  dst_ip: string;
  dst_port: number;
  process: string;
  action: string;
  outcome: string;
  url?: string;
  raw: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prompt_injection_flag?: boolean;
}

export interface Alert {
  alert_id: string;
  tenant_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rule_id: string;
  event_ids: string[];
  timestamp: string;
  mitre_tactic: string;
  mitre_technique: string;
  ml_anomaly_score: number;
  shap_explanation: { feature: string; impact: number }[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
}

export interface Claim {
  claim_id: string;
  text: string;
  type: 'fact' | 'inference';
  evidence_event_ids: string[];
  knowledge_refs: string[];
}

export interface ClaimValidation {
  claim_id: string;
  status: 'SUPPORTED' | 'INFERRED' | 'STRIPPED';
  reason: string;
}

export interface Incident {
  incident_id: string;
  tenant_id: string;
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'action_pending' | 'resolved';
  risk_score: number;
  risk_breakdown: {
    severity_weight: number;
    intel_reputation: number;
    kill_chain_stage: number;
    asset_criticality: number;
    ml_score: number;
    correlation_count: number;
  };
  timeline: { time: string; event_id: string; description: string; source: string }[];
  root_cause: string;
  lateral_movement: string;
  attack_techniques: string[];
  evidence_event_ids: string[];
  knowledge_refs: string[];
  recommended_actions: {
    action_id: string;
    action_type: string;
    target: string;
    description: string;
    status: 'pending_approval' | 'approved' | 'rejected' | 'executed';
  }[];
  claims: Claim[];
  rejected_claims: Claim[];
  claim_validations: ClaimValidation[];
  disproof_evidence: string[];
  grounding_score: number;
  prompt_injection_warnings: string[];
  verdict?: 'confirmed_malicious' | 'false_positive' | 'benign_activity';
  created_at: string;
}

export interface Tenant {
  tenant_id: string;
  name: string;
  industry: string;
  tier: 'SME' | 'MSSP Enterprise';
  endpoints_count: number;
  active_alerts: number;
}
