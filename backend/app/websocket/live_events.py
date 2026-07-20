from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.websocket.manager import ws_manager

class EventTypes:
    NEW_INCIDENT = "NEW_INCIDENT"
    INCIDENT_UPDATED = "INCIDENT_UPDATED"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    APPROVAL_DECISION = "APPROVAL_DECISION"
    REMEDIATION_COMPLETE = "REMEDIATION_COMPLETE"
    SERVER_STATUS_CHANGE = "SERVER_STATUS_CHANGE"
    SYSTEM_ALERT = "SYSTEM_ALERT"

class LiveEventEmitter:
    async def emit_new_incident(self, incident_data: Dict[str, Any]):
        await ws_manager.broadcast({
            "type": EventTypes.NEW_INCIDENT,
            "data": incident_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    async def emit_incident_updated(self, incident_id: str, status: str, severity: str, details: Optional[Dict[str, Any]] = None):
        await ws_manager.broadcast({
            "type": EventTypes.INCIDENT_UPDATED,
            "data": {
                "id": incident_id,
                "status": status,
                "severity": severity,
                "details": details or {}
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    async def emit_approval_requested(self, approval_data: Dict[str, Any]):
        await ws_manager.broadcast({
            "type": EventTypes.APPROVAL_REQUESTED,
            "data": approval_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    async def emit_approval_decision(self, approval_id: str, decision: str, approver: str):
        await ws_manager.broadcast({
            "type": EventTypes.APPROVAL_DECISION,
            "data": {
                "id": approval_id,
                "decision": decision,
                "approver": approver
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    async def emit_server_status(self, server_id: str, status: str):
        await ws_manager.broadcast({
            "type": EventTypes.SERVER_STATUS_CHANGE,
            "data": {
                "server_id": server_id,
                "status": status
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

event_emitter = LiveEventEmitter()
