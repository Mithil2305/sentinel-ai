from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
import math

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentOut, IncidentListResponse, PaginationMeta
from app.services.incident_service import incident_service
from app.services.audit_service import audit_service
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=IncidentListResponse)
def list_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    server_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = incident_service.list_incidents(
        db=db,
        page=page,
        limit=limit,
        status=status,
        severity=severity,
        server_id=server_id
    )

    return IncidentListResponse(
        incidents=[IncidentOut.model_validate(inc) for inc in res["incidents"]],
        pagination=PaginationMeta(**res["pagination"])
    )

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = incident_service.get_incident_by_id(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")
    return IncidentOut.model_validate(incident)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    incident = incident_service.create_incident(
        db=db,
        server_id=payload.server_id,
        title=payload.title,
        matched_rule=payload.matched_rule,
        raw_log=payload.raw_log
    )

    now_str = datetime.now(timezone.utc).isoformat()
    await ws_manager.broadcast({
        "type": "NEW_INCIDENT",
        "data": {
            "id": incident.id,
            "title": incident.title,
            "server_id": incident.server_id,
            "severity": incident.severity,
            "status": incident.status,
            "created_at": now_str
        }
    })

    if current_user:
        audit_service.log_action(
            db=db,
            actor=current_user.email,
            action="INCIDENT_MANUALLY_CREATED",
            target_type="incident",
            target_id=incident.id,
            details={"title": incident.title, "matched_rule": incident.matched_rule}
        )

    return {
        "id": incident.id,
        "status": incident.status,
        "message": "Incident created. AI agent dispatched."
    }

@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(
    incident_id: str,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = incident_service.update_incident(
        db=db,
        incident_id=incident_id,
        status=payload.status,
        severity=payload.severity,
        notes=payload.notes
    )
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")

    await ws_manager.broadcast({
        "type": "INCIDENT_UPDATED",
        "data": {
            "id": incident.id,
            "status": incident.status,
            "severity": incident.severity
        }
    })

    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="INCIDENT_UPDATED",
        target_type="incident",
        target_id=incident.id,
        details=payload.model_dump(exclude_unset=True)
    )

    return IncidentOut.model_validate(incident)

@router.delete("/{incident_id}", response_model=dict)
def delete_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = incident_service.soft_delete_incident(db, incident_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")

    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="INCIDENT_DELETED",
        target_type="incident",
        target_id=incident_id
    )

    return {"id": incident_id, "deleted": True}
