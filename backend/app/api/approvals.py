from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.models.approval import Approval
from app.models.incident import Incident
from app.schemas.approval import ApprovalActionRequest, ApprovalOut
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("", response_model=dict)
def get_approvals(db: Session = Depends(get_db)):
    approvals = db.query(Approval).filter(Approval.status == "PENDING").all()
    return {"approvals": [ApprovalOut.model_validate(appr) for appr in approvals]}

@router.post("/{approval_id}/approve", response_model=dict)
async def approve_action(approval_id: str, payload: ApprovalActionRequest, db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval ID does not exist.")
    if approval.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mitigation has already been approved or rejected.")

    now_dt = datetime.now(timezone.utc)
    approval.status = "APPROVED"
    approval.approver_notes = payload.approver_notes or "Action approved by analyst."
    approval.executed_at = now_dt

    # Update associated incident status
    incident = db.query(Incident).filter(Incident.id == approval.incident_id).first()
    if incident:
        incident.status = "RESOLVED"
        timeline = incident.timeline or []
        timeline.append({"time": now_dt.isoformat(), "event": f"Human Approval granted: Executed {approval.proposed_action}."})
        incident.timeline = timeline
        remediation = incident.remediation or {}
        remediation["action_taken"] = approval.proposed_action
        remediation["auto_fixed"] = False
        remediation["approved_by"] = "Administrator"
        remediation["timestamp"] = now_dt.isoformat()
        incident.remediation = remediation

    db.commit()

    await ws_manager.broadcast({
        "type": "APPROVAL_DECISION",
        "data": {
            "id": approval.id,
            "status": "APPROVED",
            "incident_id": approval.incident_id
        }
    })

    return {
        "id": approval.id,
        "status": "APPROVED",
        "executed_at": now_dt.isoformat(),
        "remediation_result": f"Success. Executed: {approval.proposed_action}"
    }

@router.post("/{approval_id}/reject", response_model=dict)
async def reject_action(approval_id: str, payload: ApprovalActionRequest, db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval ID does not exist.")
    if approval.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mitigation has already been processed.")

    now_dt = datetime.now(timezone.utc)
    approval.status = "REJECTED"
    approval.approver_notes = payload.approver_notes or "Rejected by analyst."

    incident = db.query(Incident).filter(Incident.id == approval.incident_id).first()
    if incident:
        incident.status = "FALSE_POSITIVE"
        timeline = incident.timeline or []
        timeline.append({"time": now_dt.isoformat(), "event": "Analyst rejected proposed action. Flagged as False Positive."})
        incident.timeline = timeline

    db.commit()

    await ws_manager.broadcast({
        "type": "APPROVAL_DECISION",
        "data": {
            "id": approval.id,
            "status": "REJECTED",
            "incident_id": approval.incident_id
        }
    })

    return {
        "id": approval.id,
        "status": "REJECTED",
        "rejected_at": now_dt.isoformat()
    }
