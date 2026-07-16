'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/store/app-context';
import { 
  Zap, Sparkles, Target, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { StatusChip } from '@/components/ui/status-chip';

export default function ThreatIntelligencePage() {
  const { incidents } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // MITRE ATT&CK Tactics & Techniques Structure
  const mitreMatrix = [
    {
      tactic: 'Initial Access',
      techniques: [
        { code: 'T1190', name: 'Exploit Public App', status: 'inactive' },
        { code: 'T1566', name: 'Phishing Vectors', status: 'inactive' },
        { code: 'T1133', name: 'External Services', status: 'inactive' }
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { code: 'T1059', name: 'Command & Scripting', status: 'resolved', incidentId: 'INC-2026-9816' },
        { code: 'T1203', name: 'Exploit Client Exec', status: 'inactive' },
        { code: 'T1053', name: 'Scheduled Cronjobs', status: 'inactive' }
      ]
    },
    {
      tactic: 'Privilege Escalation',
      techniques: [
        { code: 'T1068', name: 'Exploit Local Vuln', status: 'active-critical', incidentId: 'INC-2026-9814' },
        { code: 'T1548', name: 'Abuse Sudo/Bypass', status: 'inactive' },
        { code: 'T1078', name: 'Valid Admin Tokens', status: 'inactive' }
      ]
    },
    {
      tactic: 'Credential Access',
      techniques: [
        { code: 'T1110', name: 'Brute Force Guessing', status: 'active-high', incidentId: 'INC-2026-9812' },
        { code: 'T1003', name: 'OS Credential Dump', status: 'inactive' },
        { code: 'T1555', name: 'Read Key Vaults', status: 'inactive' }
      ]
    },
    {
      tactic: 'Exfiltration',
      techniques: [
        { code: 'T1048', name: 'Exfil Over Alt Proto', status: 'resolved', incidentId: 'INC-2026-9816' },
        { code: 'T1020', name: 'Automated Exfil', status: 'inactive' },
        { code: 'T1567', name: 'Exfil via Cloud Serv', status: 'inactive' }
      ]
    },
    {
      tactic: 'Impact',
      techniques: [
        { code: 'T1486', name: 'Encrypted for Impact', status: 'active-critical', incidentId: 'INC-2026-9813' },
        { code: 'T1489', name: 'Service Stop/Kill', status: 'inactive' },
        { code: 'T1490', name: 'Inhibit Sys Recovery', status: 'inactive' }
      ]
    }
  ];

  // Top Targeted Assets Mock
  const targetedAssets = [
    { name: 'corp-dc-01', attacks: 124, score: 78, type: 'Domain Controller' },
    { name: 'prod-db-01', attacks: 85, score: 82, type: 'Postgres Host' },
    { name: 'prod-web-01', attacks: 64, score: 94, type: 'Nginx Front' },
    { name: 'staging-api-01', attacks: 42, score: 89, type: 'NodeJS Gateway' }
  ];

  // Attack Trend radar chart data
  const threatCategoryRadar = [
    { subject: 'Ransomware', A: 85, fullMark: 100 },
    { subject: 'Brute Force', A: 90, fullMark: 100 },
    { subject: 'SQL Injection', A: 30, fullMark: 100 },
    { subject: 'Exfiltration', A: 75, fullMark: 100 },
    { subject: 'Priv Esc.', A: 60, fullMark: 100 },
    { subject: 'DoS Scans', A: 45, fullMark: 100 }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      
      {/* Page Header */}
      <PageHeader 
        title="Global Threat Intelligence" 
        description="Map indicators of compromise (IOCs) directly against the MITRE ATT&CK matrix in real-time."
        icon={Zap}
      />

      {/* MITRE ATT&CK HEATMAP MATRIX */}
      <div className="glass-panel rounded-card p-card-padding border border-border/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 mb-8 gap-4 select-none">
          <div>
            <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">MITRE ATT&CK Enterprise Matrix</h3>
            <p className="text-caption text-muted mt-1 font-normal">Real-time mapping of detected exploitation techniques</p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 text-caption font-bold">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-badge bg-critical animate-pulse shadow-sm shadow-critical" /> Active Critical</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-badge bg-warning shadow-sm shadow-warning" /> Active High</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-badge bg-success shadow-sm shadow-success" /> Remediated</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-badge bg-border" /> Inactive</span>
          </div>
        </div>

        {/* CSS GRID FOR MATRIX COLUMNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {mitreMatrix.map((column, i) => (
            <div key={i} className="space-y-4 border-r border-border/30 last:border-r-0 pr-3 text-caption">
              <div className="font-bold text-text uppercase tracking-wider border-b border-border pb-3.5 mb-5 text-[11px] truncate">
                {column.tactic}
              </div>
              
              <div className="space-y-4">
                {column.techniques.map((tech) => {
                  let statusClass = 'bg-background/80 border-border text-muted';
                  let pulseClass = '';
                  
                  if (tech.status === 'active-critical') {
                    statusClass = 'bg-critical/15 border-critical/40 text-critical glow-critical font-bold';
                    pulseClass = 'animate-cyber-pulse';
                  } else if (tech.status === 'active-high') {
                    statusClass = 'bg-warning/15 border-warning/40 text-warning glow-warning font-bold';
                  } else if (tech.status === 'resolved') {
                    statusClass = 'bg-success/10 border-success/35 text-success font-bold';
                  }
  
                  return (
                    <div 
                      key={tech.code}
                      className={`p-4 rounded-card border text-left transition-all ${statusClass} ${pulseClass}`}
                    >
                      <div className="flex justify-between items-center font-mono text-[10px] font-bold">
                        <span>{tech.code}</span>
                        {tech.status.startsWith('active') && (
                          <span className="h-2 w-2 rounded-badge bg-current animate-ping" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] mt-1.5 leading-snug">{tech.name}</div>
                      {tech.incidentId && (
                        <div className="text-[10px] font-mono mt-1.5 font-bold text-primary underline cursor-pointer">
                          {tech.incidentId}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS & RANKINGS (SECTION 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar Attack Categories */}
        <div className="glass-panel rounded-card p-card-padding flex flex-col h-[460px] border border-border/80 shadow-md">
          <div className="border-b border-border pb-5 mb-6">
            <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Tactical Threat Surface</h3>
            <p className="text-caption text-muted mt-1 font-normal">Categorised attack vector frequency index</p>
          </div>

          <div className="w-full h-[300px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={threatCategoryRadar}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#1F2937" fontSize={9} />
                  <Radar name="Threat Vector Intensity" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-border/20 rounded-card" />
            )}
          </div>
        </div>

        {/* Most Targeted Assets */}
        <div className="glass-panel rounded-card p-card-padding flex flex-col h-[460px] border border-border/80 shadow-md">
          <div className="border-b border-border pb-5 mb-6">
            <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Top Targeted Assets</h3>
            <p className="text-caption text-muted mt-1 font-normal">Monitored servers sorted by ingestion threat alerts count</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {targetedAssets.map((asset, i) => (
              <div key={i} className="p-4 rounded-input bg-background/55 border border-border flex items-center justify-between text-caption hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-input bg-border text-muted">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-text text-[13px]">{asset.name}</span>
                    <span className="text-caption text-muted block mt-0.5 font-normal">{asset.type}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-text block">{asset.attacks} Events</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 block ${asset.score >= 90 ? 'text-success' : 'text-warning'}`}>
                    Score: {asset.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI threat intelligence insight block */}
        <AIInsightCard 
          title="AI Intelligence Insights" 
          badgeText="Analysis Live"
          className="h-[460px]"
        >
          <div className="space-y-5 text-caption leading-relaxed text-muted mt-2">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-4.5 w-4.5 text-warning flex-shrink-0 mt-0.5" />
              <p className="font-normal">
                <strong className="text-text font-bold">LockBit 3.0 Ransomware Activity</strong>: We observed active techniques targeting Windows volume shadow copies on <code className="text-text font-bold">corp-dc-01</code>. Indicators suggest lateral propagation attempts are currently blocked.
              </p>
            </div>

            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-4.5 w-4.5 text-critical flex-shrink-0 mt-0.5" />
              <p className="font-normal">
                <strong className="text-text font-bold">Sudo Local Escalation Exploits</strong>: Database user <code className="text-text font-bold">postgres</code> successfully map memory addresses leveraging CVE-2016-5195. Containment via host isolation queue recommended.
              </p>
            </div>

            <div className="flex gap-3 items-start">
              <ShieldCheck className="h-4.5 w-4.5 text-success flex-shrink-0 mt-0.5" />
              <p className="font-normal">
                <strong className="text-text font-bold">DNS exfiltration closed</strong>: Outbound requests to Tor exit nodes on <code className="text-text font-bold">prod-web-01</code> were resolved. DNS query limits verified on gateway hosts.
              </p>
            </div>
            
            <div className="border-t border-border/40 pt-5 text-[10px] text-muted text-center font-bold uppercase tracking-wider">
              Ingestion feed updated: Just now (1,284 rules active)
            </div>
          </div>
        </AIInsightCard>

      </div>

    </div>
  );
}
