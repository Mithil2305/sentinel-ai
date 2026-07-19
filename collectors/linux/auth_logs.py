from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class AuthLogCollector:
    """
    Authentication log collector. Parses raw SSH/auth log entries and yields normalized telemetry.
    """
    def collect(self, raw_logs: List[str]) -> List[Dict[str, Any]]:
        normalized_events = []
        for log in raw_logs:
            normalized = log_normalizer.normalize(log, "auth")
            normalized_events.append(normalized)
        return normalized_events

auth_log_collector = AuthLogCollector()
