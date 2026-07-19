from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class WindowsEventLogCollector:
    """
    Windows Security Event Log collector.
    """
    def collect(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized_events = []
        for event in events:
            normalized = log_normalizer.normalize(event, "windows_event")
            normalized_events.append(normalized)
        return normalized_events

windows_event_log_collector = WindowsEventLogCollector()
