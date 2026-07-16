'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, ShieldAlert, CheckSquare, Clock, HardDrive, 
  Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
    { day: 'Mon', detected: 4, resolved: 3, auto: 2 },
    { day: 'Tue', detected: 2, resolved: 2, auto: 1 },
    { day: 'Wed', detected: 6, resolved: 5, auto: 4 },
    { day: 'Thu', detected: 3, resolved: 3, auto: 2 },
    { day: 'Fri', detected: 8, resolved: 6, auto: 5 },
    { day: 'Sat', detected: 2, resolved: 2, auto: 2 },
    { day: 'Sun', detected: totalThreats, resolved: resolvedToday, auto: 2 }
  ];

  const distributionData = [
    { name: 'Malware', value: 35, color: '#EF4444' },
    { name: 'Brute Force', value: 25, color: '#F59E0B' },
    { name: 'Privilege Esc.', value: 15, color: '#3B82F6' },
    { name: 'Data Exfil.', value: 15, color: '#A855F7' },
    { name: 'Ransomware', value: 10, color: '#EC4899' }
  ];

  // Dynamic security score based on threats and server conditions
  const calculateSecurityScore = () => {
    let base = 98;
    // Deduct for active threats
    base -= activeIncidents.filter(i => i.severity === 'critical').length * 10;
    base -= activeIncidents.filter(i => i.severity === 'high').length * 6;
    base -= activeIncidents.filter(i => i.severity === 'medium').length * 3;
    // Deduct for pending approvals
    base -= pendingApprovalsCount * 2;
    return Math.max(12, base);
  };

  const securityScore = calculateSecurityScore();

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: 'Protected', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
    if (score >= 70) return { label: 'At Risk', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
    return { label: 'Critical compromised', color: 'text-critical', bg: 'bg-critical/10', border: 'border-critical/30' };
  };

  const statusStyle = getScoreStatus(securityScore);

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto pb-20">
      
      {/* SECTION 1: HERO AI SECURITY POSTURE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-2xl p-10 md:p-12 glow-primary overflow-hidden relative border border-primary/20 shadow-xl"
      >
        {/* Glow absolute background accents */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />
        <div className="absolute right-12 top-0 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-10 text-center sm:text-left">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center h-32 w-32 rounded-full border border-border/80 bg-background/90 shadow-inner flex-shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#1F2937" strokeWidth="9" fill="transparent" />
                <motion.circle 
                  cx="56" cy="56" r="46" 
                  stroke={securityScore >= 90 ? '#22C55E' : securityScore >= 70 ? '#F59E0B' : '#EF4444'} 
                  strokeWidth="9" 
                  fill="transparent" 
                  strokeDasharray="289"
                  animate={{ strokeDashoffset: 289 - (289 * securityScore) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black tracking-tight text-text">{securityScore}</span>
                <span className="text-xs font-extrabold text-muted uppercase tracking-wider">Score</span>
              </div>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Security Posture Status:</h1>
                <span className={`px-4.5 py-1.5 rounded-lg text-xs font-black ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border uppercase tracking-wider shadow-sm`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed font-medium">
                {securityScore >= 90 
                  ? 'All autonomous policies are fully operational. Host integrity check verification completes cleanly without unexpected root escalations.'
                  : 'Action recommended: Resolve pending high-entropy cryptographic payloads to return to normal posture metrics.'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto flex-shrink-0">
            <button 
              onClick={() => router.push('/approvals')}
              className="flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-text hover:bg-primary/95 transition-all shadow-lg shadow-primary/25 cursor-pointer"
            >
              <CheckSquare className="h-4.5 w-4.5" />
              <span>Review Approvals ({pendingApprovalsCount})</span>
            </button>
            <button 
              onClick={() => router.push('/monitoring')}
              className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card/80 hover:bg-border/60 px-6 py-3.5 text-sm font-bold text-text transition-all cursor-pointer shadow-sm"
            >
              <Activity className="h-4.5 w-4.5 text-primary" />
              <span>Live Streams</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {[
          { title: 'Protected Servers', val: `${onlineServersCount}/${servers.length}`, sub: '100% agent coverage', icon: HardDrive, trend: 'stable', color: 'text-primary' },
          { title: 'Active Threats', val: totalThreats, sub: 'Requiring review', icon: ShieldAlert, trend: totalThreats > 0 ? 'up' : 'stable', trendVal: totalThreats > 0 ? `+${totalThreats}` : '', color: totalThreats > 0 ? 'text-critical' : 'text-success' },
          { title: 'Resolved Today', val: resolvedToday, sub: 'Autonomous fix active', icon: ShieldCheck, trend: 'up', trendVal: '+12%', color: 'text-success' },
          { title: 'Pending Approvals', val: pendingApprovalsCount, sub: 'Human-in-the-loop queue', icon: CheckSquare, trend: pendingApprovalsCount > 0 ? 'warn' : 'stable', trendVal: pendingApprovalsCount > 0 ? 'Action' : 'Secure', color: pendingApprovalsCount > 0 ? 'text-warning' : 'text-muted' },
          { title: 'Avg Response Time', val: '280ms', sub: 'Threat to containment', icon: Clock, trend: 'down', trendVal: '-18%', color: 'text-primary' },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between h-40 relative group border border-border/80 shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-bold text-muted uppercase tracking-wider">{c.title}</span>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            
            <div className="my-2">
              <span className="text-3xl lg:text-4xl font-black tracking-tight text-text">{c.val}</span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
              <span className="text-xs text-muted font-medium truncate pr-1">{c.sub}</span>
              {c.trendVal && (
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 flex-shrink-0 ${
                  c.trend === 'up' 
                    ? 'bg-success/15 text-success border border-success/30' 
                    : c.trend === 'down' 
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : c.trend === 'warn'
                        ? 'bg-warning/15 text-warning border border-warning/30 animate-pulse'
                        : 'bg-border/60 text-muted'
                }`}>
                  {c.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                  {c.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                  {c.trendVal}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS CONTAINER (SECTION 3 & SECTION 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Threat Activity Area Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-8 md:p-10 flex flex-col justify-between h-[480px] relative border border-border/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 mb-5 gap-4">
            <div>
              <h3 className="font-extrabold text-base text-text uppercase tracking-wider">Threat Activity Timeline</h3>
              <p className="text-sm text-muted mt-1 font-medium">Detections vs Auto-remediations (7-day window)</p>
            </div>
            <div className="flex items-center gap-5 text-sm font-bold">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-critical shadow-sm shadow-critical" /> Detected</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-success shadow-sm shadow-success" /> Resolved</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary" /> Auto-Healing</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 12, borderRadius: 8, padding: '12px' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#F9FAFB' }}
                  />
                  <Area type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#detectedGrad)" />
                  <Area type="monotone" dataKey="resolved" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#resolvedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-border/20 rounded-xl" />
            )}
          </div>
        </div>

        {/* Threat Distribution Donut Chart */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-8 md:p-10 flex flex-col justify-between h-[480px] border border-border/80 shadow-md">
          <div className="border-b border-border pb-5 mb-5">
            <h3 className="font-extrabold text-base text-text uppercase tracking-wider">Threat Distribution</h3>
            <p className="text-sm text-muted mt-1 font-medium">By attack classification categories</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center min-h-[220px] relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-32 h-32 rounded-full border border-border border-t-transparent animate-spin" />
            )}
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-muted uppercase">Total Vectors</span>
              <span className="text-3xl font-black text-text">984</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40 text-sm font-semibold">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT INCIDENTS TABLE */}
      <div className="glass-panel rounded-2xl p-8 md:p-10 border border-border/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 mb-6 gap-4">
          <div>
            <h3 className="font-extrabold text-base text-text uppercase tracking-wider">Active Threats Queue</h3>
            <p className="text-sm text-muted mt-1.5 font-medium">Real-time incident response log. Click to review action details.</p>
          </div>
          <button 
            onClick={() => router.push('/incidents')}
            className="text-sm font-bold text-primary hover:underline flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Incidents</span>
            <ArrowUpRight className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-extrabold text-xs uppercase tracking-wider">
                <th className="py-4.5 px-4">ID</th>
                <th className="py-4.5 px-4">Threat Vector</th>
                <th className="py-4.5 px-4">Server</th>
                <th className="py-4.5 px-4">Severity</th>
                <th className="py-4.5 px-4">Status</th>
                <th className="py-4.5 px-4">Detected</th>
                <th className="py-4.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {incidents.slice(0, 4).map((inc) => (
                <tr 
                  key={inc.id}
                  onClick={() => router.push('/incidents')}
                  className="hover:bg-border/20 cursor-pointer transition-colors group"
                >
                  <td className="py-5 px-4 font-mono font-bold text-primary text-xs">{inc.id}</td>
                  <td className="py-5 px-4 font-bold text-text group-hover:text-primary transition-colors text-sm">{inc.threatName}</td>
                  <td className="py-5 px-4 font-medium text-muted text-sm">{inc.server}</td>
                  <td className="py-5 px-4">
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
                  <td className="py-5 px-4">
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        inc.status === 'resolved' 
                          ? 'bg-success shadow-sm shadow-success' 
                          : inc.status === 'investigating'
                            ? 'bg-warning shadow-sm shadow-warning'
                            : 'bg-critical animate-pulse shadow-sm shadow-critical'
                      }`} />
                      <span className="capitalize">{inc.status}</span>
                    </span>
                  </td>
                  <td className="py-5 px-4 text-muted text-xs font-mono">{inc.createdAt}</td>
                  <td className="py-5 px-4 text-right">
                    {inc.status !== 'resolved' ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(inc.id);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-success/15 hover:bg-success/25 border border-success/35 text-success text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-success font-bold">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: AI SECURITY SUMMARY */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-2xl p-8 md:p-10 border border-primary/25 glow-primary relative overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 right-0 p-4 text-primary/10 pointer-events-none">
          <Sparkles className="h-24 w-24" />
        </div>
        <div className="flex items-start gap-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/35 flex-shrink-0 shadow-md">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-text uppercase tracking-wider flex items-center gap-2">
              <span>SentinelAI Daily Operations Insight</span>
              <span className="bg-success/20 text-success text-xs px-2.5 py-1 rounded font-black uppercase tracking-wider border border-success/30">AI Generated</span>
            </h4>
            <p className="text-sm md:text-base text-muted leading-relaxed max-w-4xl font-medium">
              &ldquo;Today, I ingested and analyzed <strong className="text-text">1,248,912 events</strong> across production subnets. 
              <strong className="text-text"> 3 threat vectors</strong> were identified. 
              <strong className="text-text"> 2 incidents</strong> (credential abuse on `staging-api-01` and DNS tunneling on `prod-web-01`) were autonomously remediated successfully. 
              No lateral movements or unauthorized active directory replication events were detected. 
              System security score remains healthy at <strong className="text-text">92/100</strong>. Recommendation: Execute containment approval for `corp-dc-01` ransomware behavior.&rdquo;
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
