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
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Update displayed logs if stream is not paused
  useEffect(() => {
    if (!streamPaused) {
      const timer = setTimeout(() => setDisplayedLogs(logs), 0);
      return () => clearTimeout(timer);
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
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      
      {/* TOP CONTROLS & HEADER BAR - Dynamic flex layout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Autonomous Security Observability</span>
          </h1>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">
            Real-time inspection of raw event stream, connections, and hardware resources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pause/Play Stream */}
          <button 
            onClick={() => setStreamPaused(!streamPaused)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              streamPaused 
                ? 'bg-warning/20 border-warning/40 text-warning' 
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
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
            className="bg-card border border-border rounded-lg text-xs px-3.5 py-2.5 font-medium focus:outline-none cursor-pointer text-text"
          >
            <option value="ALL">All Log Levels</option>
            <option value="INFO">Info Only</option>
            <option value="WARN">Warnings</option>
            <option value="ERROR">Errors</option>
            <option value="ALERT">Alerts</option>
          </select>

          {/* Search Term */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted" />
            <input 
              type="text" 
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              placeholder="Search log stream..."
              className="bg-card border border-border rounded-lg text-xs pl-9 pr-3 py-2.5 w-48 focus:outline-none focus:border-primary/50 transition-colors text-text placeholder:text-muted"
            />
          </div>

          {/* Export button */}
          <button 
            onClick={handleExportLogs}
            className="flex items-center gap-2 bg-card hover:bg-border/60 border border-border px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-muted hover:text-text"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* THREE COLUMN RESPONSIVE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: LIVE LOGS TERMINAL */}
        <div className="lg:col-span-5 glass-panel rounded-xl flex flex-col h-[620px] border-border/80 overflow-hidden">
          <div className="p-5 border-b border-border bg-card/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-text uppercase tracking-wider">Syslog Terminal Stream</span>
            </div>
            {streamPaused && (
              <span className="text-[10px] bg-warning/20 text-warning px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Paused</span>
            )}
          </div>

          <div className="flex-1 bg-black/90 p-5 font-mono text-xs leading-relaxed overflow-y-auto space-y-4 select-text">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 border-b border-white/[0.03] pb-3 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="text-muted/70 text-[10px]">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.level === 'INFO' 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : log.level === 'WARN'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : log.level === 'ERROR'
                          ? 'bg-critical/20 text-critical border border-critical/30'
                          : 'bg-critical text-text font-black border border-critical glow-critical'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-primary font-bold text-xs">[{log.server}]</span>
                </div>
                <span className="text-muted hover:text-text transition-colors leading-normal text-xs font-medium pl-1">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* COLUMN 2: NETWORK Observability */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Traffic Throughput */}
          <div className="glass-panel rounded-xl p-6 flex flex-col h-72">
            <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-text uppercase tracking-wider">Network Throughput</span>
              </div>
              <span className="text-xs text-muted font-bold font-mono">1.2 MB/s</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={8} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 10, borderRadius: 6 }} />
                    <Line type="monotone" dataKey="ingress" stroke="#3B82F6" strokeWidth={2} dot={false} name="Ingress (kbps)" />
                    <Line type="monotone" dataKey="egress" stroke="#22C55E" strokeWidth={2} dot={false} name="Egress (kbps)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full animate-pulse bg-border/20 rounded" />
              )}
            </div>
          </div>

          {/* Active Sockets */}
          <div className="glass-panel rounded-xl p-6 flex flex-col h-[320px]">
            <div className="border-b border-border pb-3.5 mb-5 flex-shrink-0 flex items-center justify-between">
              <span className="text-sm font-bold text-text uppercase tracking-wider">Active Sockets ({activeServer.connections.length})</span>
              <span className="text-xs text-primary font-mono">{activeServer.hostname}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeServer.connections.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/60 border border-border flex items-center justify-between text-xs">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-text">{c.proto.toUpperCase()} {c.localAddr}</span>
                    <span className="text-muted mt-0.5 font-mono text-[10px]">← {c.foreignAddr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted text-[10px]">PID:{c.pid}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                <div className="text-center text-xs text-muted py-8 font-medium">No active connections.</div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMN 3: TELEMETRY DIALS & PROCESSES & BLOCKED IPS */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Node Dials */}
          <div className="glass-panel rounded-xl p-6 flex flex-col">
            <div className="border-b border-border pb-3.5 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-text uppercase tracking-wider">Node Hardware Dials</span>
              </div>
              <span className="text-xs text-muted font-mono">{activeServer.hostname}</span>
            </div>

            <div className="grid grid-cols-3 gap-3.5 py-1.5">
              {[
                { label: 'CPU', val: activeServer.cpuUsage, color: activeServer.cpuUsage > 75 ? 'text-critical' : activeServer.cpuUsage > 50 ? 'text-warning' : 'text-success' },
                { label: 'RAM', val: activeServer.ramUsage, color: activeServer.ramUsage > 80 ? 'text-critical' : activeServer.ramUsage > 60 ? 'text-warning' : 'text-success' },
                { label: 'DISK', val: activeServer.diskUsage, color: 'text-primary' }
              ].map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-background/55 border border-border flex flex-col items-center">
                  <span className="text-[10px] text-muted font-semibold uppercase">{d.label}</span>
                  <div className="relative flex items-center justify-center my-1.5 h-11 w-11 rounded-full border border-border">
                    <svg className="w-9 h-9 transform -rotate-90">
                      <circle cx="18" cy="18" r="15" stroke="#1F2937" strokeWidth="2.5" fill="transparent" />
                      <circle 
                        cx="18" cy="18" r="15" 
                        stroke={d.color === 'text-critical' ? '#EF4444' : d.color === 'text-warning' ? '#F59E0B' : d.color === 'text-success' ? '#22C55E' : '#3B82F6'} 
                        strokeWidth="2.5" 
                        fill="transparent" 
                        strokeDasharray="94.2"
                        strokeDashoffset={94.2 - (94.2 * d.val) / 100}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold">{d.val}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Running Processes */}
          <div className="glass-panel rounded-xl p-6 flex flex-col h-[320px]">
            <span className="text-sm font-bold text-text uppercase tracking-wider mb-5 block border-b border-border pb-3.5">
              Active Processes ({activeServer.runningProcesses.length})
            </span>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeServer.runningProcesses.map((p, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-between text-xs ${
                    p.threatScore > 50 
                      ? 'bg-critical/10 border-critical/40' 
                      : 'bg-background/55 border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col text-left truncate max-w-[130px]">
                    <span className="font-bold text-text truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-muted">PID: {p.pid} • CPU: {p.cpu}%</span>
                  </div>

                  {p.threatScore > 50 ? (
                    <button 
                      onClick={() => killProcess(activeServer.id, p.pid)}
                      className="px-2.5 py-1.5 rounded bg-critical hover:bg-critical/80 text-text font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Power className="h-2.5 w-2.5" /> Kill
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted font-semibold">Safe</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blocked IPs block */}
          <div className="glass-panel rounded-xl p-6">
            <span className="text-sm font-bold text-text uppercase tracking-wider block mb-4 border-b border-border pb-3.5">
              Automated Blocked IPs
            </span>
            <div className="space-y-2.5">
              {blockedIPs.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-critical/5 border border-critical/20 text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[170px]">
                    <ShieldX className="h-4 w-4 text-critical flex-shrink-0" />
                    <span className="font-bold text-text font-mono truncate">{b.ip}</span>
                  </div>
                  <span className="text-muted text-[10px]">{b.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
