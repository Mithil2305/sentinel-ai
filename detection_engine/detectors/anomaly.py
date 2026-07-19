from typing import Dict, Any, Optional

class AnomalyDetector:
    """
    Detects behavioral and environment anomalies (executions from tmp, process deviations, defense evasion).
    """
    def detect(self, normalized_log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        proc_path = str(normalized_log.get("proc_path") or "").lower()
        cmdline = str(normalized_log.get("cmdline") or "").lower()
        action = str(normalized_log.get("action") or "").lower()
        file_path = str(normalized_log.get("file_path") or "").lower()

        # Execution from temp directories
        if "/tmp/" in proc_path or "/var/tmp/" in proc_path or "\\temp\\" in proc_path:
            return {
                "rule_id": "exec_from_tmp",
                "title": "Suspicious execution from /tmp path",
                "technique": "T1204 - User Execution",
                "severity": "MEDIUM"
            }

        # Impair defenses (Defense Evasion T1562)
        is_defense_stop = "stop" in cmdline and ("auditd" in cmdline or "syslog" in cmdline or "sysmon" in cmdline or "sentinel" in cmdline)
        if is_defense_stop or "disable-monitoring" in cmdline:
            return {
                "rule_id": "impair_defenses",
                "title": "Impair Defenses / Stop Security Monitoring Service",
                "technique": "T1562 - Impair Defenses",
                "severity": "HIGH"
            }

        # Suspicious cron jobs / persistence
        if "cron" in file_path or "/etc/cron" in proc_path or "crontab" in cmdline:
            if any(act in action for act in ["write", "modify", "create"]):
                return {
                    "rule_id": "suspicious_cron_job",
                    "title": "Suspicious Cron Job Modification",
                    "technique": "T1543 - Create or Modify System Process",
                    "severity": "MEDIUM"
                }

        # Exfiltration over alternative protocol (Data Exfiltration T1048)
        dest_port = normalized_log.get("dest_port")
        bytes_sent = normalized_log.get("bytes_sent") or 0
        if dest_port in [53, 80, 443] and bytes_sent > 100 * 1024 * 1024:
            return {
                "rule_id": "data_exfiltration",
                "title": "Data Exfiltration Attempt Detected",
                "technique": "T1048 - Exfiltration Over Alternative Protocol",
                "severity": "HIGH"
            }

        return None

anomaly_detector = AnomalyDetector()
