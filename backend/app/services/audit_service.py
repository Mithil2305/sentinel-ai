import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

class AuditService:
    def log_action(
        self,
        db: Session,
        actor: str,
        action: str,
        target_type: str,
        target_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        log_id = f"audit_{uuid.uuid4().hex[:12]}"
        entry = AuditLog(
            id=log_id,
            actor=actor,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details or {},
            ip_address=ip_address or "127.0.0.1"
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    def list_audit_logs(
        self,
        db: Session,
        page: int = 1,
        limit: int = 50,
        actor: Optional[str] = None,
        target_type: Optional[str] = None
    ) -> Dict[str, Any]:
        query = db.query(AuditLog)

        if actor:
            query = query.filter(AuditLog.actor == actor)
        if target_type:
            query = query.filter(AuditLog.target_type == target_type)

        total_count = query.count()
        total_pages = max(1, (total_count + limit - 1) // limit)
        offset = (page - 1) * limit

        logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

        return {
            "logs": logs,
            "pagination": {
                "total_count": total_count,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }
        }

audit_service = AuditService()
