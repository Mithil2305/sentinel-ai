from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportOut
from app.services.report_service import report_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=dict)
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = report_service.list_reports(db)
    return {"reports": [ReportOut.model_validate(rep) for rep in reports]}

@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = report_service.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report ID not found.")
    return ReportOut.model_validate(report)

@router.get("/{report_id}/download", response_class=PlainTextResponse)
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = report_service.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report ID not found.")
    return report.content or ""

@router.post("/generate", response_model=dict, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        report = report_service.generate_report(
            db=db,
            incident_id=payload.incident_id,
            report_format=payload.format
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="REPORT_GENERATED",
        target_type="report",
        target_id=report.id,
        details={"incident_id": payload.incident_id, "format": payload.format}
    )

    return {
        "report_id": report.id,
        "status": report.status,
        "title": report.title,
        "download_url": f"/api/v1/reports/{report.id}/download"
    }
