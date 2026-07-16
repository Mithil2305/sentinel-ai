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
    <div className="max-w-5xl mx-auto pb-16">
      
      {/* HEADER */}
      <div className="border-b border-border pb-5 mb-8">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span>Human-in-the-Loop Approvals</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">
          SentinelAI pauses critical actions to request human authorization. Verify evidence before deploying remediation policies.
        </p>
      </div>

      {/* QUEUE COUNT */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-muted uppercase tracking-wider">
          Pending Approvals Queue ({approvals.length})
        </span>
        {approvals.length > 0 && (
          <span className="text-xs bg-critical/20 text-critical border border-critical/35 px-2.5 py-1 rounded font-bold uppercase tracking-wider animate-pulse">
            Critical Actions Awaiting Confirmation
          </span>
        )}
      </div>

      {/* CARDS CONTAINER */}
      <div className="space-y-6">
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
                className="p-6 flex items-center justify-between cursor-pointer select-none bg-card/20"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-critical/15 text-critical border border-critical/30 animate-pulse">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-muted">{app.id}</span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-critical/10 text-critical border border-critical/30">
                        {app.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-text mt-1.5 leading-snug">{app.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted mt-2 font-medium">
                      <span>Server: <strong className="text-text">{app.server}</strong></span>
                      <span>•</span>
                      <span>Detected: {app.detectedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveApproval(app.id);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-success hover:bg-success/90 text-text text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-success/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectApproval(app.id);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-border/60 text-muted text-xs font-bold transition-all cursor-pointer"
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
                    <div className="p-8 border-t border-border bg-black/50 space-y-6 text-sm text-muted">
                      
                      {/* AI Investigation Section */}
                      <div className="p-6 rounded-xl border border-primary/25 bg-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary font-extrabold uppercase text-xs tracking-wider">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          <span>SentinelAI Copilot Investigation Summary</span>
                        </div>
                        <p className="leading-relaxed font-medium text-text text-sm md:text-base">
                          {app.explanation}
                        </p>
                      </div>

                      {/* Evidence Timeline */}
                      <div className="space-y-2.5">
                        <span className="font-extrabold text-text uppercase text-xs tracking-wider block">
                          Evidence Logs Collected
                        </span>
                        <div className="bg-background/90 border border-border rounded-xl p-5 font-mono text-sm space-y-2">
                          {app.evidence.map((ev, i) => (
                            <div key={i} className="flex items-start gap-2 text-muted">
                              <span className="text-critical font-bold">&gt;</span>
                              <span className="break-all">{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Affected Files */}
                      <div className="space-y-2.5">
                        <span className="font-extrabold text-text uppercase text-xs tracking-wider block">
                          Affected File Paths ({app.affectedFiles.length})
                        </span>
                        <div className="space-y-2.5">
                          {app.affectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border">
                              <FileCode className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                              <span className="font-mono text-sm text-text break-all">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* proposed action plan details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/40 pt-6">
                        <div className="space-y-1.5">
                          <span className="font-extrabold text-text uppercase text-xs tracking-wider block">
                            Proposed Remediation Steps
                          </span>
                          <p className="leading-relaxed font-medium text-text/90 text-sm md:text-base">
                            {app.proposedRemediation}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="font-extrabold text-text uppercase text-xs tracking-wider block">
                            Risk Assessment & Impact
                          </span>
                          <p className="leading-relaxed font-bold text-warning text-sm md:text-base">
                            {app.riskAssessment}
                          </p>
                        </div>
                      </div>

                      {/* MITRE technique mapping */}
                      <div className="border-t border-border/40 pt-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-text uppercase text-xs tracking-wider">
                            MITRE ATT&CK Mapping:
                          </span>
                          <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-md font-bold">
                            {app.mitreMapping}
                          </span>
                        </div>
                        <div className="text-xs text-muted flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4" />
                          <span>SLA countdown: 4m 12s before auto-pause</span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="border-t border-border/40 pt-5 flex flex-wrap gap-3 justify-end">
                        <button
                          onClick={() => approveApproval(app.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded bg-success hover:bg-success/90 text-text text-xs font-bold transition-all cursor-pointer shadow-lg shadow-success/15"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve & Deploy Action</span>
                        </button>
                        <button
                          onClick={() => rejectApproval(app.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded border border-border bg-background hover:bg-border text-muted text-xs font-bold transition-all cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Action</span>
                        </button>
                        <button
                          onClick={() => alert(`Initiating secondary sandboxed sandbox verification...`)}
                          className="px-5 py-2.5 rounded border border-border bg-card hover:bg-border text-muted text-xs font-bold transition-all cursor-pointer"
                        >
                          Investigate Sandbox
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
            className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center border border-success/30 bg-success/5"
          >
            <div className="h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center border border-success/35 mb-4 glow-success">
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
