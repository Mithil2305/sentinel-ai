import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.report import Report
from app.models.incident import Incident

class ReportService:
    def list_reports(self, db: Session) -> List[Report]:
        return db.query(Report).order_by(Report.created_at.desc()).all()

    def get_report_by_id(self, db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.id == report_id).first()

    def generate_report(
        self,
        db: Session,
        incident_id: str,
        title: Optional[str] = None,
        report_format: str = "MARKDOWN"
    ) -> Report:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident '{incident_id}' not found.")

        report_id = f"rep_{uuid.uuid4().hex[:12]}"
        report_title = title or f"Incident Report: {incident.title} ({incident.id})"
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Synthesize rich markdown report content
        details = incident.details or {}
        remediation = incident.remediation or {}
        timeline = incident.timeline or []

        timeline_md = "\n".join([f"- **{entry.get('time', '')}**: {entry.get('event', '')}" for entry in timeline])

        content = f"""# SentinelAI Incident Forensics & Remediation Report

**Report ID:** `{report_id}`  
**Generated At:** {now_str}  
**Target Incident:** `{incident.id}`  
**Server ID:** `{incident.server_id}`  

---

## 1. Executive Summary

* **Title:** {incident.title}
* **Matched Rule:** `{incident.matched_rule}`
* **MITRE ATT&CK Technique:** `{incident.mitre_technique}`
* **Assessed Severity:** `{incident.severity}`
* **Current Status:** `{incident.status}`

---

## 2. Technical Findings & Root Cause Analysis

* **Root Cause:** {details.get('root_cause', 'N/A')}
* **Process Lineage Tree:** `{details.get('process_tree', 'N/A')}`
* **Entropy Rating:** `{details.get('entropy', 'N/A')}`
* **CVSS Score:** `{details.get('cvss_score', 'N/A')}`
* **Extracted IoCs:** `{details.get('iocs', {})}`

---

## 3. Threat Investigation Timeline

{timeline_md if timeline_md else "No timeline events recorded."}

---

## 4. Remediation Action Summary

* **Action Taken:** {remediation.get('action_taken', 'Pending / Manual Review')}
* **Auto-Fixed:** {remediation.get('auto_fixed', False)}
* **Approved By:** {remediation.get('approved_by', 'N/A')}
* **Script Executed:** `{remediation.get('script_executed', 'N/A')}`
* **Execution Output:**
```
{remediation.get('result', 'N/A')}
```

---
*Report generated automatically by SentinelAI Autonomous SOC Engine.*
"""

        report = Report(
            id=report_id,
            incident_id=incident_id,
            title=report_title,
            content=content,
            format=report_format,
            status="GENERATED"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

report_service = ReportService()
