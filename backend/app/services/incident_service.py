import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.incident import Incident
from app.models.server import Server

class IncidentService:
    def list_incidents(
        self,
        db: Session,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        server_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Paginated fetch for security incidents with optional filters."""
        query = db.query(Incident)
        
        # Soft delete filter if column exists
        if hasattr(Incident, "deleted_at"):
            query = query.filter(Incident.deleted_at == None)

        if status:
            query = query.filter(Incident.status == status)
        if severity:
            query = query.filter(Incident.severity == severity)
        if server_id:
            query = query.filter(Incident.server_id == server_id)

        total_count = query.count()
        total_pages = max(1, (total_count + limit - 1) // limit)
        offset = (page - 1) * limit

        incidents = query.order_by(Incident.created_at.desc()).offset(offset).limit(limit).all()

        return {
            "incidents": incidents,
            "pagination": {
                "total_count": total_count,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }
        }

    def get_incident_by_id(self, db: Session, incident_id: str) -> Optional[Incident]:
        query = db.query(Incident).filter(Incident.id == incident_id)
        if hasattr(Incident, "deleted_at"):
            query = query.filter(Incident.deleted_at == None)
        return query.first()

    def create_incident(
        self,
        db: Session,
        server_id: str,
        title: str,
        matched_rule: str,
        raw_log: Optional[Dict[str, Any]] = None,
        severity: str = "LOW",
        mitre_technique: str = "T1204"
    ) -> Incident:
        # Check server existence, create fallback if missing
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            server = Server(
                id=server_id,
                hostname=f"host-{server_id[:8]}",
                ip_address="127.0.0.1",
                os="Linux",
                agent_token=f"token_{uuid.uuid4().hex[:12]}"
            )
            db.add(server)
            db.commit()

        inc_id = f"inc_{uuid.uuid4().hex[:12]}"
        now_str = datetime.now(timezone.utc).isoformat()
        
        incident = Incident(
            id=inc_id,
            server_id=server_id,
            title=title,
            matched_rule=matched_rule,
            mitre_technique=mitre_technique,
            status="OPEN",
            severity=severity,
            raw_log=raw_log or {},
            details={},
            remediation={},
            timeline=[{"time": now_str, "event": f"Incident created via detection rule: {matched_rule}"}]
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    def update_incident(
        self,
        db: Session,
        incident_id: str,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        notes: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        remediation: Optional[Dict[str, Any]] = None
    ) -> Optional[Incident]:
        incident = self.get_incident_by_id(db, incident_id)
        if not incident:
            return None

        now_str = datetime.now(timezone.utc).isoformat()
        timeline = incident.timeline or []

        if status and status != incident.status:
            timeline.append({"time": now_str, "event": f"Status changed from {incident.status} to {status}"})
            incident.status = status

        if severity and severity != incident.severity:
            timeline.append({"time": now_str, "event": f"Severity updated from {incident.severity} to {severity}"})
            incident.severity = severity

        if notes:
            current_details = incident.details or {}
            current_details["analyst_notes"] = notes
            incident.details = current_details
            timeline.append({"time": now_str, "event": f"Analyst note added: {notes[:60]}..."})

        if details:
            merged = incident.details or {}
            merged.update(details)
            incident.details = merged

        if remediation:
            incident.remediation = remediation

        incident.timeline = timeline
        incident.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(incident)
        return incident

    def soft_delete_incident(self, db: Session, incident_id: str) -> bool:
        incident = self.get_incident_by_id(db, incident_id)
        if not incident:
            return False

        if hasattr(Incident, "deleted_at"):
            incident.deleted_at = datetime.now(timezone.utc)
            db.commit()
        else:
            db.delete(incident)
            db.commit()
        return True

    def get_dashboard_statistics(self, db: Session) -> Dict[str, Any]:
        """Aggregate stats for UI summary components."""
        base_query = db.query(Incident)
        if hasattr(Incident, "deleted_at"):
            base_query = base_query.filter(Incident.deleted_at == None)

        total_incidents = base_query.count()
        open_count = base_query.filter(Incident.status == "OPEN").count()
        remediating_count = base_query.filter(Incident.status == "REMEDIATING").count()
        pending_approval_count = base_query.filter(Incident.status == "PENDING_APPROVAL").count()
        resolved_count = base_query.filter(Incident.status == "RESOLVED").count()

        by_severity = {
            "CRITICAL": base_query.filter(Incident.severity == "CRITICAL").count(),
            "HIGH": base_query.filter(Incident.severity == "HIGH").count(),
            "MEDIUM": base_query.filter(Incident.severity == "MEDIUM").count(),
            "LOW": base_query.filter(Incident.severity == "LOW").count()
        }

        return {
            "total_incidents": total_incidents,
            "open_count": open_count,
            "remediating_count": remediating_count,
            "pending_approval_count": pending_approval_count,
            "resolved_count": resolved_count,
            "severity_breakdown": by_severity
        }

incident_service = IncidentService()
