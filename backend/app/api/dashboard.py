from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.incident_service import incident_service
from app.models.incident import Incident
from app.models.server import Server
from detection_engine.mitre.mapping import MITRE_ATTACK_MATRIX

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=dict)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aggregate KPI statistics for the dashboard top cards."""
    stats = incident_service.get_dashboard_statistics(db)
    
    total_servers = db.query(Server).count()
    online_servers = db.query(Server).filter(Server.status == "ONLINE").count()
    
    stats["total_servers"] = total_servers
    stats["online_servers"] = online_servers
    return stats

@router.get("/threat-matrix", response_model=dict)
def get_mitre_threat_matrix(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """MITRE ATT&CK framework technique distribution data."""
    query = db.query(Incident)
    if hasattr(Incident, "deleted_at"):
        query = query.filter(Incident.deleted_at == None)

    incidents = query.all()
    technique_counts = {}
    
    for inc in incidents:
        tech = inc.mitre_technique or "T1204"
        code = tech.split()[0] if " " in tech else tech
        technique_counts[code] = technique_counts.get(code, 0) + 1

    matrix_data = []
    for code, info in MITRE_ATTACK_MATRIX.items():
        matrix_data.append({
            "technique_id": code,
            "name": info["name"],
            "tactic": info["tactic"],
            "description": info["description"],
            "incident_count": technique_counts.get(code, 0)
        })

    return {"matrix": matrix_data}
