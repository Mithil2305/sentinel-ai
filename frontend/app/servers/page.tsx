'use client';

import React from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { HardDrive, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { StatusChip } from '@/components/ui/status-chip';

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

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Infrastructure Asset Inventory" 
        description="Monitor endpoint security score, active agent status, and active system vulnerabilities."
        icon={HardDrive}
      />

      {/* SERVERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {servers.map((s, idx) => {
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(`/servers/${s.id}`)}
              className="glass-panel glass-panel-hover rounded-card p-card-padding cursor-pointer relative flex flex-col justify-between h-64 group border border-border/80 shadow-md"
            >
              
              {/* Top Details & OS indicator */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">{getOsIcon(s.os)}</span>
                    <span className="font-bold text-[15px] text-text group-hover:text-primary transition-colors">
                      {s.hostname}
                    </span>
                  </div>
                  
                  {/* Status chip */}
                  <StatusChip status={s.status === 'online' ? 'healthy' : s.status} />
                </div>

                <div className="text-caption text-muted mt-3 space-y-1 font-normal">
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span className="font-mono text-text font-bold">{s.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SentinelAgent:</span>
                    <span className="font-bold">
                      <StatusChip status={s.agentStatus === 'active' ? 'healthy' : 'warning'} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span>Last Heartbeat:</span>
                    <span className="font-medium text-[11px]">{s.lastSeen}</span>
                  </div>
                </div>
              </div>

              {/* Hardware Dials Overview */}
              <div className="grid grid-cols-3 gap-3 border-t border-border/40 py-3.5 my-3 text-caption font-bold">
                <div className="text-center">
                  <span className="text-muted block font-normal text-[11px]">CPU</span>
                  <span className="text-text mt-0.5 block">{s.cpuUsage}%</span>
                </div>
                <div className="text-center border-x border-border/40">
                  <span className="text-muted block font-normal text-[11px]">RAM</span>
                  <span className="text-text mt-0.5 block">{s.ramUsage}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted block font-normal text-[11px]">DISK</span>
                  <span className="text-text mt-0.5 block">{s.diskUsage}%</span>
                </div>
              </div>

              {/* Bottom score and alert indicators */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-caption">
                  <span className="text-muted font-normal">Security Posture Score:</span>
                  <span className={`font-bold ${
                    s.securityScore >= 90 ? 'text-success' : s.securityScore >= 70 ? 'text-warning' : 'text-critical'
                  }`}>
                    {s.securityScore}/100
                  </span>
                </div>

                {s.threatCount > 0 ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-badge bg-critical/20 text-critical border border-critical/30 text-[10px] font-bold uppercase animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    <span>{s.threatCount} Alerts</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-success font-bold uppercase tracking-wider">Shield Active</span>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
