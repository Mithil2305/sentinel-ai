from typing import Dict, Any, Optional

class BruteForceDetector:
    """
    Detects credential brute-forcing, password spraying, and failed login sequences.
    """
    def detect(self, normalized_log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Check failed attempts count
        failed_attempts = normalized_log.get("failed_attempts") or normalized_log.get("failed_attempts_count", 0)
        
        # Check failed logon patterns
        is_ssh_fail = "Failed password" in str(normalized_log.get("raw", "")) or "Failed password" in str(normalized_log.get("message", ""))
        is_win_fail = normalized_log.get("EventID") == 4625 or normalized_log.get("event_id") == 4625
        
        if failed_attempts > 10 or is_ssh_fail or is_win_fail:
            return {
                "rule_id": "ssh_brute_force",
                "title": "SSH Password Brute Force Attempt",
                "technique": "T1110 - Brute Force",
                "severity": "LOW"
            }
        return None

brute_force_detector = BruteForceDetector()
