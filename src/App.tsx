/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { IngestionUpload } from './components/IngestionUpload';
import { IncidentQueue } from './components/IncidentQueue';
import { IncidentDetail } from './components/IncidentDetail';
import { ApprovalsQueue } from './components/ApprovalsQueue';
import { MsspOverview } from './components/MsspOverview';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ProactiveVaccines } from './components/ProactiveVaccines';
import { CertInReportModal } from './components/CertInReportModal';
import { fetchIncidents, fetchAlerts, fetchEvents, fetchHealth } from './api/client';
import { Incident, Alert, CanonicalEvent, Tenant } from './types';
import { ShieldAlert, FileText } from 'lucide-react';
import { Privacy } from './components/Privacy';
import { Insights } from './components/Insights';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [certInIncidentId, setCertInIncidentId] = useState<string | null>(null);
  const [mockLlm, setMockLlm] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tenants: Tenant[] = [
    { tenant_id: 'tenant-sme-mumbai-01', name: 'Mumbai FinTech SME', industry: 'Financial Services', tier: 'SME', endpoints_count: 250, active_alerts: 2 },
    { tenant_id: 'tenant-mssp-client-02', name: 'Logistics India Corp', industry: 'Supply Chain', tier: 'MSSP Enterprise', endpoints_count: 1200, active_alerts: 1 }
  ];

  const loadData = async () => {
    try {
      const [hRes, incData, altData, evData] = await Promise.all([
        fetchHealth(),
        fetchIncidents(selectedTenant),
        fetchAlerts(selectedTenant),
        fetchEvents(selectedTenant)
      ]);
      setMockLlm(hRes.mock_llm);
      setIncidents(incData);
      setAlerts(altData);
      setEvents(evData);
    } catch (e) {
      console.error('Failed to load SOC state:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenant]);

  const pendingApprovalsCount = incidents.reduce(
    (acc, i) => acc + i.recommended_actions.filter(a => a.status === 'pending_approval').length,
    0
  );



  const activeIncident = incidents.find(i => i.incident_id === selectedIncidentId);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedIncidentId(null);
          setActiveTab(tab);
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          tenants={tenants}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          mockLlm={mockLlm}
          onRefresh={loadData}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {selectedIncidentId && activeIncident ? (
            <IncidentDetail
              incident={activeIncident}
              onBack={() => setSelectedIncidentId(null)}
              onUpdateIncident={(updated) => {
                setIncidents(incidents.map(i => i.incident_id === updated.incident_id ? updated : i));
              }}
              onOpenCertInReport={(id) => setCertInIncidentId(id)}
            />
          ) : activeTab === 'overview' ? (
            <DashboardOverview
              incidents={incidents}
              alerts={alerts}
              events={events}
              onSelectIncident={(id) => setSelectedIncidentId(id)}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'ingestion' ? (
            <IngestionUpload onRefresh={loadData} />
          ) : activeTab === 'incidents' ? (
            <IncidentQueue
              incidents={incidents}
              onSelectIncident={(id) => setSelectedIncidentId(id)}
            />
          ) : activeTab === 'approvals' ? (
            <ApprovalsQueue
              incidents={incidents}
              onRefresh={loadData}
            />
          ) : activeTab === 'mssp' ? (
            <MsspOverview
              tenants={tenants}
              incidents={incidents}
              onSelectTenant={(tId) => {
                setSelectedTenant(tId);
                setActiveTab('overview');
              }}
            />
          ) : activeTab === 'vaccines' ? (
            <ProactiveVaccines />
          ) : activeTab === 'knowledge' ? (
            <KnowledgeBase />
          ) : activeTab === 'privacy' ? (
            <Privacy />
          ) : activeTab === 'insights' ? (
            <Insights />
          ) : activeTab === 'reports' ? (
            <div className="p-8 space-y-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-white tracking-tight">CERT-In Statutory Reports</h2>
              <p className="text-sm text-slate-400">Select any active incident to generate the 6-hour statutory compliance report.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidents.map(inc => (
                  <div key={inc.incident_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-cyan-400 font-bold">{inc.incident_id}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{inc.title}</h4>
                      <span className="text-xs text-slate-400">Risk Score: {inc.risk_score}/100</span>
                    </div>
                    <button
                      onClick={() => setCertInIncidentId(inc.incident_id)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
                    >
                      <FileText className="w-4 h-4" /> View Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {certInIncidentId && (
        <CertInReportModal
          incidentId={certInIncidentId}
          onClose={() => setCertInIncidentId(null)}
        />
      )}
    </div>
  );
}
