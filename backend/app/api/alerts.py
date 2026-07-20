from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

@router.get("", response_model=dict)
def get_recent_alerts(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch high priority alert feeds for notification panels."""
    query = db.query(Incident)
    if hasattr(Incident, "deleted_at"):
        query = query.filter(Incident.deleted_at == None)

    incidents = query.filter(Incident.severity.in_(["HIGH", "CRITICAL"])).order_by(Incident.created_at.desc()).limit(limit).all()

    alerts = [
        {
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "server_id": inc.server_id,
            "created_at": inc.created_at.isoformat() if inc.created_at else None
        }
        for inc in incidents
    ]

    return {"alerts": alerts, "count": len(alerts)}

@router.post("/test", response_model=dict)
async def trigger_test_alert(
    current_user: User = Depends(get_current_user)
):
    """Trigger a synthetic test alert for WebSocket connectivity testing."""
    test_msg = {
        "type": "TEST_ALERT",
        "data": {
            "title": "Synthetic Test Alert",
            "message": "WebSocket connection verified successfully.",
            "triggered_by": current_user.email
        }
    }
    await ws_manager.broadcast(test_msg)
    return {"status": "broadcast_sent", "message": "Test alert emitted over WebSocket"}
