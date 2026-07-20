from typing import Dict, Any

class ApprovalAgent:
    """
    Approval Agent: Prepares human-in-the-loop risk explanations and safety assessments for PENDING_APPROVAL escalations.
    """
    async def run(self, incident_title: str, severity: str, proposed_action: str, root_cause: str) -> Dict[str, Any]:
        risk_explanation = (
            f"Automated remediation '{proposed_action}' on incident '{incident_title}' requires human approval. "
            f"Risk Level: {severity}. Identified Cause: {root_cause}"
        )
        
        return {
            "requires_approval": severity in ["HIGH", "CRITICAL"],
            "proposed_action": proposed_action,
            "risk_explanation": risk_explanation,
            "safety_recommendation": "Review process tree and confirm server context before executing lock/drop script."
        }

approval_agent = ApprovalAgent()
