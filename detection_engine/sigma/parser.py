import re
from typing import Dict, Any, Optional

class SigmaRuleParser:
    """
    Parses lightweight Sigma YAML-like security event rules and checks telemetry payloads.
    """
    def __init__(self):
        self.rules = [
            {
                "id": "ssh_brute_force",
                "title": "SSH Password Brute Force Attempt",
                "technique": "T1110 - Brute Force",
                "severity": "LOW",
                "condition": lambda log: log.get("failed_attempts", 0) > 10 or "Failed password" in str(log.get("raw", ""))
            },
            {
                "id": "exec_from_tmp",
                "title": "Suspicious execution from /tmp path",
                "technique": "T1204 - User Execution",
                "severity": "MEDIUM",
                "condition": lambda log: "/tmp/" in str(log.get("proc_path", "")) or "/var/tmp/" in str(log.get("proc_path", ""))
            },
            {
                "id": "anomalous_priv_esc",
                "title": "Anomalous Privilege Escalation to Root",
                "technique": "T1548 - Abuse Elevation Control",
                "severity": "HIGH",
                "condition": lambda log: log.get("uid") == 0 and log.get("previous_uid", 1000) != 0 and not log.get("sudo_used", False)
            },
            {
                "id": "ransomware_file_encrypt",
                "title": "Rapid File Encryption Activity",
                "technique": "T1486 - Data Encrypted for Impact",
                "severity": "CRITICAL",
                "condition": lambda log: log.get("file_writes_per_sec", 0) > 30 or ".locked" in str(log.get("file_extensions", []))
            }
        ]

    def evaluate_log(self, raw_log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for rule in self.rules:
            try:
                if rule["condition"](raw_log):
                    return {
                        "rule_id": rule["id"],
                        "title": rule["title"],
                        "technique": rule["technique"],
                        "severity": rule["severity"]
                    }
            except Exception:
                continue
        return None

sigma_parser = SigmaRuleParser()
