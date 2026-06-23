'use client';

import React, { use, useEffect, useState } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, HardDrive, ShieldAlert, Cpu, Network, CheckCircle, 
  XCircle, AlertTriangle, ShieldCheck, Clock, Settings, RefreshCw, Power 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { 
    servers, 
    incidents, 
    killProcess,
    addLog
  } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const server = servers.find(s => s.id === id);

  if (!server) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-critical">Server Node Not Found</h2>
        <p className="text-xs text-muted">The asset ID "{id}" is not registered in SentinelAI network inventory.</p>
        <button 
          onClick={() => router.push('/servers')}
          className="px-4 py-2 bg-primary text-text rounded-lg text-xs font-bold"
        >
          Return to Assets
        </button>
      </div>
    );
  }

  // Filter incidents related to this server
  const serverIncidents = incidents.filter(i => i.server === server.hostname);

  // Parse CPU & RAM history points into Recharts data
  const historyData = server.cpuHistory.map((cpuVal, idx) => ({
    tick: `T-${7 - idx}s`,
    cpu: cpuVal,
    ram: server.ramHistory[idx] || 50
  }));

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <button 
          onClick={() => router.push('/servers')}
          className="p-1.5 rounded-lg border border-border bg-card hover:bg-border/60 text-muted hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight">{server.hostname}</h1>
            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase ${
              server.status === 'online' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning border-warning/30'
            }`}>
              {server.status}
            </span>
          </div>
          <p className="text-[10px] text-muted font-mono mt-0.5">{server.ipAddress} • OS: {server.os.toUpperCase()}</p>
        </div>
      </div>

      {/* TWO COLUMN GRID DETAILS SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: TELEMETRY & COMPLIANCE CHECKS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Timeline Chart */}
          <div className="glass-panel rounded-xl p-5 flex flex-col h-80">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="font-bold text-xs text-text uppercase tracking-wider">Node Telemetry History</h3>
                <p className="text-[10px] text-muted mt-0.5">CPU & RAM utilisation timeline</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> CPU</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> RAM</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="tick" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: 10 }} />
                    <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                    <Area type="monotone" dataKey="ram" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full animate-pulse bg-border/20 rounded" />
              )}
            </div>
          </div>

          {/* Security Compliance checks */}
          <div className="glass-panel rounded-xl p-5">
            <div className="border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-xs text-text uppercase tracking-wider">Automated Audit & Compliance Checks</h3>
              <p className="text-[10px] text-muted mt-0.5">SentinelAgent CIS benchmark configuration status</p>
            </div>
            
            <div className="space-y-3">
              {server.checks.map((chk) => (
                <div key={chk.id} className="p-3 rounded-lg bg-background/55 border border-border flex items-start gap-3">
                  <div className="mt-0.5">
                    {chk.status === 'passed' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : chk.status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <XCircle className="h-4 w-4 text-critical animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">{chk.title}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border uppercase tracking-wider ${
                        chk.status === 'passed' ? 'bg-success/10 text-success border-success/35' : chk.status === 'warning' ? 'bg-warning/10 text-warning border-warning/35' : 'bg-critical/10 text-critical border-critical/35'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                    <p className="text-muted mt-1 leading-normal">{chk.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Ports List */}
          <div className="glass-panel rounded-xl p-5">
            <div className="border-b border-border pb-2 mb-3">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Open Ingress Ports Matrix</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {server.openPorts.map((port) => (
                <span 
                  key={port} 
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 text-xs font-mono font-bold text-text/95 transition-all"
                >
                  :{port}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 3: RUNNING PROCESSES & SOCKS & AGENT */}
        <div className="space-y-6">
          
          {/* Agent Status Detail Card */}
          <div className="glass-panel rounded-xl p-5">
            <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">SentinelAgent Node Detail</span>
              <Settings className="h-4 w-4 text-muted" />
            </div>

            <div className="text-[11px] space-y-2 text-muted leading-relaxed">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span>Agent Status:</span>
                <span className="font-bold text-success capitalize">{server.agentStatus}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span>Host Platform:</span>
                <span className="font-bold text-text capitalize">{server.os}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span>Core Kernel:</span>
                <span className="font-mono text-text">5.15.0-89-generic</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span>Vulnerability Score:</span>
                <span className="font-bold text-text">{server.securityScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Incident Counts:</span>
                <span className={`font-bold ${serverIncidents.length > 0 ? 'text-critical' : 'text-success'}`}>
                  {serverIncidents.length} Active
                </span>
              </div>
            </div>
          </div>

          {/* Running process controller with Kill actions */}
          <div className="glass-panel rounded-xl p-5 flex flex-col max-h-[350px]">
            <div className="border-b border-border pb-3 mb-4 flex-shrink-0 flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">Process Tree ({server.runningProcesses.length})</span>
              <span className="text-[9px] text-muted">Click to terminate PID</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {server.runningProcesses.map((p) => (
                <div 
                  key={p.pid} 
                  className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between text-[10px] ${
                    p.threatScore > 50 
                      ? 'bg-critical/5 border-critical/40 hover:bg-critical/10' 
                      : 'bg-background/55 border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-text truncate max-w-[130px]">{p.name}</span>
                      <span className="font-mono text-muted text-[9px]">({p.pid})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-muted mt-0.5 font-medium">
                      <span>CPU: {p.cpu}%</span>
                      <span>RAM: {p.ram}%</span>
                    </div>
                  </div>

                  {p.threatScore > 50 ? (
                    <button 
                      onClick={() => killProcess(server.id, p.pid)}
                      className="p-1 rounded bg-critical hover:bg-critical/80 text-text font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                      title="Kill Process"
                    >
                      <Power className="h-3 w-3" /> Kill
                    </button>
                  ) : (
                    <span className="text-[9px] text-muted">Safe</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Network Connections */}
          <div className="glass-panel rounded-xl p-5">
            <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">Active Socket Matrices</span>
              <Network className="h-4 w-4 text-muted" />
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {server.connections.map((c, i) => (
                <div key={i} className="p-2 rounded bg-background/55 border border-border flex items-center justify-between text-[9px] leading-relaxed">
                  <div className="flex flex-col">
                    <span className="font-bold text-text">{c.proto.toUpperCase()} {c.localAddr}</span>
                    <span className="text-muted mt-0.5">← {c.foreignAddr}</span>
                  </div>
                  <span className="font-mono text-muted text-[8px] bg-border/40 px-1 py-0.2 rounded">
                    PID:{c.pid}
                  </span>
                </div>
              ))}
              {server.connections.length === 0 && (
                <div className="text-center text-[10px] text-muted py-6">No network sockets open.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
