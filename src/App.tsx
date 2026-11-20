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
import { FileText } from 'lucide-react';
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('threatweave-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('threatweave-theme', theme);
  }, [theme]);

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
    <div className="flex h-screen bg-[#f6f8fa] dark:bg-[#141920] text-slate-800 dark:text-[#e6ecf2] font-sans overflow-hidden transition-colors duration-200">
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
          theme={theme}
          onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        />

        <main className="flex-1 overflow-y-auto bg-[#f6f8fa] dark:bg-[#141920]">
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
              theme={theme}
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
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  CERT-In Statutory Reports
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Select an incident to review, print, or export the 6-hour statutory compliance report.
                </p>
              </div>
              {incidents.length === 0 ? (
                <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No active incidents available for reporting. Load scenarios from Ingestion to begin.
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl divide-y divide-slate-200 dark:divide-[#2b3442]">
                  {incidents.map(inc => (
                    <div
                      key={inc.incident_id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#232b36] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          <span className="font-semibold text-[#2c5f7c] dark:text-[#7db0d1]">{inc.incident_id}</span>
                          <span aria-hidden="true">·</span>
                          <span>Risk {inc.risk_score}/100</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize font-sans">{inc.severity}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {inc.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => setCertInIncidentId(inc.incident_id)}
                        className="bg-[#2c5f7c] hover:bg-[#234d65] text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" /> View Report
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
