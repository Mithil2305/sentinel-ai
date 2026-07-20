import logging
from typing import Dict, Any
from ai_engine.workflows.threat_graph import run_threat_investigation, run_threat_workflow_sync

logger = logging.getLogger("sentinel.ai.soc_workflow")

class SOCWorkflow:
    """
    SOC Workflow Orchestrator: Provides standard entry points for multi-agent SOC investigation pipeline.
    """
    async def execute_investigation(self, incident_id: str) -> Dict[str, Any]:
        logger.info(f"Initiating SOC workflow investigation for incident: {incident_id}")
        return await run_threat_investigation(incident_id)

    def execute_investigation_sync(self, incident_id: str) -> Dict[str, Any]:
        return run_threat_workflow_sync(incident_id)

soc_workflow = SOCWorkflow()
