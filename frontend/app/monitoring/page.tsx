'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/store/app-context';
import { 
  Play, Pause, Search, Download,
  Terminal, Activity, Cpu, ShieldX, Power, Wifi
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { ActionButton } from '@/components/ui/action-button';
import { StatusChip } from '@/components/ui/status-chip';

export default function MonitoringPage() {
  const { 
    logs, 
    servers, 
    killProcess,
    selectedServerId
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'ALERT'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  // Custom buffered log list to support play/pause behavior
  const [displayedLogs, setDisplayedLogs] = useState(logs);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Update displayed logs if stream is not paused — NO autoscroll
  useEffect(() => {
    if (!streamPaused) {
      const timer = setTimeout(() => setDisplayedLogs(logs), 0);
      return () => clearTimeout(timer);
    }
  }, [logs, streamPaused]);

  // Active server details for CPU/RAM dials
  const activeServer = servers.find(s => s.id === (selectedServerId === 'all' ? 'prod-web-01' : selectedServerId)) || servers[0];

  // Filtering logs
  const filteredLogs = displayedLogs.filter(log => {
    const matchesLevel = logLevelFilter === 'ALL' || log.level === logLevelFilter;
    const matchesSearch = log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                          log.server.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesServer = selectedServerId === 'all' || 
                          log.server === (servers.find(s => s.id === selectedServerId)?.hostname);

    return matchesLevel && matchesSearch && matchesServer;
  });

  // Traffic charts mock data
  const [trafficData, setTrafficData] = useState<Array<{ time: string; ingress: number; egress: number }>>(() => {
    const data = [];
    for (let i = 10; i >= 0; i--) {
      const now = new Date(Date.now() - i * 5000);
      data.push({
        time: now.toLocaleTimeString().split(' ')[0].slice(-5),
        ingress: Math.floor(Math.random() * 300) + 100,
        egress: Math.floor(Math.random() * 200) + 50
      });
    }
    return data;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (streamPaused) return;
      setTrafficData(prev => {
        const nextTime = new Date().toLocaleTimeString().split(' ')[0].slice(-5);
        const nextVal = {
          time: nextTime,
          ingress: Math.floor(Math.random() * 300) + 100,
          egress: Math.floor(Math.random() * 200) + 50
        };
        return [...prev.slice(1), nextVal];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [streamPaused]);

  // Export logs simulation
  const handleExportLogs = () => {
    const logsText = filteredLogs.map(l => `[${l.timestamp}] [${l.level}] [${l.server}] ${l.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel_logs_${selectedServerId}_${Date.now()}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Blocked IPs List
  const blockedIPs = [
    { ip: '185.220.101.4', reason: 'Tor Exit Node / API Abuse', time: '10m ago' },
    { ip: '203.0.113.50', reason: 'SSH Brute Force Attack', time: '2m ago' },
    { ip: '91.240.118.15', reason: 'Botnet Port Scanner', time: '1h ago' }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Autonomous Security Observability" 
        description="Real-time inspection of raw event stream, connections, and hardware resources."
        icon={Activity}
        rightElement={
          <div className="flex flex-wrap items-center gap-3">
            {/* Pause/Play Stream */}
            <ActionButton 
              onClick={() => setStreamPaused(!streamPaused)}
              variant={streamPaused ? 'outline' : 'secondary'}
              size="md"
              className={streamPaused ? 'border-warning/40 text-warning bg-warning/15 hover:bg-warning/25' : ''}
            >
              {streamPaused ? (
                <span className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume Stream</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause Stream</span>
                </span>
              )}
            </ActionButton>

            {/* Log Level Filter */}
            <select
              value={logLevelFilter}
              onChange={(e: any) => setLogLevelFilter(e.target.value)}
              className="bg-secondary-surface border border-border rounded-input text-[12px] h-10 px-3.5 font-bold focus:outline-none cursor-pointer text-text hover:bg-border/40 transition-colors"
            >
              <option value="ALL" className="bg-card">All Log Levels</option>
              <option value="INFO" className="bg-card">Info Only</option>
              <option value="WARN" className="bg-card">Warnings</option>
              <option value="ERROR" className="bg-card">Errors</option>
              <option value="ALERT" className="bg-card">Alerts</option>
            </select>

            {/* Search Term */}
            <div className="relative">
              <Search className="absolute left-3 h-3.5 w-3.5 text-muted" style={{ top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search log stream..."
                className="bg-secondary-surface border border-border rounded-input text-small-text pl-9 pr-3 h-10 w-48 focus:outline-none focus:border-primary/60 transition-colors text-text font-mono"
              />
            </div>

            {/* Export button */}
            <ActionButton 
              onClick={handleExportLogs}
              variant="outline"
              size="md"
              className="flex items-center gap-2 text-secondary-text hover:text-text"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Logs</span>
            </ActionButton>
          </div>
        }
      />

      {/* ═══════════════════════════════════════════ */}
      {/* BENTO GRID LAYOUT                          */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-[20px]">

        {/* Row 1: Left (Syslog Terminal) + Right Column (Node Hardware & Active Processes) */}
        
        {/* ── CELL 1: SYSLOG TERMINAL (col-span-8) ── */}
        <div className="col-span-8 h-[600px] bg-[#151515] rounded-card border border-border flex flex-col overflow-hidden">
          {/* Terminal Header */}
          <div className="px-5 py-4 border-b border-border bg-[#111111] flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-caption font-bold text-text uppercase tracking-wider">Syslog Terminal Stream</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#71717A] font-mono font-bold">{filteredLogs.length} entries</span>
              {streamPaused && (
                <span className="text-[10px] bg-warning/10 text-warning border border-warning/20 px-2.5 py-0.5 rounded-badge font-bold uppercase tracking-wider animate-pulse">Paused</span>
              )}
            </div>
          </div>

          {/* Terminal Body — NO autoscroll */}
          <div className="bg-[#090909] p-5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-4 select-text" style={{ height: 'calc(600px - 53px)' }}>
            {filteredLogs.length === 0 && (
              <div className="text-center text-[#71717A]/60 py-16 text-caption">No log entries match the current filter.</div>
            )}
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 border-b border-border/10 pb-3 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#71717A] text-[9px]">{log.timestamp}</span>
                  <StatusChip status={log.level.toLowerCase()} />
                  <span className="text-primary font-bold text-[10px]">[{log.server}]</span>
                </div>
                <span className="text-[#A1A1AA] hover:text-text transition-colors leading-normal font-normal pl-1">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Node Hardware & Active Processes) (col-span-4) */}
        <div className="col-span-4 flex flex-col gap-[20px] h-[600px]">
          
          {/* ── CELL 2: NODE HARDWARE ── */}
          <div className="flex-1 bg-[#151515] rounded-card border border-border p-5 flex flex-col justify-between min-h-0">
            <div className="border-b border-border pb-3 mb-3 flex items-center justify-between select-none flex-shrink-0">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-caption font-bold text-text uppercase tracking-wider">Node Hardware</span>
              </div>
              <span className="text-caption text-[#71717A] font-mono font-bold">{activeServer?.hostname}</span>
            </div>

            {/* Dials Row */}
            <div className="grid grid-cols-3 gap-3 flex-1 items-center py-1 min-h-0">
              {[
                { label: 'CPU', val: activeServer?.cpuUsage ?? 0, status: (activeServer?.cpuUsage ?? 0) > 75 ? 'critical' : (activeServer?.cpuUsage ?? 0) > 50 ? 'warning' : 'healthy' },
                { label: 'RAM', val: activeServer?.ramUsage ?? 0, status: (activeServer?.ramUsage ?? 0) > 80 ? 'critical' : (activeServer?.ramUsage ?? 0) > 60 ? 'warning' : 'healthy' },
                { label: 'DISK', val: activeServer?.diskUsage ?? 0, status: 'healthy' }
              ].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5 p-2 rounded-input bg-[#111111] border border-border">
                  <span className="text-[9px] text-[#71717A] font-bold uppercase tracking-wider">{d.label}</span>
                  <div style={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                      <circle cx="24" cy="24" r="20" stroke="#262626" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="24" cy="24" r="20"
                        stroke={d.status === 'critical' ? '#EF4444' : d.status === 'warning' ? '#F59E0B' : '#22C55E'}
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 - (125.6 * d.val) / 100}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                    </svg>
                    <span style={{ position: 'relative', zIndex: 1, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: d.status === 'critical' ? '#EF4444' : d.status === 'warning' ? '#F59E0B' : '#22C55E' }}>
                      {d.val}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CELL 3: ACTIVE PROCESSES ── */}
          <div className="h-[320px] bg-[#151515] rounded-card border border-border p-5 flex flex-col min-h-0">
            <div className="border-b border-border pb-3 mb-3 flex-shrink-0 flex items-center justify-between select-none">
              <span className="text-caption font-bold text-text uppercase tracking-wider">
                Active Processes
              </span>
              <span className="text-caption text-primary font-mono font-bold">{activeServer?.runningProcesses?.length ?? 0} running</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              {activeServer?.runningProcesses?.map((p, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-input border transition-colors flex items-center justify-between text-caption ${
                    p.threatScore > 50
                      ? 'bg-critical/10 border-critical/20'
                      : 'bg-[#111111] border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col text-left truncate font-normal" style={{ maxWidth: '140px' }}>
                    <span className="font-bold text-text truncate">{p.name}</span>
                    <span className="text-[9px] font-mono text-[#71717A] mt-0.5">PID: {p.pid} · CPU: {p.cpu}%</span>
                  </div>
                  {p.threatScore > 50 ? (
                    <ActionButton
                      onClick={() => killProcess(activeServer.id, p.pid)}
                      variant="danger"
                      size="sm"
                      className="px-2 py-0.5 h-6 text-[9px] flex items-center gap-1 font-bold uppercase tracking-wider flex-shrink-0"
                    >
                      <Power className="h-2.5 w-2.5" /> Kill
                    </ActionButton>
                  ) : (
                    <span className="text-[9px] text-success font-bold uppercase tracking-wider select-none pr-1 flex-shrink-0">Safe</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Row 2: Network Throughput + Sockets + Blocked IPs */}

        {/* ── CELL 4: NETWORK THROUGHPUT (col-span-7) ── */}
        <div className="col-span-7 h-[280px] bg-[#151515] rounded-card border border-border p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3 flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-caption font-bold text-text uppercase tracking-wider">Network Throughput</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-caption text-[#71717A] font-mono">
                <span className="h-2 w-2 rounded-badge bg-information" />
                Ingress
              </span>
              <span className="flex items-center gap-1.5 text-caption text-[#71717A] font-mono">
                <span className="h-2 w-2 rounded-badge bg-success" />
                Egress
              </span>
              <span className="text-caption text-text font-bold font-mono">1.2 MB/s</span>
            </div>
          </div>

          <div className="w-full flex-1" style={{ height: '180px' }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={trafficData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderColor: '#262626', fontSize: 10, borderRadius: 12 }}
                    labelStyle={{ color: '#71717A' }}
                  />
                  <Line type="monotone" dataKey="ingress" stroke="#3B82F6" strokeWidth={2} dot={false} name="Ingress (kbps)" />
                  <Line type="monotone" dataKey="egress" stroke="#22C55E" strokeWidth={2} dot={false} name="Egress (kbps)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-border/20 rounded-card" />
            )}
          </div>
        </div>

        {/* ── CELL 5: ACTIVE SOCKETS (col-span-3) ── */}
        <div className="col-span-3 h-[280px] bg-[#151515] rounded-card border border-border p-5 flex flex-col">
          <div className="border-b border-border pb-3 mb-3 flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-caption font-bold text-text uppercase tracking-wider">Active Sockets</span>
            </div>
            <span className="text-caption text-primary font-mono font-bold">{activeServer?.connections?.length ?? 0}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {activeServer?.connections?.map((c, i) => (
              <div key={i} className="p-2.5 rounded-input bg-[#111111] border border-border flex items-center justify-between text-caption animate-fade-in">
                <div className="flex flex-col text-left font-normal truncate">
                  <span className="font-bold text-text text-[9px] truncate">{c.proto.toUpperCase()} {c.localAddr}</span>
                  <span className="text-[#71717A] mt-0.5 font-mono text-[8px] truncate">← {c.foreignAddr}</span>
                </div>
                <StatusChip status={c.state === 'ESTABLISHED' ? 'resolved' : 'pending'} />
              </div>
            ))}
            {(activeServer?.connections?.length ?? 0) === 0 && (
              <div className="text-center text-caption text-[#71717A] py-8 font-normal">No active connections.</div>
            )}
          </div>
        </div>

        {/* ── CELL 6: BLOCKED IPs (col-span-2) ── */}
        <div className="col-span-2 h-[280px] bg-[#151515] rounded-card border border-border p-5 flex flex-col">
          <div className="border-b border-border pb-3 mb-3 flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <ShieldX className="h-4 w-4 text-critical" />
              <span className="text-caption font-bold text-text uppercase tracking-wider">Blocked IPs</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {blockedIPs.map((b, i) => (
              <div key={i} className="flex flex-col gap-1 p-3 rounded-input bg-critical/10 border border-critical/20 text-caption font-normal">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text font-mono text-[10px]">{b.ip}</span>
                  <span className="text-[#71717A] text-[9px] font-bold flex-shrink-0">{b.time}</span>
                </div>
                <span className="text-[#A1A1AA] text-[9px] leading-normal">{b.reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
