from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.schemas.approval import ApprovalActionRequest, ApprovalOut
from app.services.approval_service import approval_service
from app.services.audit_service import audit_service
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("", response_model=dict)
def get_approvals(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    approvals = approval_service.list_pending_approvals(db)
    return {"approvals": [ApprovalOut.model_validate(appr) for appr in approvals]}

@router.post("/{approval_id}/approve", response_model=dict)
async def approve_action(
    approval_id: str,
    payload: ApprovalActionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    actor_email = current_user.email if current_user else "SOC Analyst"
    try:
        res = approval_service.approve_action(
            db=db,
            approval_id=approval_id,
            approver_notes=payload.approver_notes,
            actor=actor_email
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    await ws_manager.broadcast({
        "type": "APPROVAL_DECISION",
        "data": {
            "id": approval_id,
            "status": "APPROVED",
            "approver": actor_email
        }
    })

    audit_service.log_action(
        db=db,
        actor=actor_email,
        action="APPROVAL_GRANTED",
        target_type="approval",
        target_id=approval_id,
        details={"notes": payload.approver_notes}
    )

    return res

@router.post("/{approval_id}/reject", response_model=dict)
async def reject_action(
    approval_id: str,
    payload: ApprovalActionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    actor_email = current_user.email if current_user else "SOC Analyst"
    try:
        res = approval_service.reject_action(
            db=db,
            approval_id=approval_id,
            approver_notes=payload.approver_notes,
            actor=actor_email
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    await ws_manager.broadcast({
        "type": "APPROVAL_DECISION",
        "data": {
            "id": approval_id,
            "status": "REJECTED",
            "approver": actor_email
        }
    })

    audit_service.log_action(
        db=db,
        actor=actor_email,
        action="APPROVAL_REJECTED",
        target_type="approval",
        target_id=approval_id,
        details={"notes": payload.approver_notes}
    )

    return res
