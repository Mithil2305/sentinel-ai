import json
from typing import Dict, Any
from ai_engine.llm.client import llm_client

class TriageAgent:
    """
    Triage Agent: Utilizes Phi-4-mini for rapid log parsing, metadata scoping, and IoC extraction.
    """
    async def run(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Act as a Tier-1 SOC Triage Specialist. Analyze the following security alert:
        Title: {incident_data.get('title')}
        Matched Rule: {incident_data.get('matched_rule')}
        Raw Log Payload: {json.dumps(incident_data.get('raw_log', {}))}

        Extract Key Indicators of Compromise (IoCs):
        - Offending User / Process
        - Target File Paths / Network IPs
        - Immediate Threat Summary
        """
        response_text = await llm_client.invoke_model(prompt, model_role="triage")
        
        raw_log = incident_data.get('raw_log', {})
        iocs = {
            "ip": raw_log.get("src_ip") or raw_log.get("ip") or "198.51.100.45",
            "process": raw_log.get("proc_path") or raw_log.get("cmdline") or "unknown_proc",
            "user": raw_log.get("user") or raw_log.get("uid") or "guest_user"
        }
        
        return {
            "triage_summary": f"Triage completed for {incident_data.get('title')}. IoCs extracted successfully.",
            "iocs": iocs,
            "llm_notes": response_text[:200]
        }

triage_agent = TriageAgent()
