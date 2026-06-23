export interface Process {
  pid: number;
  name: string;
  cpu: number;
  ram: number;
  threatScore: number; // 0 to 100
}

export interface NetworkConnection {
  proto: string;
  localAddr: string;
  foreignAddr: string;
  state: string;
  pid: number;
}

export interface SecurityCheck {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export interface Server {
  id: string;
  hostname: string;
  ipAddress: string;
  os: 'linux' | 'windows' | 'macos';
  status: 'online' | 'offline' | 'maintenance';
  securityScore: number; // 0 - 100
  agentStatus: 'active' | 'inactive' | 'outdated';
  threatCount: number;
  lastSeen: string;
  cpuUsage: number; // current cpu
  ramUsage: number; // current ram
  diskUsage: number; // current disk
  cpuHistory: number[]; // simple timeline points
  ramHistory: number[];
  openPorts: number[];
  runningProcesses: Process[];
  connections: NetworkConnection[];
  checks: SecurityCheck[];
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'pending' | 'investigating' | 'resolved';

export interface IncidentHistoryItem {
  time: string;
  user: string;
  action: string;
}

export interface Incident {
  id: string;
  threatName: string;
  server: string; // Server hostname
  severity: Severity;
  status: IncidentStatus;
  mitreTechnique: string;
  createdAt: string;
  rootCause: string;
  affectedAssets: string[];
  explanation: string;
  recommendedFix: string;
  history: IncidentHistoryItem[];
}

export interface Approval {
  id: string;
  title: string;
  server: string;
  risk: Severity;
  detectedAt: string;
  explanation: string;
  proposedRemediation: string;
  affectedFiles: string[];
  riskAssessment: string;
  mitreMapping: string;
  evidence: string[];
  approved?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT';
  message: string;
  server: string;
}
