from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class SyslogCollector:
    """
    Linux Syslog event collector.
    """
    def collect(self, raw_logs: List[str]) -> List[Dict[str, Any]]:
        normalized_events = []
        for log in raw_logs:
            normalized = log_normalizer.normalize(log, "syslog")
            normalized_events.append(normalized)
        return normalized_events

syslog_collector = SyslogCollector()
