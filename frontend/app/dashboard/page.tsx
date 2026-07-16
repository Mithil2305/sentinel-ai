'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, ShieldAlert, CheckSquare, Clock, HardDrive, 
  Activity, ArrowUpRight, Sparkles, TrendingDown, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { StatusChip } from '@/components/ui/status-chip';
import { ActionButton } from '@/components/ui/action-button';
import { DataTable } from '@/components/ui/data-table';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    servers, 
    incidents, 
    approvals, 
    selectedServerId,
    resolveIncident 
  } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter calculations based on selected server
  const activeIncidents = incidents.filter(i => {
    if (selectedServerId !== 'all') {
      return i.status !== 'resolved' && (servers.find(s => s.id === selectedServerId)?.hostname === i.server);
    }
    return i.status !== 'resolved';
  });

  const totalThreats = activeIncidents.length;
  
  const resolvedToday = incidents.filter(i => {
    if (selectedServerId !== 'all') {
      return i.status === 'resolved' && (servers.find(s => s.id === selectedServerId)?.hostname === i.server);
    }
    return i.status === 'resolved';
  }).length;

  const pendingApprovalsCount = approvals.filter(a => {
    if (selectedServerId !== 'all') {
      return a.server === selectedServerId;
    }
    return true;
  }).length;

  const onlineServersCount = servers.filter(s => s.status === 'online').length;

  // Chart Mock Data
  const threatHistoryData = [
    { day: 'Mon', detected: 4, resolved: 3 },
    { day: 'Tue', detected: 2, resolved: 2 },
    { day: 'Wed', detected: 6, resolved: 5 },
    { day: 'Thu', detected: 3, resolved: 3 },
    { day: 'Fri', detected: 8, resolved: 6 },
    { day: 'Sat', detected: 2, resolved: 2 },
    { day: 'Sun', detected: totalThreats, resolved: resolvedToday }
  ];

  const distributionData = [
    { name: 'Malware', value: 35, color: '#EF4444' },
    { name: 'Brute Force', value: 25, color: '#F59E0B' },
    { name: 'Privilege Esc.', value: 15, color: '#3B82F6' },
    { name: 'Data Exfil.', value: 15, color: '#A855F7' },
    { name: 'Ransomware', value: 10, color: '#EC4899' }
  ];

  // Dynamic security score
  const calculateSecurityScore = () => {
    let base = 98;
    base -= activeIncidents.filter(i => i.severity === 'critical').length * 10;
    base -= activeIncidents.filter(i => i.severity === 'high').length * 6;
    base -= activeIncidents.filter(i => i.severity === 'medium').length * 3;
    base -= pendingApprovalsCount * 2;
    return Math.max(12, base);
  };

  const securityScore = calculateSecurityScore();

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: 'Protected', color: '#22C55E', ringColor: '#22C55E', badge: 'bg-success/10 text-success border-success/30' };
    if (score >= 70) return { label: 'At Risk', color: '#F59E0B', ringColor: '#F59E0B', badge: 'bg-warning/10 text-warning border-warning/30' };
    return { label: 'Critical Compromised', color: '#EF4444', ringColor: '#EF4444', badge: 'bg-critical/10 text-critical border-critical/30' };
  };

  const scoreStatus = getScoreStatus(securityScore);

  // Metric cards data
  const metrics = [
    {
      title: 'Protected Servers',
      value: `${onlineServersCount}/${servers.length}`,
      sub: '100% agent coverage',
      icon: HardDrive,
      color: '#3B82F6',
      trend: null,
    },
    {
      title: 'Active Threats',
      value: totalThreats,
      sub: 'Requiring review',
      icon: ShieldAlert,
      color: totalThreats > 0 ? '#EF4444' : '#22C55E',
      trend: totalThreats > 0 ? 'up' : null,
      trendLabel: totalThreats > 0 ? `+${totalThreats}` : 'Clear',
    },
    {
      title: 'Resolved Today',
      value: resolvedToday,
      sub: 'Autonomous remediation',
      icon: ShieldCheck,
      color: '#22C55E',
      trend: 'up',
      trendLabel: '+12%',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovalsCount,
      sub: 'Human-in-the-loop queue',
      icon: CheckSquare,
      color: pendingApprovalsCount > 0 ? '#F59E0B' : '#9CA3AF',
      trend: pendingApprovalsCount > 0 ? 'warn' : null,
      trendLabel: pendingApprovalsCount > 0 ? 'Action needed' : 'Secure',
    },
    {
      title: 'Avg Response Time',
      value: '280ms',
      sub: 'Threat to containment',
      icon: Clock,
      color: '#3B82F6',
      trend: 'down',
      trendLabel: '-18%',
    },
  ];

  // Table columns
  const incidentColumns = [
    { 
      header: 'ID', 
      accessor: (inc: any) => (
        <span className="font-mono font-bold text-primary">{inc.id}</span>
      ) 
    },
    { 
      header: 'Threat Vector', 
      accessor: (inc: any) => (
        <span className="font-bold text-text group-hover:text-primary transition-colors text-small-text">
          {inc.threatName}
        </span>
      ) 
    },
    { 
      header: 'Server', 
      accessor: (inc: any) => (
        <span className="font-semibold text-muted">{inc.server}</span>
      ) 
    },
    { 
      header: 'Severity', 
      accessor: (inc: any) => (
        <StatusChip status={inc.severity} />
      ) 
    },
    { 
      header: 'Status', 
      accessor: (inc: any) => (
        <StatusChip status={inc.status === 'investigating' ? 'investigating' : inc.status === 'resolved' ? 'resolved' : 'critical'} />
      ) 
    },
    { 
      header: 'Detected', 
      accessor: (inc: any) => (
        <span className="font-mono text-caption text-muted">{inc.createdAt}</span>
      ) 
    },
    { 
      header: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (inc: any) => inc.status !== 'resolved' ? (
        <ActionButton 
          variant="secondary" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            resolveIncident(inc.id);
          }}
        >
          Resolve
        </ActionButton>
      ) : (
        <span className="text-success font-bold text-xs uppercase">Resolved</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <PageHeader 
        title="Security Operations Center Overview" 
        description="Real-time monitoring panel displaying autonomous agent telemetry and self-healing active mitigations."
        icon={Activity}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  BENTO GRID — Row 1: Score card + Metric Cards        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

        {/* ── CELL A: Security Posture Score Ring (cols 1-4) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ gridColumn: '1 / span 4' }}
          className="glass-panel rounded-card p-6 border border-primary/20 glow-primary relative overflow-hidden flex flex-col items-center justify-center gap-4"
        >
          {/* Background glow blob */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

          {/* Score Ring */}
          <div style={{ position: 'relative', width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="flex-shrink-0"
          >
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="64" cy="64" r="54" stroke="#1F2937" strokeWidth="10" fill="transparent" />
              <motion.circle
                cx="64" cy="64" r="54"
                stroke={scoreStatus.ringColor}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="339.3"
                initial={{ strokeDashoffset: 339.3 }}
                animate={{ strokeDashoffset: 339.3 - (339.3 * securityScore) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="text-display font-bold tracking-tight text-text leading-none">{securityScore}</span>
              <span className="text-caption font-bold text-muted uppercase tracking-wider" style={{ marginTop: 2 }}>Score</span>
            </div>
          </div>

          {/* Status label + description */}
          <div className="text-center space-y-2 relative z-10">
            <span className={`inline-block px-3 py-1 rounded-badge text-[11px] font-bold border uppercase tracking-wider ${scoreStatus.badge}`}>
              {scoreStatus.label}
            </span>
            <p className="text-caption text-muted leading-relaxed font-normal max-w-[200px]">
              {securityScore >= 90
                ? 'All autonomous policies are fully operational.'
                : 'Resolve pending threats to restore normal posture.'}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-col gap-2 w-full relative z-10">
            <ActionButton
              variant="primary"
              onClick={() => router.push('/approvals')}
              className="flex items-center justify-center gap-2 w-full"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Review Approvals ({pendingApprovalsCount})</span>
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => router.push('/monitoring')}
              className="flex items-center justify-center gap-2 w-full"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Live Streams</span>
            </ActionButton>
          </div>
        </motion.div>

        {/* ── CELLS B–F: 5 Metric Cards filling cols 5-12 (2 rows × 4 cols each) ── */}
        {metrics.map((m, i) => {
          const Icon = m.icon;
          // Explicit column placement within the 12-col grid:
          // Row 1: cards 0,1,2 → cols 5-6, 7-8, 9-10  (span 2 each)
          // Row 2: cards 3,4   → cols 5-8, 9-12        (span 4 each, wider for balance)
          const colMap = [
            '5 / span 3',  // Card 0
            '8 / span 3',  // Card 1
            '11 / span 2', // Card 2
            '5 / span 4',  // Card 3
            '9 / span 4',  // Card 4
          ];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{ gridColumn: colMap[i], alignSelf: 'stretch' }}
              className="glass-panel rounded-card p-5 border border-border/80 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold text-muted uppercase tracking-wider">{m.title}</span>
                <div className="p-2 rounded-input" style={{ background: `${m.color}18` }}>
                  <Icon style={{ width: 14, height: 14, color: m.color }} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</span>
                <p className="text-caption text-muted mt-1 font-normal">{m.sub}</p>
              </div>
              {m.trendLabel && (
                <div className="flex items-center gap-1.5">
                  {m.trend === 'up' && <TrendingUp style={{ width: 11, height: 11, color: '#EF4444' }} />}
                  {m.trend === 'down' && <TrendingDown style={{ width: 11, height: 11, color: '#22C55E' }} />}
                  {m.trend === 'warn' && <TrendingUp style={{ width: 11, height: 11, color: '#F59E0B' }} />}
                  <span className="text-[10px] font-bold" style={{
                    color: m.trend === 'down' ? '#22C55E' : m.trend === 'up' ? '#EF4444' : m.trend === 'warn' ? '#F59E0B' : '#9CA3AF'
                  }}>{m.trendLabel}</span>
                </div>
              )}
            </motion.div>
          );
        })}

      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  BENTO GRID — Row 2: Charts                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

        {/* ── Threat Activity Area Chart (cols 1-8) ── */}
        <div style={{ gridColumn: '1 / span 8', height: '360px' }}
          className="glass-panel rounded-card p-6 border border-border/80 shadow-md flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-5 gap-3 flex-shrink-0">
            <div>
              <h3 className="font-bold text-[13px] text-text uppercase tracking-wider">Threat Activity Timeline</h3>
              <p className="text-caption text-muted mt-1 font-normal">Detections vs resolutions — 7-day window</p>
            </div>
            <div className="flex items-center gap-4 text-caption font-bold">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-badge bg-critical" /> Detected</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-badge bg-success" /> Resolved</span>
            </div>
          </div>
          <div className="flex-1" style={{ minHeight: 0 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={threatHistoryData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 12, borderRadius: 8, padding: '10px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#F9FAFB' }}
                  />
                  <Area type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#detectedGrad)" />
                  <Area type="monotone" dataKey="resolved" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#resolvedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-border/20 rounded-card" />
            )}
          </div>
        </div>

        {/* ── Threat Distribution Donut (cols 9-12) ── */}
        <div style={{ gridColumn: '9 / span 4' }}
          className="glass-panel rounded-card p-6 border border-border/80 shadow-md flex flex-col"
        >
          <div className="border-b border-border pb-4 mb-4 flex-shrink-0">
            <h3 className="font-bold text-[13px] text-text uppercase tracking-wider">Threat Distribution</h3>
            <p className="text-caption text-muted mt-1 font-normal">By attack classification</p>
          </div>

          <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-24 h-24 rounded-badge border border-border border-t-transparent animate-spin" />
            )}
            {/* Center label — uses inline style positioning to avoid absolute/relative conflicts */}
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Vectors</span>
              <span className="text-2xl font-bold text-text leading-none" style={{ marginTop: 2 }}>984</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-4 border-t border-border/40 text-caption font-bold mt-auto">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-badge flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-muted text-[10px]">{d.name}</span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  Row 3: Active Threats Table                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-card border border-border/80 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border gap-3">
          <div>
            <h3 className="font-bold text-[13px] text-text uppercase tracking-wider">Active Threats Queue</h3>
            <p className="text-caption text-muted mt-1 font-normal">Real-time incident response log. Click to review action details.</p>
          </div>
          <button
            onClick={() => router.push('/incidents')}
            className="text-caption font-bold text-primary hover:underline flex items-center gap-2 self-start sm:self-auto cursor-pointer flex-shrink-0"
          >
            <span>View All Incidents</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <DataTable
          data={incidents.slice(0, 4)}
          columns={incidentColumns}
          onRowClick={() => router.push('/incidents')}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  Row 4: AI Insight Card                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AIInsightCard title="SentinelAI Daily Operations Insight">
        &ldquo;Today, I ingested and analyzed <strong className="text-text font-bold">1,248,912 events</strong> across production subnets. 
        <strong className="text-text font-bold"> 3 threat vectors</strong> were identified. 
        <strong className="text-text font-bold"> 2 incidents</strong> (credential abuse on `staging-api-01` and DNS tunneling on `prod-web-01`) were autonomously remediated successfully. 
        No lateral movements or unauthorized active directory replication events were detected. 
        System security score remains healthy at <strong className="text-text font-bold">92/100</strong>. Recommendation: Execute containment approval for `corp-dc-01` ransomware behavior.&rdquo;
      </AIInsightCard>

    </div>
  );
}
