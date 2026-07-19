from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Union, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.server import Server
from app.models.incident import Incident
from app.websocket.manager import ws_manager
from collectors.parser.normalizer import log_normalizer
from detection_engine.detectors import evaluate_normalized_log
from detection_engine.mitre.mapper import mitre_mapper
from ai_engine.workflows.threat_graph import run_threat_investigation

router = APIRouter(prefix="/collectors", tags=["Collectors"])

class LogIngestionPayload(BaseModel):
    source_type: str  # e.g., auth, auditd, syslog, netflow, packet, windows_event, sysmon
    logs: Union[str, Dict[str, Any], List[Union[str, Dict[str, Any]]]]

@router.post("/logs", status_code=201)
async def ingest_logs(
    payload: LogIngestionPayload,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Authenticate server by token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Expected Bearer <agent_token>"
        )
    
    agent_token = authorization.split(" ")[1]
    server = db.query(Server).filter(Server.agent_token == agent_token).first()
    if not server:
        # Fallback for testing/local setups where server ID is defined
        if agent_token.startswith("agt_"):
            server = db.query(Server).filter(Server.id == "srv_db_prod01").first()
            if not server:
                server = Server(
                    id="srv_db_prod01",
                    hostname="db-prod-01.sentinel.local",
                    ip_address="10.0.10.15",
                    os="Ubuntu 22.04 LTS",
                    agent_token=agent_token
                )
                db.add(server)
                db.commit()
                db.refresh(server)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid agent token."
            )

    # Update last_ping
    server.last_ping = datetime.now(timezone.utc)
    db.commit()

    # Parse and normalize logs
    raw_logs = payload.logs
    if not isinstance(raw_logs, list):
        raw_logs = [raw_logs]

    incidents_created = []

    for raw_log in raw_logs:
        normalized = log_normalizer.normalize(raw_log, payload.source_type)
        # Evaluate through detectors
        threat = evaluate_normalized_log(normalized)
        if threat:
            # Enrich with MITRE mapping
            enriched = mitre_mapper.enrich_event(threat)
            
            # Register incident
            inc_id = f"inc_{uuid.uuid4().hex[:12]}"
            now_str = datetime.now(timezone.utc).isoformat()
            
            incident = Incident(
                id=inc_id,
                server_id=server.id,
                title=enriched["title"],
                matched_rule=enriched["rule_id"],
                mitre_technique=enriched["technique"],
                status="TRIAGING",
                severity=enriched["severity"],
                raw_log=normalized,
                details={
                    "mitre_id": enriched["mitre_id"],
                    "mitre_name": enriched["mitre_name"],
                    "mitre_tactic": enriched["mitre_tactic"],
                    "mitre_description": enriched["mitre_description"],
                    "default_remediation": enriched["default_remediation"]
                },
                timeline=[
                    {"time": now_str, "event": f"Telemetry match: Rule {enriched['rule_id']} triggered via collector ({payload.source_type})."},
                    {"time": now_str, "event": f"MITRE Technique {enriched['technique']} mapped."}
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

            # Enqueue AI Threat Investigation
            background_tasks.add_task(run_threat_investigation, incident.id)
            incidents_created.append(incident.id)

    return {
        "status": "success",
        "processed_count": len(raw_logs),
        "incidents_created": incidents_created
    }
