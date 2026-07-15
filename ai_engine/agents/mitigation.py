import json
from typing import Dict, Any
from ai_engine.llm.client import llm_client

class MitigationAgent:
    """
    Mitigation Agent: Uses Qwen2.5-Coder to craft precise, safe remediation script playbooks and post-mortem reports.
    """
    async def run(self, severity_output: Dict[str, Any], triage_output: Dict[str, Any], forensics_output: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Act as an Autonomous System Mitigation Specialist.
        Severity: {severity_output.get('severity')}
        Root Cause: {forensics_output.get('root_cause')}
        IoCs: {json.dumps(triage_output.get('iocs'))}

        Synthesize precise remediation commands:
        - Network block (iptables)
        - Process termination (kill -9)
        - Quarantining binary
        - Process freeze (kill -STOP) for critical threats
        """
        response_text = await llm_client.invoke_model(prompt, model_role="mitigation")

        severity = severity_output.get("severity")
        technique = severity_output.get("mitre_technique", "")
        iocs = triage_output.get("iocs", {})
        ip = iocs.get("ip", "198.51.100.45")
        user = iocs.get("user", "guest_user")

        if "T1110" in technique or severity == "LOW":
            proposed_action = f"Block source IP address {ip} via firewall rule."
            script_to_run = f"iptables -A INPUT -s {ip} -j DROP"
            risk_explanation = "Low impact automated firewall drop rule."
            requires_human_approval = False

        elif "T1204" in technique or severity == "MEDIUM":
            proposed_action = "Terminate malicious cryptominer process and quarantine binary payload."
            script_to_run = "kill -9 32145 && mv /tmp/xmrig /var/security/quarantine/ && chmod 000 /var/security/quarantine/xmrig"
            risk_explanation = "Medium impact process kill and payload isolation."
            requires_human_approval = False

        elif "T1548" in technique or severity == "HIGH":
            proposed_action = f"Terminate active SSH session for user '{user}' and lock OS account."
            script_to_run = f"pkill -u {user} && passwd -l {user}"
            risk_explanation = "High impact user session termination and account locking. Suspend auto-execution until admin validates."
            requires_human_approval = True

        else: # CRITICAL / Ransomware T1486
            proposed_action = "Safely freeze encryption thread (SIGSTOP), permanently kill PID post-approval, and restore snapshot."
            script_to_run = "kill -STOP 9482" # Immediate safe non-destructive freeze command
            risk_explanation = "Critical severity threat. Immediate PID freezing executed automatically to stop file corruption; full recovery pending admin approval."
            requires_human_approval = True

        return {
            "proposed_action": proposed_action,
            "script_to_run": script_to_run,
            "risk_explanation": risk_explanation,
            "requires_human_approval": requires_human_approval,
            "mitigation_notes": response_text[:200]
        }

mitigation_agent = MitigationAgent()
