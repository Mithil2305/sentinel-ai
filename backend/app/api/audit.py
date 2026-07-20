from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("", response_model=dict)
def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    actor: Optional[str] = None,
    target_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = audit_service.list_audit_logs(
        db=db,
        page=page,
        limit=limit,
        actor=actor,
        target_type=target_type
    )

    formatted_logs = [
        {
            "id": log.id,
            "actor": log.actor,
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in res["logs"]
    ]

    return {
        "logs": formatted_logs,
        "pagination": res["pagination"]
    }
