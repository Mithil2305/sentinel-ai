import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.approval import Approval
from app.models.incident import Incident
from remediation.executor import remediation_executor

logger = logging.getLogger("sentinel.services.approval")

class ApprovalService:
    def list_pending_approvals(self, db: Session) -> List[Approval]:
        return db.query(Approval).filter(Approval.status == "PENDING").order_by(Approval.created_at.desc()).all()

    def get_approval_by_id(self, db: Session, approval_id: str) -> Optional[Approval]:
        return db.query(Approval).filter(Approval.id == approval_id).first()

    def approve_action(
        self,
        db: Session,
        approval_id: str,
        approver_notes: Optional[str] = None,
        actor: str = "SOC Analyst"
    ) -> Dict[str, Any]:
        approval = self.get_approval_by_id(db, approval_id)
        if not approval:
            raise ValueError(f"Approval request '{approval_id}' not found.")

        if approval.status != "PENDING":
            raise ValueError(f"Approval request '{approval_id}' is already {approval.status}.")

        now_str = datetime.now(timezone.utc).isoformat()
        approval.status = "APPROVED"
        approval.approver_notes = approver_notes or f"Approved by {actor}"
        approval.executed_at = datetime.now(timezone.utc)

        # Execute remediation action
        exec_res = remediation_executor.execute_action(
            script=approval.script_to_run,
            action_name=approval.proposed_action
        )

        # Update associated incident
        incident = db.query(Incident).filter(Incident.id == approval.incident_id).first()
        if incident:
            incident.status = "RESOLVED"
            remediation = {
                "action_taken": approval.proposed_action,
                "auto_fixed": False,
                "approved_by": actor,
                "approver_notes": approval.approver_notes,
                "script_executed": approval.script_to_run,
                "result": exec_res.get("output", "Success"),
                "timestamp": now_str
            }
            incident.remediation = remediation
            
            timeline = incident.timeline or []
            timeline.append({
                "time": now_str,
                "event": f"Human Approval granted by {actor}. Action executed: {approval.proposed_action}"
            })
            incident.timeline = timeline
            incident.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(approval)

        return {
            "id": approval.id,
            "status": approval.status,
            "executed_at": now_str,
            "remediation_result": exec_res.get("output", "Success")
        }

    def reject_action(
        self,
        db: Session,
        approval_id: str,
        approver_notes: Optional[str] = None,
        actor: str = "SOC Analyst"
    ) -> Dict[str, Any]:
        approval = self.get_approval_by_id(db, approval_id)
        if not approval:
            raise ValueError(f"Approval request '{approval_id}' not found.")

        if approval.status != "PENDING":
            raise ValueError(f"Approval request '{approval_id}' is already {approval.status}.")

        now_str = datetime.now(timezone.utc).isoformat()
        approval.status = "REJECTED"
        approval.approver_notes = approver_notes or f"Rejected by {actor}"

        # Update associated incident
        incident = db.query(Incident).filter(Incident.id == approval.incident_id).first()
        if incident:
            incident.status = "OPEN"
            timeline = incident.timeline or []
            timeline.append({
                "time": now_str,
                "event": f"Remediation action rejected by {actor}. Reason: {approval.approver_notes}"
            })
            incident.timeline = timeline
            incident.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(approval)

        return {
            "id": approval.id,
            "status": approval.status,
            "rejected_at": now_str
        }

approval_service = ApprovalService()
