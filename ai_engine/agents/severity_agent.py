from typing import Dict, Any
from ai_engine.agents.severity import severity_agent as core_severity_agent

class SeverityAgentWrapper:
    """
    Severity Agent Wrapper: Calculates threat severity and CVSS scores based on triage and forensics data.
    """
    async def run(self, triage_output: Dict[str, Any], forensic_output: Dict[str, Any], raw_log: Dict[str, Any]) -> Dict[str, Any]:
        return await core_severity_agent.run(triage_output, forensic_output, raw_log)

severity_agent = SeverityAgentWrapper()
