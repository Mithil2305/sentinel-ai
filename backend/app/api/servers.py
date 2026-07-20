from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.server import ServerCreate, ServerUpdate, ServerOut
from app.services.server_service import server_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/servers", tags=["Servers"])

@router.get("", response_model=dict)
def get_servers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    servers = server_service.list_servers(db)
    return {"servers": [ServerOut.model_validate(s) for s in servers]}

@router.get("/{server_id}", response_model=ServerOut)
def get_server(
    server_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = server_service.get_server_by_id(db, server_id)
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID does not exist.")
    return ServerOut.model_validate(server)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_server(
    payload: ServerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = server_service.register_server(
        db=db,
        hostname=payload.hostname,
        ip_address=payload.ip_address,
        os_name=payload.os,
        specs=payload.specs
    )
    
    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="SERVER_REGISTERED",
        target_type="server",
        target_id=server.id,
        details={"hostname": server.hostname, "ip_address": server.ip_address}
    )

    return {
        "id": server.id,
        "hostname": server.hostname,
        "agent_token": server.agent_token,
        "instructions": "Install agent and insert token into /etc/sentinel/agent.conf"
    }

@router.patch("/{server_id}", response_model=ServerOut)
def update_server(
    server_id: str,
    payload: ServerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = server_service.update_server(
        db=db,
        server_id=server_id,
        hostname=payload.hostname,
        status=payload.status,
        specs=payload.specs
    )
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID not found.")

    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="SERVER_UPDATED",
        target_type="server",
        target_id=server.id,
        details=payload.model_dump(exclude_unset=True)
    )

    return ServerOut.model_validate(server)

@router.delete("/{server_id}", response_model=dict)
def deregister_server(
    server_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = server_service.deregister_server(db, server_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server ID not found.")

    audit_service.log_action(
        db=db,
        actor=current_user.email,
        action="SERVER_DEREGISTERED",
        target_type="server",
        target_id=server_id
    )

    return {"id": server_id, "deregistered": True}
