from sqlalchemy import Column, String, Integer, Float, JSON, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"

    id = Column(String(64), primary_key=True, default=lambda: f"ioc_{uuid.uuid4().hex[:12]}")
    indicator_type = Column(String(50), nullable=False, index=True) # IP, MD5, SHA256, DOMAIN, FILENAME
    indicator_value = Column(String(255), nullable=False, index=True)
    threat_category = Column(String(100), default="MALWARE")
    confidence_score = Column(Float, default=85.0)
    source = Column(String(100), default="SentinelAI Network")
    details = Column(JSON, default=dict)
    first_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
