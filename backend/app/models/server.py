from sqlalchemy import Column, String, JSON, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Server(Base):
    __tablename__ = "servers"

    id = Column(String(64), primary_key=True, default=lambda: f"srv_{uuid.uuid4().hex[:12]}")
    hostname = Column(String(255), unique=True, nullable=False, index=True)
    ip_address = Column(String(45), nullable=False)
    os = Column(String(100), nullable=False)
    specs = Column(JSON, default=dict)
    agent_version = Column(String(50), default="v1.4.2")
    agent_token = Column(String(255), nullable=False)
    status = Column(String(50), default="ONLINE") # ONLINE, OFFLINE, WARNING, ERROR
    last_ping = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
