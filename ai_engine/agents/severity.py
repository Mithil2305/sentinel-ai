from typing import Dict, Any
from ai_engine.llm.client import llm_client
from detection_engine.mitre.mapping import get_mitre_details

class SeverityAgent:
    """
    Severity Agent: Uses Phi-4-mini to evaluate CVSS score vector, risk impact, and MITRE ATT&CK mapping.
    """
    async def run(self, forensics_output: Dict[str, Any], raw_log: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Act as a CVSS Risk Assessment Specialist.
        Root Cause: {forensics_output.get('root_cause')}
        Process Tree: {forensics_output.get('process_tree')}
        Entropy: {forensics_output.get('entropy')}

        Calculate CVSS Score (0.0 - 10.0) and assign Threat Severity Vector (LOW, MEDIUM, HIGH, CRITICAL).
        """
        response_text = await llm_client.invoke_model(prompt, model_role="severity")

        root_cause = str(forensics_output.get("root_cause", "")).lower()
        entropy = forensics_output.get("entropy", 4.0)

        if "ransomware" in root_cause or entropy > 7.5:
            severity = "CRITICAL"
            cvss = 9.8
            technique = "T1486 - Data Encrypted for Impact"
        elif "privilege escalation" in root_cause or "dirty_pipe" in root_cause:
            severity = "HIGH"
            cvss = 8.4
            technique = "T1548 - Abuse Elevation Control"
        elif "miner" in root_cause or "xmrig" in root_cause or "mining execution" in root_cause:
            severity = "MEDIUM"
            cvss = 6.5
            technique = "T1204 - User Execution"
        else:
            severity = "LOW"
            cvss = 3.8
            technique = "T1110 - Brute Force"

        mitre_info = get_mitre_details(technique)

        return {
            "severity": severity,
            "cvss_score": cvss,
            "mitre_technique": technique,
            "mitre_details": mitre_info,
            "severity_notes": response_text[:200]
        }

severity_agent = SeverityAgent()
