from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.models.server import Server
from app.schemas.server import ServerCreate, ServerUpdate, ServerOut

router = APIRouter(prefix="/servers", tags=["Servers"])

@router.get("", response_model=dict)
def get_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    return {"servers": [ServerOut.model_validate(s) for s in servers]}

@router.get("/{server_id}", response_model=ServerOut)
def get_server(server_id: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID does not exist.")
    return ServerOut.model_validate(server)

@router.post("", response_model=dict, status_code=status.HTTP_210_CREATED if hasattr(status, 'HTTP_210_CREATED') else 201)
def register_server(payload: ServerCreate, db: Session = Depends(get_db)):
    existing = db.query(Server).filter(Server.hostname == payload.hostname).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hostname already exists.")
    
    agent_token = f"agt_sec_{uuid.uuid4().hex}"
    server = Server(
        id=f"srv_{uuid.uuid4().hex[:12]}",
        hostname=payload.hostname,
        ip_address=payload.ip_address,
        os=payload.os,
        specs=payload.specs or {"cpu_cores": 8, "ram_gb": 16, "disk_gb": 256},
        agent_token=agent_token,
        status="ONLINE"
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    
    return {
        "id": server.id,
        "hostname": server.hostname,
        "agent_token": server.agent_token,
        "instructions": "Install agent and insert token into /etc/sentinel/agent.conf"
    }

@router.patch("/{server_id}", response_model=ServerOut)
def update_server(server_id: str, payload: ServerUpdate, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID not found.")
    
    if payload.hostname:
        server.hostname = payload.hostname
    if payload.status:
        server.status = payload.status
    if payload.specs:
        server.specs = payload.specs
        
    db.commit()
    db.refresh(server)
    return ServerOut.model_validate(server)

@router.delete("/{server_id}", response_model=dict)
def deregister_server(server_id: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID not found.")
    
    db.delete(server)
    db.commit()
    return {"id": server_id, "deregistered": True}
