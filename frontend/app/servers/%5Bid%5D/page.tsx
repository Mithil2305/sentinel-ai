'use client';

import React, { use, useEffect, useState } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Cpu, Network, CheckCircle, 
  XCircle, AlertTriangle, Settings, Power 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { ActionButton } from '@/components/ui/action-button';
import { StatusChip } from '@/components/ui/status-chip';

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { 
    servers, 
    incidents, 
    killProcess
  } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const server = servers.find(s => s.id === id);

  if (!server) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 select-none">
        <h2 className="text-subsection font-bold text-critical">Server Node Not Found</h2>
        <p className="text-caption text-muted">The asset ID &ldquo;{id}&rdquo; is not registered in SentinelAI network inventory.</p>
        <ActionButton 
          onClick={() => router.push('/servers')}
          variant="primary"
        >
          Return to Assets
        </ActionButton>
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
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="flex items-start gap-4 border-b border-border pb-5 mb-8">
        <ActionButton 
          onClick={() => router.push('/servers')}
          variant="outline"
          size="sm"
          className="p-2 h-10 w-10 flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </ActionButton>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-subsection font-bold text-text leading-none">{server.hostname}</h1>
            <StatusChip status={server.status === 'online' ? 'healthy' : server.status} />
          </div>
          <p className="text-caption text-muted font-mono mt-2 font-normal">
            Node Address: <strong className="text-text font-bold">{server.ipAddress}</strong> • OS Platform: <strong className="text-text font-bold">{server.os.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* TWO COLUMN GRID DETAILS SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMN 1 & 2: TELEMETRY & COMPLIANCE CHECKS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Timeline Chart */}
          <div className="glass-panel rounded-card p-card-padding flex flex-col h-80 border border-border/80 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5 select-none">
              <div>
                <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Node Telemetry History</h3>
                <p className="text-caption text-muted mt-1 font-normal">CPU & RAM utilisation timeline</p>
              </div>
              <div className="flex items-center gap-3.5 text-caption font-bold">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-badge bg-primary" /> CPU</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-badge bg-success" /> RAM</span>
              </div>
            </div>

            <div className="w-full h-[180px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                <div className="w-full h-full animate-pulse bg-border/20 rounded-card" />
              )}
            </div>
          </div>

          {/* Security Compliance checks */}
          <div className="glass-panel rounded-card p-card-padding border border-border/80 shadow-md">
            <div className="border-b border-border pb-3.5 mb-5 select-none">
              <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Automated Audit & Compliance Checks</h3>
              <p className="text-caption text-muted mt-1 font-normal">SentinelAgent CIS benchmark configuration status</p>
            </div>
            
            <div className="space-y-4">
              {server.checks.map((chk) => (
                <div key={chk.id} className="p-4.5 rounded-input bg-background/55 border border-border flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {chk.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : chk.status === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <XCircle className="h-5 w-5 text-critical animate-pulse" />
                    )}
                  </div>
                  <div className="text-caption leading-relaxed font-normal">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-text text-small-text">{chk.title}</span>
                      <StatusChip status={chk.status === 'passed' ? 'healthy' : chk.status === 'warning' ? 'warning' : 'critical'} />
                    </div>
                    <p className="text-muted mt-1.5 leading-normal">{chk.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Ports List */}
          <div className="glass-panel rounded-card p-card-padding border border-border/80 shadow-md">
            <div className="border-b border-border pb-3 mb-4 select-none">
              <span className="text-caption font-bold text-text uppercase tracking-wider block">Open Ingress Ports Matrix</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {server.openPorts.map((port) => (
                <span 
                  key={port} 
                  className="px-4 py-2 rounded-input border border-border bg-card hover:border-primary/30 text-caption font-mono font-bold text-text/95 transition-all select-none"
                >
                  :{port}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 3: RUNNING PROCESSES & SOCKS & AGENT */}
        <div className="space-y-8">
          
          {/* Agent Status Detail Card */}
          <div className="glass-panel rounded-card p-6 border border-border/80 shadow-md">
            <div className="border-b border-border pb-3.5 mb-5 flex items-center justify-between select-none">
              <span className="text-caption font-bold text-text uppercase tracking-wider">SentinelAgent Node Detail</span>
              <Settings className="h-4.5 w-4.5 text-muted" />
            </div>

            <div className="text-caption space-y-3.5 text-muted leading-relaxed font-normal">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Agent Status:</span>
                <span className="font-bold text-success capitalize">{server.agentStatus}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Host Platform:</span>
                <span className="font-bold text-text capitalize">{server.os}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Core Kernel:</span>
                <span className="font-mono text-text font-bold">5.15.0-89-generic</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
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
          <div className="glass-panel rounded-card p-6 flex flex-col max-h-[400px] border border-border/80 shadow-md">
            <div className="border-b border-border pb-3.5 mb-5 flex-shrink-0 flex items-center justify-between select-none">
              <span className="text-caption font-bold text-text uppercase tracking-wider">Process Tree ({server.runningProcesses.length})</span>
              <span className="text-[10px] text-muted font-bold uppercase">Terminate PID</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {server.runningProcesses.map((p) => (
                <div 
                  key={p.pid} 
                  className={`p-3 rounded-input border transition-colors flex items-center justify-between text-caption ${
                    p.threatScore > 50 
                      ? 'bg-critical/5 border-critical/40 hover:bg-critical/10' 
                      : 'bg-background/55 border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col text-left font-normal">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text truncate max-w-[130px]">{p.name}</span>
                      <span className="font-mono text-muted text-[10px] font-bold">({p.pid})</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] text-muted mt-1 font-bold font-mono">
                      <span>CPU: {p.cpu}%</span>
                      <span>RAM: {p.ram}%</span>
                    </div>
                  </div>

                  {p.threatScore > 50 ? (
                    <ActionButton 
                      onClick={() => killProcess(server.id, p.pid)}
                      variant="danger"
                      size="sm"
                      className="px-2 py-1 h-7 text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider"
                    >
                      <Power className="h-3 w-3" /> Kill
                    </ActionButton>
                  ) : (
                    <span className="text-[10px] text-muted font-bold uppercase select-none pr-1">Safe</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Network Connections */}
          <div className="glass-panel rounded-card p-6 border border-border/80 shadow-md">
            <div className="border-b border-border pb-3.5 mb-5 flex items-center justify-between select-none">
              <span className="text-caption font-bold text-text uppercase tracking-wider">Active Socket Matrices</span>
              <Network className="h-4.5 w-4.5 text-muted" />
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {server.connections.map((c, i) => (
                <div key={i} className="p-3 rounded-input bg-background/55 border border-border flex items-center justify-between text-caption leading-relaxed font-normal">
                  <div className="flex flex-col">
                    <span className="font-bold text-text">{c.proto.toUpperCase()} {c.localAddr}</span>
                    <span className="text-muted mt-0.5 font-mono text-[10px]">← {c.foreignAddr}</span>
                  </div>
                  <span className="font-mono text-muted text-[10px] bg-border/40 px-2 py-0.5 rounded-badge font-bold select-none">
                    PID:{c.pid}
                  </span>
                </div>
              ))}
              {server.connections.length === 0 && (
                <div className="text-center text-caption text-muted py-6 font-normal">No network sockets open.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
