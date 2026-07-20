import json
from typing import Dict, Any
from ai_engine.llm.client import llm_client

class ReportingAgent:
    """
    Reporting Agent: Uses LLM to synthesize final forensic summary reports.
    """
    async def run(self, incident_data: Dict[str, Any], forensic_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Act as a Principal SOC Incident Responder.
        Incident Context: {json.dumps(incident_data)}
        Forensics: {json.dumps(forensic_data)}

        Synthesize an executive incident summary and technical root cause analysis.
        """
        response_text = await llm_client.invoke_model(prompt, model_role="forensics")
        
        return {
            "title": f"Incident Summary: {incident_data.get('title', 'Security Alert')}",
            "summary": response_text[:300],
            "full_content": response_text
        }

reporting_agent = ReportingAgent()
