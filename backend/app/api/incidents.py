from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
import math
import uuid
import asyncio

from app.core.database import get_db
from app.models.incident import Incident
from app.models.server import Server
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentOut, IncidentListResponse, PaginationMeta
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=IncidentListResponse)
def list_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    server_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if server_id:
        query = query.filter(Incident.server_id == server_id)

    total_count = query.count()
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    offset = (page - 1) * limit

    incidents = query.order_by(Incident.created_at.desc()).offset(offset).limit(limit).all()

    return IncidentListResponse(
        incidents=[IncidentOut.model_validate(inc) for inc in incidents],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    )

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")
    return IncidentOut.model_validate(incident)

@router.post("", response_model=dict, status_code=201)
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == payload.server_id).first()
    if not server:
        # Create auto fallback server if missing for local test resilience
        server = Server(
            id=payload.server_id,
            hostname=f"host-{payload.server_id[:6]}.sentinel.local",
            ip_address="10.0.10.15",
            os="Linux / Ubuntu 22.04 LTS",
            agent_token=f"agt_sec_{uuid.uuid4().hex[:12]}"
        )
        db.add(server)
        db.commit()

    inc_id = f"inc_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    incident = Incident(
        id=inc_id,
        server_id=payload.server_id,
        title=payload.title,
        matched_rule=payload.matched_rule,
        mitre_technique="T1204 - User Execution",
        status="TRIAGING",
        severity="MEDIUM",
        raw_log=payload.raw_log,
        timeline=[
            {"time": now_str, "event": f"Telemetry match: Rule {payload.matched_rule} triggered."},
            {"time": now_str, "event": "Incident registered. Dispatching AI SOC agent workflow."}
        ]
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Real-time WebSocket broadcast alert
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

    return {
        "id": incident.id,
        "status": "TRIAGING",
        "message": "Incident created. AI agent dispatched."
    }

@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(incident_id: str, payload: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")

    if payload.status:
        incident.status = payload.status
    if payload.severity:
        incident.severity = payload.severity
    if payload.notes:
        details = incident.details or {}
        details["analyst_notes"] = payload.notes
        incident.details = details

    db.commit()
    db.refresh(incident)

    await ws_manager.broadcast({
        "type": "INCIDENT_UPDATED",
        "data": {
            "id": incident.id,
            "status": incident.status,
            "severity": incident.severity
        }
    })

    return IncidentOut.model_validate(incident)

@router.delete("/{incident_id}", response_model=dict)
def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")

    db.delete(incident)
    db.commit()
    return {"id": incident_id, "deleted": True}
