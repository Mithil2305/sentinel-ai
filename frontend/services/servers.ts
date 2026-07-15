import { apiFetch } from './api';

export interface Server {
  id: string;
  hostname: string;
  ip_address: string;
  os: string;
  specs: {
    cpu_cores?: number;
    ram_gb?: number;
    disk_gb?: number;
  };
  agent_version: string;
  status: string;
  last_ping: string;
}

export async function fetchServers(): Promise<{ servers: Server[] }> {
  return apiFetch<{ servers: Server[] }>('/servers');
}
