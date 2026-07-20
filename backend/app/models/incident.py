from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, default=lambda: f"inc_{uuid.uuid4().hex[:12]}")
    server_id = Column(String(64), ForeignKey("servers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    matched_rule = Column(String(100), nullable=False)
    mitre_technique = Column(String(100), default="T1204 - User Execution")
    status = Column(String(50), default="TRIAGING", index=True) # TRIAGING, PENDING_APPROVAL, REMEDIATING, RESOLVED, FALSE_POSITIVE
    severity = Column(String(50), default="MEDIUM", index=True)   # LOW, MEDIUM, HIGH, CRITICAL
    raw_log = Column(JSON, default=dict)
    details = Column(JSON, default=dict)
    remediation = Column(JSON, default=dict)
    timeline = Column(JSON, default=list)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    server = relationship("Server", backref="incidents")
