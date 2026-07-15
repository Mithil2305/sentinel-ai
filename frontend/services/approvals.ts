import { apiFetch } from './api';

export interface Approval {
  id: string;
  incident_id: string;
  server_id: string;
  severity: string;
  proposed_action: string;
  script_to_run: string;
  risk_explanation: string;
  status: string;
  approver_notes?: string;
  executed_at?: string;
  created_at: string;
}

export async function fetchPendingApprovals(): Promise<{ approvals: Approval[] }> {
  return apiFetch<{ approvals: Approval[] }>('/approvals');
}

export async function approveAction(approvalId: string, notes?: string) {
  return apiFetch<{ id: string; status: string; executed_at: string; remediation_result: string }>(`/approvals/${approvalId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approver_notes: notes }),
  });
}

export async function rejectAction(approvalId: string, notes?: string) {
  return apiFetch<{ id: string; status: string; rejected_at: string }>(`/approvals/${approvalId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ approver_notes: notes }),
  });
}
