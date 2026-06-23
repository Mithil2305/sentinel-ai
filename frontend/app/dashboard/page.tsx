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
    setMounted(true);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* SECTION 1: HERO AI SECURITY POSTURE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-xl p-6 glow-primary overflow-hidden relative"
      >
        {/* Glow absolute circles */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />
        <div className="absolute right-12 top-0 w-72 h-72 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center h-28 w-28 rounded-full border border-border bg-background/80">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#1F2937" strokeWidth="8" fill="transparent" />
                <motion.circle 
                  cx="48" cy="48" r="40" 
                  stroke={securityScore >= 90 ? '#22C55E' : securityScore >= 70 ? '#F59E0B' : '#EF4444'} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="251.2"
                  animate={{ strokeDashoffset: 251.2 - (251.2 * securityScore) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold tracking-tight text-text">{securityScore}</span>
                <span className="text-[10px] font-bold text-muted uppercase">Score</span>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Security Posture Status:</h1>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border uppercase tracking-wider`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-xs text-muted mt-1 max-w-lg leading-relaxed">
                {securityScore >= 90 
                  ? 'All autonomous policies are fully operational. Host integrity check verification completes cleanly without unexpected root escalations.'
                  : 'Action recommended: Resolve pending high-entropy cryptographic payloads to return to normal posture metrics.'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => router.push('/approvals')}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-text hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Review Approvals ({pendingApprovalsCount})</span>
            </button>
            <button 
              onClick={() => router.push('/monitoring')}
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card hover:bg-border/60 px-4 py-2.5 text-xs font-bold text-text transition-all cursor-pointer"
            >
              <Activity className="h-4 w-4 text-primary" />
              <span>Live Streams</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between h-32 relative group"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{c.title}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            
            <div className="my-2">
              <span className="text-xl md:text-2xl font-bold tracking-tight">{c.val}</span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-[9px] text-muted truncate max-w-[100px]">{c.sub}</span>
              {c.trendVal && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  c.trend === 'up' 
                    ? 'bg-success/15 text-success' 
                    : c.trend === 'down' 
                      ? 'bg-primary/15 text-primary'
                      : c.trend === 'warn'
                        ? 'bg-warning/15 text-warning animate-pulse'
                        : 'bg-border text-muted'
                }`}>
                  {c.trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
                  {c.trend === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
                  {c.trendVal}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS CONTAINER (SECTION 3 & SECTION 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Threat Activity Area Chart */}
        <div className="md:col-span-2 glass-panel rounded-xl p-5 flex flex-col justify-between h-96 relative">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h3 className="font-bold text-xs text-text uppercase tracking-wider">Threat Activity Timeline</h3>
              <p className="text-[10px] text-muted mt-0.5">Detections vs Auto-remediations (7-day window)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-critical" /> Detected</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Resolved</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Auto-Healing</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[220px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatHistoryData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 10, borderRadius: 6 }} 
                    labelStyle={{ fontWeight: 'bold', color: '#F9FAFB' }}
                  />
                  <Area type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#detectedGrad)" />
                  <Area type="monotone" dataKey="resolved" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#resolvedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-border/20 rounded" />
            )}
          </div>
        </div>

        {/* Threat Distribution Donut Chart */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between h-96">
          <div className="border-b border-border pb-3 mb-4">
            <h3 className="font-bold text-xs text-text uppercase tracking-wider">Threat Distribution</h3>
            <p className="text-[10px] text-muted mt-0.5">By attack classification categories</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center min-h-[180px] relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 10, borderRadius: 6 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-28 h-28 rounded-full border border-border border-t-transparent animate-spin" />
            )}
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-muted">Total Detections</span>
              <span className="text-xl font-extrabold text-text">984</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT INCIDENTS TABLE */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div>
            <h3 className="font-bold text-xs text-text uppercase tracking-wider">Active Threats Queue</h3>
            <p className="text-[10px] text-muted mt-0.5">Real-time incident response log. Click to review action details.</p>
          </div>
          <button 
            onClick={() => router.push('/incidents')}
            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase">
                <th className="py-2.5">ID</th>
                <th className="py-2.5">Threat Vector</th>
                <th className="py-2.5">Server</th>
                <th className="py-2.5">Severity</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Detected</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 4).map((inc) => (
                <tr 
                  key={inc.id}
                  onClick={() => router.push('/incidents')}
                  className="border-b border-border/40 hover:bg-border/20 cursor-pointer transition-colors group"
                >
                  <td className="py-3 font-mono font-bold text-primary text-[10px]">{inc.id}</td>
                  <td className="py-3 font-semibold text-text group-hover:text-primary transition-colors">{inc.threatName}</td>
                  <td className="py-3 font-medium text-muted">{inc.server}</td>
                  <td className="py-3">
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
                  <td className="py-3">
                    <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        inc.status === 'resolved' 
                          ? 'bg-success' 
                          : inc.status === 'investigating'
                            ? 'bg-warning'
                            : 'bg-critical animate-pulse'
                      }`} />
                      <span className="capitalize">{inc.status}</span>
                    </span>
                  </td>
                  <td className="py-3 text-muted">{inc.createdAt}</td>
                  <td className="py-3 text-right">
                    {inc.status !== 'resolved' ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(inc.id);
                        }}
                        className="px-2 py-1 rounded bg-success/15 hover:bg-success/25 border border-success/30 text-success text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[10px] text-success font-semibold">Done</span>
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
        className="glass-panel rounded-xl p-5 border border-primary/20 glow-primary relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 text-primary/10 pointer-events-none">
          <Sparkles className="h-20 w-20" />
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary border border-primary/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-text uppercase tracking-wider flex items-center gap-1.5">
              <span>SentinelAI Daily Operations Insight</span>
              <span className="bg-success/20 text-success text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">AI Generated</span>
            </h4>
            <p className="text-xs text-muted mt-2 leading-relaxed max-w-4xl">
              "Today, I ingested and analyzed **1,248,912 events** across production subnets. 
              **3 threat vectors** were identified. 
              **2 incidents** (credential abuse on `staging-api-01` and DNS tunneling on `prod-web-01`) were autonomously remediated successfully. 
              **No lateral movements** or unauthorized active active directory replication events were detected. 
              System security score remains healthy at **92/100**. Recommendation: Execute containment approval for `corp-dc-01` ransomware behavior."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
