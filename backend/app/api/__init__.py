from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.servers import router as servers_router
from app.api.incidents import router as incidents_router
from app.api.approvals import router as approvals_router
from app.api.reports import router as reports_router
from app.api.collectors import router as collectors_router
from app.api.alerts import router as alerts_router
from app.api.dashboard import router as dashboard_router
from app.api.audit import router as audit_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(servers_router)
api_router.include_router(incidents_router)
api_router.include_router(approvals_router)
api_router.include_router(reports_router)
api_router.include_router(collectors_router)
api_router.include_router(alerts_router)
api_router.include_router(dashboard_router)
api_router.include_router(audit_router)
