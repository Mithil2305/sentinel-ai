import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.server import Server

class ServerService:
    def list_servers(self, db: Session) -> List[Server]:
        return db.query(Server).order_by(Server.hostname.asc()).all()

    def get_server_by_id(self, db: Session, server_id: str) -> Optional[Server]:
        return db.query(Server).filter(Server.id == server_id).first()

    def get_server_by_token(self, db: Session, agent_token: str) -> Optional[Server]:
        return db.query(Server).filter(Server.agent_token == agent_token).first()

    def register_server(
        self,
        db: Session,
        hostname: str,
        ip_address: str,
        os_name: str,
        specs: Optional[Dict[str, Any]] = None,
        agent_version: str = "1.0.0"
    ) -> Server:
        srv_id = f"srv_{uuid.uuid4().hex[:12]}"
        agent_token = f"agt_{uuid.uuid4().hex}"
        
        server = Server(
            id=srv_id,
            hostname=hostname,
            ip_address=ip_address,
            os=os_name,
            specs=specs or {"cpu_cores": 4, "ram_gb": 16, "disk_gb": 250},
            agent_token=agent_token,
            agent_version=agent_version,
            status="ONLINE",
            last_ping=datetime.now(timezone.utc)
        )
        db.add(server)
        db.commit()
        db.refresh(server)
        return server

    def update_server(
        self,
        db: Session,
        server_id: str,
        hostname: Optional[str] = None,
        ip_address: Optional[str] = None,
        status: Optional[str] = None,
        specs: Optional[Dict[str, Any]] = None
    ) -> Optional[Server]:
        server = self.get_server_by_id(db, server_id)
        if not server:
            return None

        if hostname:
            server.hostname = hostname
        if ip_address:
            server.ip_address = ip_address
        if status:
            server.status = status
        if specs:
            current = server.specs or {}
            current.update(specs)
            server.specs = current

        db.commit()
        db.refresh(server)
        return server

    def update_heartbeat(self, db: Session, server_id: str) -> Optional[Server]:
        server = self.get_server_by_id(db, server_id)
        if server:
            server.last_ping = datetime.now(timezone.utc)
            server.status = "ONLINE"
            db.commit()
            db.refresh(server)
        return server

    def deregister_server(self, db: Session, server_id: str) -> bool:
        server = self.get_server_by_id(db, server_id)
        if not server:
            return False

        db.delete(server)
        db.commit()
        return True

server_service = ServerService()
