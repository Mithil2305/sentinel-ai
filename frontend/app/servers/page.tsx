'use client';

import React from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  HardDrive, ShieldAlert, Cpu, Database, Network, 
  ArrowUpRight, Monitor, Server, Settings, CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServersPage() {
  const { servers } = useApp();
  const router = useRouter();

  const getOsIcon = (os: 'linux' | 'windows' | 'macos') => {
    switch (os) {
      case 'windows': return '❖';
      case 'macos': return '';
      default: return '🐧';
    }
  };

  const getStatusColor = (status: 'online' | 'offline' | 'maintenance') => {
    switch (status) {
      case 'online': return 'bg-success text-success border-success/30';
      case 'maintenance': return 'bg-warning text-warning border-warning/30';
      default: return 'bg-critical text-critical border-critical/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <span>Infrastructure Asset Inventory</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Monitor endpoint security score, active agent status, and active system vulnerabilities.
          </p>
        </div>
      </div>

      {/* SERVERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {servers.map((s, idx) => {
          const statusStyle = getStatusColor(s.status);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(`/servers/${s.id}`)}
              className="glass-panel glass-panel-hover rounded-xl p-6 cursor-pointer relative flex flex-col justify-between h-64 group"
            >
              
              {/* Top Details & OS indicator */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getOsIcon(s.os)}</span>
                    <span className="font-bold text-base text-text group-hover:text-primary transition-colors">
                      {s.hostname}
                    </span>
                  </div>
                  
                  {/* Status Dot */}
                  <span className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-bold border capitalize ${
                    s.status === 'online' 
                      ? 'bg-success/10 text-success border-success/30' 
                      : s.status === 'maintenance'
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-critical/10 text-critical border-critical/30'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      s.status === 'online' ? 'bg-success animate-pulse' : s.status === 'maintenance' ? 'bg-warning' : 'bg-critical'
                    }`} />
                    <span>{s.status}</span>
                  </span>
                </div>

                <div className="text-xs text-muted mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span className="font-mono text-text">{s.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SentinelAgent:</span>
                    <span className={`font-semibold capitalize ${s.agentStatus === 'active' ? 'text-success' : 'text-warning'}`}>{s.agentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Heartbeat:</span>
                    <span>{s.lastSeen}</span>
                  </div>
                </div>
              </div>

              {/* Hardware Dials Overview */}
              <div className="grid grid-cols-3 gap-3 border-t border-border/40 py-3.5 my-3 text-xs">
                <div className="text-center">
                  <span className="text-muted block">CPU</span>
                  <span className="font-bold text-text">{s.cpuUsage}%</span>
                </div>
                <div className="text-center border-x border-border/40">
                  <span className="text-muted block">RAM</span>
                  <span className="font-bold text-text">{s.ramUsage}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted block">DISK</span>
                  <span className="font-bold text-text">{s.diskUsage}%</span>
                </div>
              </div>

              {/* Bottom score and alert indicators */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Vulnerability Score:</span>
                  <span className={`font-bold text-sm ${
                    s.securityScore >= 90 ? 'text-success' : s.securityScore >= 70 ? 'text-warning' : 'text-critical'
                  }`}>
                    {s.securityScore}/100
                  </span>
                </div>

                {s.threatCount > 0 ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-critical/20 text-critical border border-critical/30 text-xs font-bold uppercase animate-pulse">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>{s.threatCount} Alerts</span>
                  </div>
                ) : (
                  <span className="text-xs text-success font-bold uppercase">Shield Active</span>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
