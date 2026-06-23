'use client';

import React, { useState } from 'react';
import { useApp } from '@/store/app-context';
import { Incident, Severity, IncidentStatus } from '@/types';
import { 
  ShieldAlert, Search, Filter, Calendar, X, ShieldCheck, 
  ArrowUpRight, AlertOctagon, HelpCircle, HardDrive, Info, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="max-w-7xl mx-auto pb-12 relative min-h-[85vh]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span>SOC Incident Queue</span>
          </h1>
          <p className="text-xs text-muted mt-1">Investigate, track, and remediate anomalous activity across network infrastructure.</p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card/45 p-4 rounded-xl border border-border mb-6">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, threat name, technique..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-muted" />
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-xs text-text focus:outline-none w-full cursor-pointer font-medium"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-text focus:outline-none w-full cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Server filter */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <HardDrive className="h-3.5 w-3.5 text-muted" />
          <select 
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className="bg-transparent text-xs text-text focus:outline-none w-full cursor-pointer font-medium"
          >
            <option value="all">All Servers</option>
            {servers.map(s => (
              <option key={s.id} value={s.hostname}>{s.hostname}</option>
            ))}
          </select>
        </div>

      </div>

      {/* TABLE AND DRAWER SPLIT LAYOUT */}
      <div className="flex items-start gap-6 relative">
        
        {/* Incident Table Column */}
        <div className={`transition-all duration-300 ${selectedIncident ? 'w-[58%]' : 'w-full'}`}>
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/20 text-muted font-bold text-[10px] uppercase">
                    <th className="p-3">ID</th>
                    <th className="p-3">Threat Name</th>
                    <th className="p-3">Server</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">MITRE Technique</th>
                    <th className="p-3">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    return (
                      <tr 
                        key={inc.id}
                        onClick={() => handleRowClick(inc)}
                        className={`border-b border-border/40 hover:bg-border/20 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-primary text-[10px]">{inc.id}</td>
                        <td className="p-3 font-semibold text-text max-w-[200px] truncate">{inc.threatName}</td>
                        <td className="p-3 text-muted">{inc.server}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            inc.severity === 'critical' 
                              ? 'bg-critical/15 text-critical border-critical/30' 
                              : inc.severity === 'high'
                                ? 'bg-warning/15 text-warning border-warning/30'
                                : 'bg-primary/15 text-primary border-primary/30'
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              inc.status === 'resolved' 
                                ? 'bg-success' 
                                : inc.status === 'investigating'
                                  ? 'bg-warning'
                                  : 'bg-critical animate-pulse'
                            }`} />
                            <span className="capitalize text-[11px]">{inc.status}</span>
                          </span>
                        </td>
                        <td className="p-3 font-mono text-muted text-[10px] truncate max-w-[150px]">{inc.mitreTechnique}</td>
                        <td className="p-3 text-muted">{inc.createdAt}</td>
                      </tr>
                    );
                  })}
                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-muted font-semibold">
                        No incidents matched the filters. System clean.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sliding Side Drawer (40% width, absolutely overlaying/fitting side by side) */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-[40%] border border-border bg-card/90 backdrop-blur-xl rounded-xl p-5 shadow-2xl overflow-y-auto max-h-[75vh] flex flex-col justify-between sticky top-0"
            >
              
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary">{selectedIncident.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      selectedIncident.severity === 'critical' 
                        ? 'bg-critical/15 text-critical border-critical/30' 
                        : selectedIncident.severity === 'high'
                          ? 'bg-warning/15 text-warning border-warning/30'
                          : 'bg-primary/15 text-primary border-primary/30'
                    }`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedIncident(null)}
                    className="p-1 rounded hover:bg-border text-muted hover:text-text transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Threat Title & Server */}
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-text leading-snug">{selectedIncident.threatName}</h2>
                  <div className="flex items-center gap-1 text-[10px] text-muted mt-1.5">
                    <HardDrive className="h-3 w-3" />
                    <span>Host: {selectedIncident.server}</span>
                  </div>
                </div>

                {/* AI Explanation Summary Card */}
                <div className="p-3 rounded-lg border border-primary/15 bg-primary/5 mb-4 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1 text-primary font-bold mb-1.5 uppercase text-[9px] tracking-wider">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>AI Copilot Analysis</span>
                  </div>
                  <p className="text-muted font-medium">{selectedIncident.explanation}</p>
                </div>

                {/* Overview Details tabs */}
                <div className="space-y-4 text-[11px] border-b border-border/40 pb-4 mb-4">
                  <div>
                    <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1">Root Cause</span>
                    <p className="text-muted leading-normal">{selectedIncident.rootCause}</p>
                  </div>
                  
                  <div>
                    <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1">MITRE Technique Mapping</span>
                    <code className="bg-background border border-border px-1.5 py-0.5 rounded text-text font-mono text-[10px]">
                      {selectedIncident.mitreTechnique}
                    </code>
                  </div>

                  <div>
                    <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1.5">Affected Assets</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedIncident.affectedAssets.map((asset, i) => (
                        <span key={i} className="px-2 py-0.5 rounded border border-border bg-background text-muted text-[10px] font-medium">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1">Recommended Remediation Action</span>
                    <p className="text-muted leading-normal font-medium text-primary/80">{selectedIncident.recommendedFix}</p>
                  </div>
                </div>

                {/* Timeline History */}
                <div className="mb-4">
                  <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-2">Audited Incident Timeline</span>
                  <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-[1px] before:bg-border">
                    {selectedIncident.history.map((h, i) => (
                      <div key={i} className="relative text-[10px] leading-relaxed">
                        <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-border border-2 border-card" />
                        <div className="flex justify-between text-muted">
                          <span className="font-bold text-text">{h.user}</span>
                          <span className="text-[9px]">{h.time}</span>
                        </div>
                        <p className="text-muted/80">{h.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-border pt-4 mt-4 flex flex-col gap-2">
                {selectedIncident.status !== 'resolved' ? (
                  <>
                    {getLinkedApproval(selectedIncident.server) ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const app = getLinkedApproval(selectedIncident.server);
                            if (app) {
                              approveApproval(app.id);
                              // Update local selected state
                              setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
                            }
                          }}
                          className="flex-1 py-2 rounded bg-success text-text text-[10px] font-bold hover:bg-success/90 cursor-pointer shadow-lg shadow-success/10 text-center"
                        >
                          Approve AI Remediation
                        </button>
                        <button
                          onClick={() => {
                            const app = getLinkedApproval(selectedIncident.server);
                            if (app) {
                              rejectApproval(app.id);
                            }
                          }}
                          className="px-3 py-2 rounded border border-border bg-card hover:bg-border text-muted text-[10px] font-bold cursor-pointer text-center"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          resolveIncident(selectedIncident.id);
                          setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
                        }}
                        className="w-full py-2 rounded bg-primary text-text text-[10px] font-bold hover:bg-primary/95 cursor-pointer shadow-lg shadow-primary/10 text-center"
                      >
                        Mark Resolve Manually
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 py-2 rounded border border-success/30 bg-success/5 text-success text-[10px] font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Remediated & Closed</span>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
