from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class AuditdLogCollector:
    """
    Linux Auditd event collector.
    """
    def collect(self, raw_events: List[str]) -> List[Dict[str, Any]]:
        normalized_events = []
        for event in raw_events:
            normalized = log_normalizer.normalize(event, "auditd")
            normalized_events.append(normalized)
        return normalized_events

auditd_log_collector = AuditdLogCollector()
