from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class SysmonCollector:
    """
    Windows Sysmon log collector.
    """
    def collect(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized_events = []
        for event in events:
            normalized = log_normalizer.normalize(event, "sysmon")
            normalized_events.append(normalized)
        return normalized_events

sysmon_collector = SysmonCollector()
