'use client';

import React, { useState } from 'react';
import { useApp } from '@/store/app-context';
import { 
  CheckSquare, ShieldAlert, Sparkles, Check, X, AlertTriangle, 
  HelpCircle, ShieldCheck, ChevronDown, ChevronUp, FileCode, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApprovalsPage() {
  const { 
    approvals, 
    approveApproval, 
    rejectApproval 
  } = useApp();

  const [expandedCardId, setExpandedCardId] = useState<string | null>('APP-7182');

  const toggleExpand = (id: string) => {
    if (expandedCardId === id) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span>Human-in-the-Loop Approvals</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          SentinelAI pauses critical actions to request human authorization. Verify evidence before deploying remediation policies.
        </p>
      </div>

      {/* QUEUE COUNT */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Pending Approvals Queue ({approvals.length})
        </span>
        {approvals.length > 0 && (
          <span className="text-[10px] bg-critical/20 text-critical border border-critical/35 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
            Critical Actions Awaiting Confirmation
          </span>
        )}
      </div>

      {/* CARDS CONTAINER */}
      <div className="space-y-4">
        {approvals.map((app) => {
          const isExpanded = expandedCardId === app.id;
          return (
            <motion.div
              key={app.id}
              layout
              className={`glass-panel rounded-xl overflow-hidden border transition-all ${
                isExpanded ? 'glow-critical border-critical/40' : 'hover:border-border/80'
              }`}
            >
              
              {/* Header / Clickable Summary Row */}
              <div 
                onClick={() => toggleExpand(app.id)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-card/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-critical/15 text-critical border border-critical/30 animate-pulse">
                    <ShieldAlert className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-muted">{app.id}</span>
                      <span className="px-2 py-0.2 rounded text-[8px] font-extrabold uppercase bg-critical/10 text-critical border border-critical/30">
                        {app.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-text mt-1 leading-snug">{app.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-muted mt-1.5 font-medium">
                      <span>Server: <strong className="text-text">{app.server}</strong></span>
                      <span>•</span>
                      <span>Detected: {app.detectedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2 hidden md:flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveApproval(app.id);
                      }}
                      className="px-3 py-1.5 rounded bg-success hover:bg-success/90 text-text text-[10px] font-bold transition-all cursor-pointer shadow-lg shadow-success/15"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectApproval(app.id);
                      }}
                      className="px-3 py-1.5 rounded border border-border bg-background hover:bg-border text-muted text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted" /> : <ChevronDown className="h-5 w-5 text-muted" />}
                </div>
              </div>

              {/* Expandable Evidence details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border-t border-border bg-black/40 space-y-5 text-xs text-muted">
                      
                      {/* AI Investigation Section */}
                      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-1.5 text-primary font-bold uppercase text-[9px] tracking-wider mb-2">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          <span>SentinelAI Copilot Investigation Summary</span>
                        </div>
                        <p className="leading-relaxed font-medium text-text/95">
                          {app.explanation}
                        </p>
                      </div>

                      {/* Evidence Timeline */}
                      <div>
                        <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-2">
                          Evidence Collected logs
                        </span>
                        <div className="bg-background border border-border rounded-lg p-3 font-mono text-[10px] space-y-1.5">
                          {app.evidence.map((ev, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-muted">
                              <span className="text-critical font-bold">&gt;</span>
                              <span className="break-all">{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Affected Files */}
                      <div>
                        <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-2">
                          Affected File Paths ({app.affectedFiles.length})
                        </span>
                        <div className="space-y-1.5">
                          {app.affectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-background/55 border border-border">
                              <FileCode className="h-3.5 w-3.5 text-primary" />
                              <span className="font-mono text-[10px] text-text/85 break-all">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* proposed action plan details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                        <div>
                          <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1">
                            Proposed Remediation Steps
                          </span>
                          <p className="leading-relaxed font-medium text-text/90">
                            {app.proposedRemediation}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted block mb-1">
                            Risk Assessment & Impact
                          </span>
                          <p className="leading-relaxed font-medium text-warning">
                            {app.riskAssessment}
                          </p>
                        </div>
                      </div>

                      {/* MITRE technique mapping */}
                      <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-text uppercase text-[9px] tracking-wider text-muted">
                            MITRE ATT&CK Mapping:
                          </span>
                          <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-semibold ml-1">
                            {app.mitreMapping}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>SLA countdown: 4m 12s before auto-pause</span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="border-t border-border/40 pt-4 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => approveApproval(app.id)}
                          className="flex items-center gap-1 px-4 py-2 rounded bg-success hover:bg-success/90 text-text text-[11px] font-bold transition-all cursor-pointer shadow-lg shadow-success/15"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve & containment deployment</span>
                        </button>
                        <button
                          onClick={() => rejectApproval(app.id)}
                          className="flex items-center gap-1 px-4 py-2 rounded border border-border bg-background hover:bg-border text-muted text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Action</span>
                        </button>
                        <button
                          onClick={() => alert(`Initiating secondary sandboxed sandbox verification...`)}
                          className="px-4 py-2 rounded border border-border bg-card hover:bg-border text-muted text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Investigate sandbox
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}

        {approvals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-xl p-10 flex flex-col items-center justify-center text-center border border-success/30 bg-success/5"
          >
            <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center border border-success/35 mb-4 glow-success">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-sm text-text">Remediation Queue Clear</h3>
            <p className="text-xs text-muted mt-2 max-w-sm">
              All autonomous containment directives have run cleanly. No threats are flagged for manual operator confirmation at this time.
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}
