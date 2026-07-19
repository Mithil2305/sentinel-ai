from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class NetflowCollector:
    """
    Network NetFlow flow collector.
    """
    def collect(self, raw_flows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized_events = []
        for flow in raw_flows:
            normalized = log_normalizer.normalize(flow, "netflow")
            normalized_events.append(normalized)
        return normalized_events

netflow_collector = NetflowCollector()
