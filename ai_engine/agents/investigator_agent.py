from typing import Dict, Any
from ai_engine.agents.triage import triage_agent
from ai_engine.agents.forensics import forensics_agent

class InvestigatorAgent:
    """
    Investigator Agent: Coordinates initial triage and deep forensic analysis into a unified payload.
    """
    async def run(self, raw_log: Dict[str, Any], matched_rule: str = "") -> Dict[str, Any]:
        triage_output = await triage_agent.run(raw_log)
        forensic_output = await forensics_agent.run(triage_output, raw_log, matched_rule)
        
        return {
            "triage": triage_output,
            "forensics": forensic_output
        }

investigator_agent = InvestigatorAgent()
