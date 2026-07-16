'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Share2, Sparkles, RefreshCw, 
  Settings, CheckCircle, ShieldAlert, Layers, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('weekly');
  const [serverScope, setServerScope] = useState('all');
  const [includeAi, setIncludeAi] = useState(true);
  
  // Generating state
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  // Pre-existing reports mock
  const reportsList = [
    { id: 'REP-2026-0618', title: 'SOC Weekly Operations Summary (W24)', type: 'Weekly Report', date: 'June 18, 2026', size: '2.4 MB' },
    { id: 'REP-2026-0601', title: 'Monthly Infrastructure Vulnerability Audit', type: 'Monthly Report', date: 'June 01, 2026', size: '14.8 MB' },
    { id: 'REP-2026-0528', title: 'Incident Deep Dive: INC-2026-9815 API Abuse', type: 'Incident Report', date: 'May 28, 2026', size: '1.2 MB' },
    { id: 'REP-2026-0515', title: 'ISO/IEC 27001 Compliance Audit Check', type: 'Compliance Report', date: 'May 15, 2026', size: '4.7 MB' },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setGeneratedReport(null);
    
    const steps = [
      'Querying incident logs database...',
      'Synthesizing MITRE ATT&CK vectors...',
      'Compiling CPU/RAM node historical metrics...',
      'Drafting SentinelAI Executive Summary...',
      'Formatting PDF layout components...'
    ];

    let currentStepIndex = 0;
    setGenerationStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setGenerationStep(steps[currentStepIndex]);
      } else {
        clearInterval(interval);
        setGenerating(false);
        const reportId = `REP-2026-${Math.floor(Math.random() * 9000) + 1000}`;
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        setGeneratedReport({
          id: reportId,
          title: `SentinelAI ${reportType === 'weekly' ? 'Weekly' : reportType === 'monthly' ? 'Monthly' : reportType === 'incident' ? 'Incident' : 'Compliance'} Summary (${serverScope.toUpperCase()})`,
          type: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
          date: today,
          size: '1.8 MB'
        });
      }
    }, 1000);
  };

  const handleDownload = (title: string) => {
    // Simulate text file download for reports
    const content = `SentinelAI Automated Security Report\n=================================\nReport Title: ${title}\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified Secure\nThis is a mock report compiled by SentinelAI Autonomous SOC Analyst.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* COLUMN 1 & 2: REPORT GENERATOR & RECENT GENERATED */}
      <div className="md:col-span-2 space-y-8">
        
        {/* REPORT GENERATOR BOX */}
        <div className="glass-panel rounded-xl p-7 relative overflow-hidden">
          <div className="border-b border-border pb-5 mb-6">
            <h1 className="text-base font-extrabold tracking-tight uppercase text-text">SOC Audit Report Builder</h1>
            <p className="text-xs text-muted mt-1">Generate verified security compliance and posture logs</p>
          </div>

          <div className="space-y-6 text-sm">
            {/* Report Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-xs uppercase text-muted block mb-2">Report Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-text focus:outline-none cursor-pointer"
                >
                  <option value="weekly">Weekly SOC Summary</option>
                  <option value="monthly">Monthly Asset Audit</option>
                  <option value="incident">Incident Deep-Dive</option>
                  <option value="compliance">ISO-27001 Compliance</option>
                </select>
              </div>

              {/* Server Scope */}
              <div>
                <label className="font-bold text-xs uppercase text-muted block mb-2">Server Scope</label>
                <select
                  value={serverScope}
                  onChange={(e) => setServerScope(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-text focus:outline-none cursor-pointer"
                >
                  <option value="all">All Infrastructure Nodes</option>
                  <option value="prod">Production Nodes Only</option>
                  <option value="corp">Corp AD Controllers Only</option>
                </select>
              </div>
            </div>

            {/* Include AI Insights Toggle */}
            <div className="flex items-center justify-between p-4.5 rounded-lg border border-border bg-background/30">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <div>
                  <span className="font-bold text-text text-sm block">Include SentinelAI Summary</span>
                  <span className="text-xs text-muted mt-0.5">Embeds LLM-driven root cause and remediation metrics</span>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={includeAi}
                onChange={(e) => setIncludeAi(e.target.checked)}
                className="h-4.5 w-4.5 cursor-pointer accent-primary"
              />
            </div>

            {/* Build button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary/95 text-text font-bold text-xs transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>{generating ? 'Processing SOC Engine...' : 'Compile Security Report'}</span>
            </button>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20"
              >
                <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                <span className="text-xs font-bold text-text uppercase tracking-wider animate-pulse">Generating Report Archive</span>
                <p className="text-xs text-muted mt-2.5 font-mono">{generationStep}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECENTLY GENERATED SUCCESS WINDOW */}
        <AnimatePresence>
          {generatedReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel rounded-xl p-7 border border-success/30 bg-success/5"
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded bg-success/15 text-success flex items-center justify-center border border-success/30">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 text-xs text-muted">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs uppercase tracking-wider text-success">Generation Successful</span>
                    <span className="font-mono text-xs">{generatedReport.id}</span>
                  </div>
                  <h3 className="font-bold text-base text-text mt-2">{generatedReport.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-2">
                    <span>Category: {generatedReport.type}</span>
                    <span>•</span>
                    <span>Size: {generatedReport.size}</span>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleDownload(generatedReport.title)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded bg-success hover:bg-success/90 text-text text-xs font-bold cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Archive</span>
                    </button>
                    <button
                      onClick={() => alert(`Share link copied to clipboard!`)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded border border-border bg-card hover:bg-border text-muted text-xs font-bold cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COLUMN 3: HISTORICAL ARCHIVE LIST */}
      <div className="glass-panel rounded-xl p-7 flex flex-col h-[480px]">
        <div className="border-b border-border pb-5 mb-6 flex-shrink-0">
          <span className="text-sm font-bold text-text uppercase tracking-wider block">Historical Reports</span>
          <p className="text-xs text-muted mt-1">Precompiled compliance audit logs</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {reportsList.map((rep) => (
            <div key={rep.id} className="p-4 rounded-lg bg-background/55 border border-border text-xs hover:border-primary/20 transition-all flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center justify-between text-xs text-muted font-mono font-bold">
                  <span>{rep.id}</span>
                  <span className="text-primary">{rep.type.toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-text text-sm leading-tight mt-1.5 text-left truncate max-w-[220px]">
                  {rep.title}
                </h3>
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-3.5 mt-3.5">
                <span className="text-xs text-muted">{rep.date} ({rep.size})</span>
                <button
                  onClick={() => handleDownload(rep.title)}
                  className="p-1.5 rounded hover:bg-border text-muted hover:text-text transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
