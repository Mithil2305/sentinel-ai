import time
from fastapi import APIRouter, Response, Request
from starlette.middleware.base import BaseHTTPMiddleware

router = APIRouter(tags=["Metrics"])

# Basic Prometheus metrics counter & timer
REQUEST_COUNT = 0
HTTP_EXCEPTIONS = 0
TOTAL_INCIDENTS_CREATED = 0
TOTAL_REMEDIATIONS_EXECUTED = 0

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        global REQUEST_COUNT, HTTP_EXCEPTIONS
        REQUEST_COUNT += 1
        try:
            response = await call_next(request)
            return response
        except Exception:
            HTTP_EXCEPTIONS += 1
            raise

@router.get("/metrics", response_class=Response)
def get_prometheus_metrics():
    """Prometheus exposition format endpoint."""
    metrics_text = f"""# HELP sentinel_http_requests_total Total number of HTTP requests processed.
# TYPE sentinel_http_requests_total counter
sentinel_http_requests_total {REQUEST_COUNT}

# HELP sentinel_http_exceptions_total Total number of unhandled HTTP exceptions.
# TYPE sentinel_http_exceptions_total counter
sentinel_http_exceptions_total {HTTP_EXCEPTIONS}

# HELP sentinel_incidents_created_total Total security incidents registered.
# TYPE sentinel_incidents_created_total counter
sentinel_incidents_created_total {TOTAL_INCIDENTS_CREATED}

# HELP sentinel_remediations_executed_total Total host remediation actions executed.
# TYPE sentinel_remediations_executed_total counter
sentinel_remediations_executed_total {TOTAL_REMEDIATIONS_EXECUTED}
"""
    return Response(content=metrics_text, media_type="text/plain; version=0.0.4")
