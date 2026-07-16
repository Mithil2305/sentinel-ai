'use client';

import React, { useState } from 'react';
import { useApp } from '@/store/app-context';
import { 
  CheckSquare, ShieldAlert, Check, X, 
  ShieldCheck, ChevronDown, ChevronUp, FileCode, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { ActionButton } from '@/components/ui/action-button';
import { StatusChip } from '@/components/ui/status-chip';
import { AIInsightCard } from '@/components/ui/ai-insight-card';

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
      
      {/* Page Header */}
      <PageHeader 
        title="Human-in-the-Loop Approvals" 
        description="SentinelAI pauses critical actions to request human authorization. Verify evidence before deploying remediation policies."
        icon={CheckSquare}
      />

      {/* QUEUE COUNT */}
      <div className="flex items-center justify-between mb-5 select-none">
        <span className="text-caption font-bold text-muted uppercase tracking-wider">
          Pending Approvals Queue ({approvals.length})
        </span>
        {approvals.length > 0 && (
          <span className="text-caption bg-critical/20 text-critical border border-critical/35 px-2.5 py-1 rounded-badge font-bold uppercase tracking-wider animate-pulse">
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
              className={`glass-panel rounded-card overflow-hidden border transition-all ${
                isExpanded ? 'glow-critical border-critical/40' : 'hover:border-border/80'
              }`}
            >
              
              {/* Header / Clickable Summary Row */}
              <div 
                onClick={() => toggleExpand(app.id)}
                className="p-card-padding flex items-center justify-between cursor-pointer select-none bg-card/20"
              >
                <div className="flex items-center gap-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-input bg-critical/15 text-critical border border-critical/30 animate-pulse">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className="font-mono font-bold text-caption text-muted">{app.id}</span>
                      <StatusChip status={app.risk === 'high' ? 'critical' : app.risk} />
                    </div>
                    <h3 className="font-bold text-subsection text-text mt-1.5 leading-snug">{app.title}</h3>
                    <div className="flex items-center gap-3 text-caption text-muted mt-2 font-normal">
                      <span>Server: <strong className="text-text font-bold">{app.server}</strong></span>
                      <span>•</span>
                      <span>Detected: {app.detectedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-lg">
                  <div className="hidden sm:flex gap-3">
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveApproval(app.id);
                      }}
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectApproval(app.id);
                      }}
                    >
                      Reject
                    </ActionButton>
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
                    <div className="p-8 border-t border-border bg-black/50 space-y-6 text-small-text text-muted">
                      
                      {/* AI Investigation Section */}
                      <AIInsightCard title="SentinelAI Copilot Investigation Summary" badgeText="Analysis Complete">
                        {app.explanation}
                      </AIInsightCard>

                      {/* Evidence Timeline */}
                      <div className="space-y-label-gap">
                        <span className="font-bold text-text uppercase text-[12px] tracking-wider block">
                          Evidence Logs Collected
                        </span>
                        <div className="bg-background/90 border border-border rounded-card p-5 font-mono text-xs space-y-2">
                          {app.evidence.map((ev, i) => (
                            <div key={i} className="flex items-start gap-2 text-muted">
                              <span className="text-critical font-bold">&gt;</span>
                              <span className="break-all">{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Affected Files */}
                      <div className="space-y-label-gap">
                        <span className="font-bold text-text uppercase text-[12px] tracking-wider block">
                          Affected File Paths ({app.affectedFiles.length})
                        </span>
                        <div className="space-y-2">
                          {app.affectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-input bg-background/60 border border-border">
                              <FileCode className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                              <span className="font-mono text-caption text-text break-all">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* proposed action plan details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/40 pt-6">
                        <div className="space-y-1.5">
                          <span className="font-bold text-text uppercase text-[12px] tracking-wider block">
                            Proposed Remediation Steps
                          </span>
                          <p className="leading-relaxed font-normal text-text/90 text-small-text">
                            {app.proposedRemediation}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="font-bold text-text uppercase text-[12px] tracking-wider block">
                            Risk Assessment & Impact
                          </span>
                          <p className="leading-relaxed font-bold text-warning text-small-text">
                            {app.riskAssessment}
                          </p>
                        </div>
                      </div>

                      {/* MITRE technique mapping */}
                      <div className="border-t border-border/40 pt-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-text uppercase text-[12px] tracking-wider">
                            MITRE ATT&CK Mapping:
                          </span>
                          <span className="font-mono text-caption text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-md font-bold">
                            {app.mitreMapping}
                          </span>
                        </div>
                        <div className="text-caption text-muted flex items-center gap-2 font-normal">
                          <Clock className="h-4 w-4" />
                          <span>SLA countdown: 4m 12s before auto-pause</span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="border-t border-border/40 pt-5 flex flex-wrap gap-3 justify-end">
                        <ActionButton
                          variant="primary"
                          onClick={() => approveApproval(app.id)}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve & Deploy Action</span>
                        </ActionButton>
                        <ActionButton
                          variant="outline"
                          onClick={() => rejectApproval(app.id)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Action</span>
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          onClick={() => alert(`Initiating secondary sandboxed verification...`)}
                        >
                          Investigate Sandbox
                        </ActionButton>
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
            className="glass-panel rounded-card p-12 flex flex-col items-center justify-center text-center border border-success/30 bg-success/5"
          >
            <div className="h-14 w-14 rounded-badge bg-success/15 text-success flex items-center justify-center border border-success/35 mb-4 glow-success">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Remediation Queue Clear</h3>
            <p className="text-caption text-muted mt-2 max-w-sm font-normal">
              All autonomous containment directives have run cleanly. No threats are flagged for manual operator confirmation at this time.
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}
