from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.models.report import Report
from app.models.incident import Incident
from app.schemas.report import ReportGenerateRequest, ReportOut

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=dict)
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    return {"reports": [ReportOut.model_validate(rep) for rep in reports]}

@router.post("/generate", response_model=dict, status_code=201)
def generate_report(payload: ReportGenerateRequest, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ID does not exist.")

    report_id = f"rep_{uuid.uuid4().hex[:12]}"
    ext = "pdf" if payload.format.upper() == "PDF" else "md"
    download_url = f"https://api.sentinelai.local/reports/downloads/{report_id}.{ext}"

    markdown_summary = f"""# Incident Summary Report: {incident.title}
- **Incident ID**: {incident.id}
- **Server ID**: {incident.server_id}
- **Severity**: {incident.severity}
- **Status**: {incident.status}
- **MITRE ATT&CK Technique**: {incident.mitre_technique}
- **Timestamp**: {incident.created_at}

## Executive Summary
SentinelAI detected an anomaly matching rule `{incident.matched_rule}`. The multi-agent SOC analyst automated root cause investigation and risk scoring.

## Root Cause Analysis
- Raw log matched: `{incident.matched_rule}`
- Offending details: {incident.details}

## Remediation Record
- Action Taken: {incident.remediation.get('action_taken', 'Under Review') if incident.remediation else 'Under Review'}
- Verification Timestamp: {datetime.now(timezone.utc).isoformat()}
"""

    report = Report(
        id=report_id,
        incident_id=incident.id,
        title=f"Incident Summary Report: {incident.title}",
        format=payload.format.upper(),
        content=markdown_summary,
        download_url=download_url,
        status="GENERATED"
    )
    db.add(report)
    db.commit()

    return {
        "report_id": report.id,
        "status": "GENERATED",
        "download_url": report.download_url
    }
