from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api import api_router
from app.websocket.manager import ws_manager

logger = logging.getLogger("sentinel.main")

# Bootstrap SQL tables if running locally without migration binary
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SentinelAI API Gateway for Autonomous Self-Healing SOC Analyst"
)

# CORS Configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard RFC 7807 Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "https://api.sentinelai.local/errors/internal",
            "title": "Internal Server Error",
            "status": 500,
            "detail": str(exc),
            "instance": request.url.path,
            "error_code": "INTERNAL_SYSTEM_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

@app.get("/api/v1/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Register REST API v1 Routes
app.include_router(api_router)

# Register Prometheus Metrics Router
if settings.ENABLE_PROMETHEUS_METRICS:
    from app.core.metrics import router as metrics_router, MetricsMiddleware
    app.add_middleware(MetricsMiddleware)
    app.include_router(metrics_router)

# Real-time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo heartbeat ping/pong
            await websocket.send_text('{"type": "HEARTBEAT", "status": "ACK"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
