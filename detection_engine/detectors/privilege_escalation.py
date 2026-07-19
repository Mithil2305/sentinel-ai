from typing import Dict, Any, Optional

class PrivilegeEscalationDetector:
    """
    Detects local privilege escalation, malicious root shell spawning, and sudo abuse.
    """
    def detect(self, normalized_log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        uid = normalized_log.get("uid")
        prev_uid = normalized_log.get("previous_uid")
        sudo_used = normalized_log.get("sudo_used", False)
        cmdline = str(normalized_log.get("cmdline") or "").lower()

        # Match anomalous root elevation
        uid_is_root = uid == 0 or uid == "root" or uid == "0"
        prev_uid_not_root = prev_uid is not None and prev_uid != 0 and prev_uid != "0" and prev_uid != "root"
        is_anomalous_root = uid_is_root and prev_uid_not_root and not sudo_used
        
        is_exploit = "dirty_pipe_exploit" in cmdline or "privilege_escalation" in cmdline or "exploit" in cmdline

        if is_anomalous_root or is_exploit:
            return {
                "rule_id": "anomalous_priv_esc",
                "title": "Anomalous Privilege Escalation to Root",
                "technique": "T1548 - Abuse Elevation Control",
                "severity": "HIGH"
            }
        return None

privilege_escalation_detector = PrivilegeEscalationDetector()
