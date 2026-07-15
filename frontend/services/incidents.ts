import { apiFetch } from './api';

export interface Incident {
  id: string;
  server_id: string;
  title: string;
  matched_rule: string;
  mitre_technique: string;
  status: string;
  severity: string;
  raw_log?: Record<string, any>;
  details?: Record<string, any>;
  remediation?: Record<string, any>;
  timeline?: Array<{ time: string; event: string }>;
  created_at: string;
  updated_at: string;
}

export interface IncidentListResponse {
  incidents: Incident[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function fetchIncidents(page = 1, limit = 50, status?: string, severity?: string): Promise<IncidentListResponse> {
  let query = `?page=${page}&limit=${limit}`;
  if (status) query += `&status=${status}`;
  if (severity) query += `&severity=${severity}`;
  return apiFetch<IncidentListResponse>(`/incidents${query}`);
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  return apiFetch<Incident>(`/incidents/${id}`);
}

export async function createMockIncident(payload: { server_id: string; title: string; matched_rule: string; raw_log: Record<string, any> }) {
  return apiFetch<{ id: string; status: string; message: string }>('/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
