import asyncio
import logging
from datetime import datetime, timezone
import uuid

from app.core.database import SessionLocal
from app.models.incident import Incident
from app.models.approval import Approval
from app.websocket.manager import ws_manager

from ai_engine.agents.triage import triage_agent
from ai_engine.agents.forensics import forensics_agent
from ai_engine.agents.severity import severity_agent
from ai_engine.agents.mitigation import mitigation_agent

from remediation.executor import remediation_executor

logger = logging.getLogger("sentinel.ai.workflow")

async def run_threat_investigation(incident_id: str):
    """
    Executes the 9-stage Threat Lifecycle using the multi-agent SOC graph.
    """
    db = SessionLocal()
    try:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            logger.error(f"Incident {incident_id} not found.")
            return

        incident_data = {
            "id": incident.id,
            "title": incident.title,
            "matched_rule": incident.matched_rule,
            "raw_log": incident.raw_log or {}
        }

        # Step 1: Triage Phase (Phi-4-mini)
        triage_res = await triage_agent.run(incident_data)

        # Step 2: Forensics Phase (Qwen2.5-Coder)
        forensics_res = await forensics_agent.run(triage_res, incident_data["raw_log"], matched_rule=incident_data["matched_rule"])

        # Step 3: Severity Assessment (Phi-4-mini)
        severity_res = await severity_agent.run(forensics_res, incident_data["raw_log"])

        # Step 4: Mitigation Planning (Qwen2.5-Coder)
        mitigation_res = await mitigation_agent.run(severity_res, triage_res, forensics_res)

        # Update Incident Metadata in DB
        incident.severity = severity_res["severity"]
        incident.mitre_technique = severity_res["mitre_technique"]
        incident.details = {
            "root_cause": forensics_res["root_cause"],
            "process_tree": forensics_res["process_tree"],
            "entropy": forensics_res["entropy"],
            "cvss_score": severity_res["cvss_score"],
            "iocs": triage_res["iocs"]
        }

        now_str = datetime.now(timezone.utc).isoformat()
        timeline = incident.timeline or []
        timeline.append({"time": now_str, "event": f"AI Forensics completed. Process Tree: {forensics_res['process_tree']}"})
        timeline.append({"time": now_str, "event": f"Severity assessed as {severity_res['severity']} (CVSS {severity_res['cvss_score']})."})

        requires_approval = mitigation_res["requires_human_approval"]

        if not requires_approval:
            # Low/Medium Risk: Safe Automated Remediation
            incident.status = "REMEDIATING"
            db.commit()

            exec_res = remediation_executor.execute_action(
                script=mitigation_res["script_to_run"],
                action_name=mitigation_res["proposed_action"]
            )

            incident.status = "RESOLVED"
            remediation = {
                "action_taken": mitigation_res["proposed_action"],
                "auto_fixed": True,
                "script_executed": mitigation_res["script_to_run"],
                "result": exec_res.get("output", "Success"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            incident.remediation = remediation
            timeline.append({"time": datetime.now(timezone.utc).isoformat(), "event": f"Automated Remediation applied: {mitigation_res['proposed_action']}"})

        else:
            # High/Critical Risk: Escalation & Human Approval Hold
            incident.status = "PENDING_APPROVAL"
            
            # For critical ransomware threats, perform immediate non-destructive PID freeze (kill -STOP)
            if severity_res["severity"] == "CRITICAL":
                remediation_executor.execute_action(mitigation_res["script_to_run"], "Process Freeze (kill -STOP)")
                timeline.append({"time": datetime.now(timezone.utc).isoformat(), "event": "Immediate Containment: Ransomware process frozen via kill -STOP to stop encryption."})

            approval_entry = Approval(
                id=f"appr_{uuid.uuid4().hex[:12]}",
                incident_id=incident.id,
                server_id=incident.server_id,
                severity=severity_res["severity"],
                proposed_action=mitigation_res["proposed_action"],
                script_to_run=mitigation_res["script_to_run"],
                risk_explanation=mitigation_res["risk_explanation"],
                status="PENDING"
            )
            db.add(approval_entry)
            timeline.append({"time": datetime.now(timezone.utc).isoformat(), "event": f"Escalated to SOC Analyst. Proposed action: {mitigation_res['proposed_action']}"})

        incident.timeline = timeline
        db.commit()

        # Emit Real-Time WebSocket Notification
        await ws_manager.broadcast({
            "type": "INCIDENT_UPDATED",
            "data": {
                "id": incident.id,
                "status": incident.status,
                "severity": incident.severity,
                "details": incident.details
            }
        })

        return {
            "incident_id": incident.id,
            "status": incident.status,
            "severity": incident.severity
        }

    finally:
        db.close()
