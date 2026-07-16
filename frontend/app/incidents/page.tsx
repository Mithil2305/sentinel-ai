'use client';

import React, { useState } from 'react';
import { useApp } from '@/store/app-context';
import { Incident } from '@/types';
import { 
  ShieldAlert, Search, Filter, X, ShieldCheck, 
  HardDrive, Info, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { ActionButton } from '@/components/ui/action-button';
import { StatusChip } from '@/components/ui/status-chip';
import { DataTable } from '@/components/ui/data-table';
import { AIInsightCard } from '@/components/ui/ai-insight-card';

export default function IncidentsPage() {
  const { 
    incidents, 
    servers, 
    resolveIncident, 
    approveApproval,
    rejectApproval,
    approvals 
  } = useApp();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serverFilter, setServerFilter] = useState<string>('all');

  // Filter logic
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.threatName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.mitreTechnique.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesServer = serverFilter === 'all' || inc.server === serverFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesServer;
  });

  const handleRowClick = (inc: Incident) => {
    setSelectedIncident(inc);
  };

  // Find linked approval if any
  const getLinkedApproval = (serverName: string) => {
    return approvals.find(app => app.server === serverName || servers.find(s => s.hostname === serverName)?.id === app.server);
  };

  // Table Columns Setup
  const columns = [
    { 
      header: 'ID', 
      accessor: (inc: Incident) => (
        <span className="font-mono font-bold text-primary">{inc.id}</span>
      ) 
    },
    { 
      header: 'Threat Name', 
      accessor: (inc: Incident) => (
        <span className="font-bold text-text group-hover:text-primary transition-colors text-small-text">
          {inc.threatName}
        </span>
      ) 
    },
    { 
      header: 'Server', 
      accessor: (inc: Incident) => (
        <span className="font-semibold text-muted">{inc.server}</span>
      ) 
    },
    { 
      header: 'Severity', 
      accessor: (inc: Incident) => (
        <StatusChip status={inc.severity} />
      ) 
    },
    { 
      header: 'Status', 
      accessor: (inc: Incident) => (
        <StatusChip status={inc.status === 'investigating' ? 'investigating' : inc.status === 'resolved' ? 'resolved' : 'critical'} />
      ) 
    },
    { 
      header: 'MITRE Technique', 
      accessor: (inc: Incident) => (
        <span className="font-mono text-muted text-caption">{inc.mitreTechnique}</span>
      ) 
    },
    { 
      header: 'Created At', 
      accessor: (inc: Incident) => (
        <span className="font-mono text-muted text-caption">{inc.createdAt}</span>
      ) 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 relative min-h-[85vh]">
      
      {/* Page Header */}
      <PageHeader 
        title="SOC Incident Queue" 
        description="Investigate, track, and remediate anomalous activity across network infrastructure."
        icon={ShieldAlert}
      />

      {/* FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/45 p-5 rounded-card border border-border mb-8">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search threats..."
            className="w-full h-10 bg-background border border-border rounded-input pl-10 pr-3 py-2 text-small-text text-text placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-input px-3.5 h-10">
          <Filter className="h-4 w-4 text-muted" />
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-small-text text-text focus:outline-none w-full cursor-pointer font-bold"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-input px-3.5 h-10">
          <Filter className="h-4 w-4 text-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-small-text text-text focus:outline-none w-full cursor-pointer font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Server filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-input px-3.5 h-10">
          <HardDrive className="h-4 w-4 text-muted" />
          <select 
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className="bg-transparent text-small-text text-text focus:outline-none w-full cursor-pointer font-bold"
          >
            <option value="all">All Servers</option>
            {servers.map(s => (
              <option key={s.id} value={s.hostname}>{s.hostname}</option>
            ))}
          </select>
        </div>

      </div>

      {/* TABLE AND DRAWER OVERLAY */}
      <div className="relative w-full">
        
        {/* Incident Table Column */}
        <DataTable 
          data={filteredIncidents} 
          columns={columns} 
          onRowClick={handleRowClick}
          emptyMessage="No incidents matched the filters. System clean."
          rowClassName={(inc) => selectedIncident?.id === inc.id ? 'bg-primary/10 border-l-4 border-l-primary font-bold' : ''}
        />

        {/* Sliding Side Drawer (Overlay layout) */}
        <AnimatePresence>
          {selectedIncident && (
            <>
              {/* Translucent Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedIncident(null)}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 cursor-pointer"
              />
              
              {/* Drawer Container */}
              <motion.div 
                initial={{ x: '100%', opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.9 }}
                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                className="fixed top-0 right-0 h-full w-full max-w-xl border-l border-border bg-card/95 backdrop-blur-2xl p-8 shadow-2xl overflow-y-auto z-50 flex flex-col justify-between space-y-6"
              >
                
                {/* Drawer Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-5 mb-5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-subsection text-primary">{selectedIncident.id}</span>
                      <StatusChip status={selectedIncident.severity} />
                    </div>
                    <button 
                      onClick={() => setSelectedIncident(null)}
                      className="p-2 rounded-input hover:bg-border text-muted hover:text-text transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Threat Title & Server */}
                  <div className="mb-6 space-y-1.5">
                    <h2 className="text-subsection font-bold text-text leading-snug">{selectedIncident.threatName}</h2>
                    <div className="flex items-center gap-2 text-caption text-muted font-normal">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span>Host Platform Node: <strong className="text-text font-bold">{selectedIncident.server}</strong></span>
                    </div>
                  </div>

                  {/* AI Explanation Summary Card */}
                  <AIInsightCard title="AI Copilot Incident Analysis" badgeText="Real-time Context" className="mb-6">
                    {selectedIncident.explanation}
                  </AIInsightCard>

                  {/* Overview Details tabs */}
                  <div className="space-y-5 text-caption border-b border-border/40 pb-6 mb-6">
                    <div>
                      <span className="font-bold text-text uppercase text-caption tracking-wider text-muted block mb-1">Root Cause Analysis</span>
                      <p className="text-muted leading-relaxed font-normal">{selectedIncident.rootCause}</p>
                    </div>
                    
                    <div>
                      <span className="font-bold text-text uppercase text-caption tracking-wider text-muted block mb-2">MITRE Technique Mapping</span>
                      <code className="bg-background border border-border px-2.5 py-1 rounded-input text-text font-mono text-caption font-bold">
                        {selectedIncident.mitreTechnique}
                      </code>
                    </div>

                    <div>
                      <span className="font-bold text-text uppercase text-caption tracking-wider text-muted block mb-2">Affected Subnet Assets</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.affectedAssets.map((asset, i) => (
                          <span key={i} className="px-3 py-1 rounded-badge border border-border bg-background text-muted text-caption font-bold">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-text uppercase text-caption tracking-wider text-muted block mb-1">Recommended Remediation Action</span>
                      <p className="text-muted leading-relaxed font-bold text-primary">{selectedIncident.recommendedFix}</p>
                    </div>
                  </div>

                  {/* Timeline History */}
                  <div className="mb-6">
                    <span className="font-bold text-text uppercase text-[12px] tracking-wider text-muted block mb-3">Audited Incident Timeline</span>
                    <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-border">
                      {selectedIncident.history.map((h, i) => (
                        <div key={i} className="relative text-caption leading-relaxed font-normal">
                          <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-badge bg-border border-2 border-card" />
                          <div className="flex justify-between text-muted">
                            <span className="font-bold text-text">{h.user}</span>
                            <span className="text-[10px]">{h.time}</span>
                          </div>
                          <p className="text-muted/85 mt-0.5">{h.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="border-t border-border pt-5 mt-6 flex flex-col gap-3">
                  {selectedIncident.status !== 'resolved' ? (
                    <>
                      {getLinkedApproval(selectedIncident.server) ? (
                        <div className="flex gap-3">
                          <ActionButton
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                              const app = getLinkedApproval(selectedIncident.server);
                              if (app) {
                                approveApproval(app.id);
                                setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
                              }
                            }}
                          >
                            Approve AI Remediation
                          </ActionButton>
                          <ActionButton
                            variant="outline"
                            onClick={() => {
                              const app = getLinkedApproval(selectedIncident.server);
                              if (app) {
                                rejectApproval(app.id);
                              }
                            }}
                          >
                            Reject
                          </ActionButton>
                        </div>
                      ) : (
                        <ActionButton
                          variant="primary"
                          className="w-full"
                          onClick={() => {
                            resolveIncident(selectedIncident.id);
                            setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
                          }}
                        >
                          Mark Resolve Manually
                        </ActionButton>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-card border border-success/30 bg-success/5 text-success text-caption font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>Remediated & Closed</span>
                    </div>
                  )}
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
