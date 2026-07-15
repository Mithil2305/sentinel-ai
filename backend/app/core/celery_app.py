from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "sentinel_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True
)

@celery_app.task(name="tasks.process_telemetry_event")
def process_telemetry_event(incident_id: str):
    """
    Background Celery worker task running the LangGraph AI multi-agent SOC investigation workflow.
    """
    import asyncio
    from ai_engine.workflows.threat_graph import run_threat_investigation
    
    # Run async LangGraph investigation loop inside worker thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(run_threat_investigation(incident_id))
        return result
    finally:
        loop.close()
