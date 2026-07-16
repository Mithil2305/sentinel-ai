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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/45 p-5 rounded-xl border border-border mb-8">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, threat name, technique..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2.5 bg-background border border-border rounded-lg px-4 py-2.5">
          <Filter className="h-4 w-4 text-muted" />
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-sm text-text focus:outline-none w-full cursor-pointer font-medium"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2.5 bg-background border border-border rounded-lg px-4 py-2.5">
          <Filter className="h-4 w-4 text-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-text focus:outline-none w-full cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Server filter */}
        <div className="flex items-center gap-2.5 bg-background border border-border rounded-lg px-4 py-2.5">
          <HardDrive className="h-4 w-4 text-muted" />
          <select 
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className="bg-transparent text-sm text-text focus:outline-none w-full cursor-pointer font-medium"
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
        
        {/* Incident Table Column (Always full-width) */}
        <div className="w-full">
          <div className="glass-panel rounded-2xl overflow-hidden border border-border/80 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/40 text-muted font-extrabold text-xs uppercase tracking-wider">
                    <th className="py-5 px-6">ID</th>
                    <th className="py-5 px-6">Threat Name</th>
                    <th className="py-5 px-6">Server</th>
                    <th className="py-5 px-6">Severity</th>
                    <th className="py-5 px-6">Status</th>
                    <th className="py-5 px-6">MITRE Technique</th>
                    <th className="py-5 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredIncidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    return (
                      <tr 
                        key={inc.id}
                        onClick={() => handleRowClick(inc)}
                        className={`hover:bg-border/20 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-l-4 border-l-primary font-semibold' : ''
                        }`}
                      >
                        <td className="py-5 px-6 font-mono font-bold text-primary text-xs">{inc.id}</td>
                        <td className="py-5 px-6 font-bold text-text max-w-[260px] truncate text-sm">{inc.threatName}</td>
                        <td className="py-5 px-6 text-muted text-sm">{inc.server}</td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase border tracking-wider ${
                            inc.severity === 'critical' 
                              ? 'bg-critical/15 text-critical border-critical/30' 
                              : inc.severity === 'high'
                                ? 'bg-warning/15 text-warning border-warning/30'
                                : 'bg-primary/15 text-primary border-primary/30'
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              inc.status === 'resolved' 
                                ? 'bg-success shadow-sm shadow-success' 
                                : inc.status === 'investigating'
                                  ? 'bg-warning shadow-sm shadow-warning'
                                  : 'bg-critical animate-pulse shadow-sm shadow-critical'
                            }`} />
                            <span className="capitalize text-sm">{inc.status}</span>
                          </span>
                        </td>
                        <td className="py-5 px-6 font-mono text-muted text-sm truncate max-w-[200px]">{inc.mitreTechnique}</td>
                        <td className="py-5 px-6 text-muted text-sm font-mono">{inc.createdAt}</td>
                      </tr>
                    );
                  })}
                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted font-bold text-sm">
                        No incidents matched the filters. System clean.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                className="fixed top-0 right-0 h-full w-full max-w-xl border-l border-border bg-card/95 backdrop-blur-2xl p-8 shadow-2xl overflow-y-auto z-50 flex flex-col justify-between space-y-8"
              >
                
                {/* Drawer Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-5 mb-5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-base text-primary">{selectedIncident.id}</span>
                      <span className={`px-3 py-1 rounded text-xs font-black uppercase border ${
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
                      className="p-1.5 rounded-lg hover:bg-border text-muted hover:text-text transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Threat Title & Server */}
                  <div className="mb-6">
                    <h2 className="text-base md:text-lg font-bold text-text leading-snug">{selectedIncident.threatName}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted mt-2.5">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span>Host: {selectedIncident.server}</span>
                    </div>
                  </div>

                  {/* AI Explanation Summary Card */}
                  <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 mb-6 text-sm leading-relaxed">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2.5 uppercase text-xs tracking-wider">
                      <ShieldAlert className="h-4 w-4" />
                      <span>AI Copilot Analysis</span>
                    </div>
                    <p className="text-muted font-medium">{selectedIncident.explanation}</p>
                  </div>

                  {/* Overview Details tabs */}
                  <div className="space-y-5 text-sm border-b border-border/40 pb-6 mb-6">
                    <div>
                      <span className="font-bold text-text uppercase text-xs tracking-wider text-muted block mb-1.5">Root Cause</span>
                      <p className="text-muted leading-relaxed">{selectedIncident.rootCause}</p>
                    </div>
                    
                    <div>
                      <span className="font-bold text-text uppercase text-xs tracking-wider text-muted block mb-2">MITRE Technique Mapping</span>
                      <code className="bg-background border border-border px-2.5 py-1 rounded text-text font-mono text-xs">
                        {selectedIncident.mitreTechnique}
                      </code>
                    </div>

                    <div>
                      <span className="font-bold text-text uppercase text-xs tracking-wider text-muted block mb-2">Affected Assets</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.affectedAssets.map((asset, i) => (
                          <span key={i} className="px-3 py-1 rounded border border-border bg-background text-muted text-xs font-medium">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-text uppercase text-xs tracking-wider text-muted block mb-1.5">Recommended Remediation Action</span>
                      <p className="text-muted leading-relaxed font-semibold text-primary/95">{selectedIncident.recommendedFix}</p>
                    </div>
                  </div>

                  {/* Timeline History */}
                  <div className="mb-6">
                    <span className="font-bold text-text uppercase text-xs tracking-wider text-muted block mb-3.5">Audited Incident Timeline</span>
                    <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-border">
                      {selectedIncident.history.map((h, i) => (
                        <div key={i} className="relative text-xs leading-relaxed">
                          <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full bg-border border-2 border-card" />
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
                          <button
                            onClick={() => {
                              const app = getLinkedApproval(selectedIncident.server);
                              if (app) {
                                approveApproval(app.id);
                                // Update local selected state
                                setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' } : null);
                              }
                            }}
                            className="flex-1 py-3 rounded-lg bg-success text-text text-xs font-bold hover:bg-success/90 cursor-pointer shadow-lg shadow-success/10 text-center"
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
                            className="px-4 py-3 rounded-lg border border-border bg-card hover:bg-border text-muted text-xs font-bold cursor-pointer text-center"
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
                          className="w-full py-3 rounded-lg bg-primary text-text text-xs font-bold hover:bg-primary/95 cursor-pointer shadow-lg shadow-primary/10 text-center"
                        >
                          Mark Resolve Manually
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-lg border border-success/30 bg-success/5 text-success text-xs font-bold">
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
