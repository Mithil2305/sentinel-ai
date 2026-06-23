'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/store/app-context';
import { 
  Play, Pause, Search, Download, Trash, ShieldAlert,
  Terminal, Activity, HardDrive, Cpu, ShieldX, Power, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function MonitoringPage() {
  const { 
    logs, 
    servers, 
    killProcess,
    selectedServerId,
    setSelectedServerId
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'ALERT'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  // Custom buffered log list to support play/pause behavior
  const [displayedLogs, setDisplayedLogs] = useState(logs);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update displayed logs if stream is not paused
  useEffect(() => {
    if (!streamPaused) {
      setDisplayedLogs(logs);
    }
  }, [logs, streamPaused]);

  // Terminal scroll box
  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!streamPaused) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedLogs, streamPaused]);

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
  const [trafficData, setTrafficData] = useState<Array<{ time: string; ingress: number; egress: number }>>([]);

  useEffect(() => {
    // Generate some history
    const data = [];
    for (let i = 10; i >= 0; i--) {
      const now = new Date(Date.now() - i * 5000);
      data.push({
        time: now.toLocaleTimeString().split(' ')[0].slice(-5),
        ingress: Math.floor(Math.random() * 300) + 100,
        egress: Math.floor(Math.random() * 200) + 50
      });
    }
    setTrafficData(data);

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
    <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-5 h-[83vh] overflow-hidden">
      
      {/* TOP CONTROLS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border pb-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Autonomous Security Observability</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">Real-time inspection of raw event stream, connections, and hardware resources.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pause/Play Stream */}
          <button 
            onClick={() => setStreamPaused(!streamPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              streamPaused 
                ? 'bg-warning/20 border-warning/35 text-warning' 
                : 'bg-primary/10 border-primary/25 text-primary hover:bg-primary/20'
            }`}
          >
            {streamPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Resume Stream</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause Stream</span>
              </>
            )}
          </button>

          {/* Log Level Filter */}
          <select
            value={logLevelFilter}
            onChange={(e: any) => setLogLevelFilter(e.target.value)}
            className="bg-card border border-border rounded-lg text-xs px-2.5 py-1.5 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info Only</option>
            <option value="WARN">Warnings</option>
            <option value="ERROR">Errors</option>
            <option value="ALERT">Alerts</option>
          </select>

          {/* Search Term */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
            <input 
              type="text" 
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              placeholder="Search logs message..."
              className="bg-card border border-border rounded-lg text-xs pl-8 pr-3 py-1.5 w-40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Export button */}
          <button 
            onClick={handleExportLogs}
            className="flex items-center gap-1 bg-card hover:bg-border/60 border border-border px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-muted" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* THREE COLUMN GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 min-h-0 overflow-hidden">
        
        {/* COLUMN 1: LIVE LOGS TERMINAL */}
        <div className="glass-panel rounded-xl flex flex-col min-h-0 overflow-hidden border-border/80">
          <div className="p-3 border-b border-border bg-card/40 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-text uppercase tracking-wider">Syslog Terminal Stream</span>
            </div>
            {streamPaused && (
              <span className="text-[9px] bg-warning/20 text-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Paused</span>
            )}
          </div>

          <div className="flex-1 bg-black/90 p-4 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-2.5 select-text">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1.5 group border-b border-white/[0.02] pb-1.5">
                <span className="text-muted flex-shrink-0">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded-[3px] text-[8px] font-bold flex-shrink-0 ${
                  log.level === 'INFO' 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : log.level === 'WARN'
                      ? 'bg-warning/20 text-warning border border-warning/30'
                      : log.level === 'ERROR'
                        ? 'bg-critical/20 text-critical border border-critical/30 animate-pulse'
                        : 'bg-critical border border-critical text-text font-black glow-critical animate-pulse'
                }`}>
                  {log.level}
                </span>
                <span className="text-primary font-bold hover:underline cursor-pointer flex-shrink-0">[{log.server}]</span>
                <span className="text-muted group-hover:text-text transition-colors break-all">{log.message}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* COLUMN 2: NETWORK Observability */}
        <div className="flex flex-col gap-5 min-h-0">
          
          {/* Traffic Throughput */}
          <div className="glass-panel rounded-xl p-4 flex flex-col h-1/2 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-text uppercase tracking-wider">Network Throughput</span>
              </div>
              <span className="text-[10px] text-muted font-bold font-mono">1.2 MB/s</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={8} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 9 }} />
                    <Line type="monotone" dataKey="ingress" stroke="#3B82F6" strokeWidth={2} dot={false} name="Ingress (kbps)" />
                    <Line type="monotone" dataKey="egress" stroke="#22C55E" strokeWidth={2} dot={false} name="Egress (kbps)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full animate-pulse bg-border/20 rounded" />
              )}
            </div>
          </div>

          {/* Connection Sockets & Blocked IPs */}
          <div className="glass-panel rounded-xl p-4 flex-1 min-h-0 flex flex-col">
            <div className="border-b border-border pb-2 mb-3 flex-shrink-0 flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">Active Sockets ({activeServer.connections.length})</span>
              <span className="text-[9px] text-muted">{activeServer.hostname}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {activeServer.connections.map((c, i) => (
                <div key={i} className="p-2 rounded bg-background/55 border border-border flex items-center justify-between text-[10px]">
                  <div className="flex flex-col">
                    <span className="font-bold text-text">{c.proto.toUpperCase()} {c.localAddr}</span>
                    <span className="text-muted mt-0.5">← {c.foreignAddr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted text-[9px]">PID: {c.pid}</span>
                    <span className={`px-1.5 py-0.2 rounded-[3px] text-[8px] font-bold ${
                      c.state === 'ESTABLISHED' 
                        ? 'bg-success/20 text-success border border-success/35' 
                        : 'bg-primary/20 text-primary border border-primary/35'
                    }`}>
                      {c.state}
                    </span>
                  </div>
                </div>
              ))}
              {activeServer.connections.length === 0 && (
                <div className="text-center text-[10px] text-muted py-6">No active sockets.</div>
              )}
            </div>

            {/* Blocked IPs block */}
            <div className="border-t border-border pt-3 flex-shrink-0">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">Automated Blocked Host IPs</span>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {blockedIPs.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-critical/5 border border-critical/15 text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <ShieldX className="h-3.5 w-3.5 text-critical" />
                      <span className="font-bold text-text font-mono">{b.ip}</span>
                      <span className="text-muted truncate max-w-[120px]">({b.reason})</span>
                    </div>
                    <span className="text-muted">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* COLUMN 3: SYSTEM HEALTH RESOURCE DIALS & ACTIVE PROCESSES */}
        <div className="glass-panel rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
          
          {/* Node hardware health */}
          <div className="border-b border-border pb-2 mb-3 flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-text uppercase tracking-wider">Telemetry Dial Status</span>
            </div>
            <span className="text-[10px] text-muted font-bold font-mono">{activeServer.hostname}</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4 flex-shrink-0">
            {[
              { label: 'CPU Usage', val: activeServer.cpuUsage, color: activeServer.cpuUsage > 75 ? 'text-critical' : activeServer.cpuUsage > 50 ? 'text-warning' : 'text-success' },
              { label: 'RAM Usage', val: activeServer.ramUsage, color: activeServer.ramUsage > 80 ? 'text-critical' : activeServer.ramUsage > 60 ? 'text-warning' : 'text-success' },
              { label: 'Disk IO', val: activeServer.diskUsage, color: 'text-primary' }
            ].map((d, i) => (
              <div key={i} className="p-2 rounded bg-background/55 border border-border flex flex-col items-center">
                <span className="text-[9px] text-muted font-semibold uppercase">{d.label}</span>
                {/* Circular indicator */}
                <div className="relative flex items-center justify-center my-1.5 h-12 w-12 rounded-full border border-border">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="#1F2937" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="20" cy="20" r="16" 
                      stroke={d.color === 'text-critical' ? '#EF4444' : d.color === 'text-warning' ? '#F59E0B' : d.color === 'text-success' ? '#22C55E' : '#3B82F6'} 
                      strokeWidth="3" 
                      fill="transparent" 
                      strokeDasharray="100.4"
                      strokeDashoffset={100.4 - (100.4 * d.val) / 100}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold">{d.val}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Running process list with kill action */}
          <div className="flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block flex-shrink-0">Active Running Processes</span>
            <div className="flex-1 overflow-y-auto space-y-2">
              {activeServer.runningProcesses.map((p, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded border transition-colors flex items-center justify-between text-[10px] ${
                    p.threatScore > 50 
                      ? 'bg-critical/5 border-critical/30 hover:bg-critical/10' 
                      : 'bg-background/55 border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-text truncate max-w-[140px]">{p.name}</span>
                      <span className="text-[9px] font-mono text-muted">({p.pid})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-muted mt-0.5">
                      <span>CPU: {p.cpu}%</span>
                      <span>RAM: {p.ram}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.threatScore > 50 ? (
                      <button 
                        onClick={() => killProcess(activeServer.id, p.pid)}
                        className="p-1 rounded bg-critical hover:bg-critical/80 text-text font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                        title="Kill malicious process"
                      >
                        <Power className="h-3 w-3" /> Kill
                      </button>
                    ) : (
                      <span className="text-[9px] text-muted">Safe</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
