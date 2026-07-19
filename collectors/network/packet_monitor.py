from typing import Dict, Any, List
from collectors.parser.normalizer import log_normalizer

class PacketMonitorCollector:
    """
    Packet-level monitor detecting traffic metrics and anomalies.
    """
    def collect(self, packets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized_events = []
        for pkt in packets:
            normalized = log_normalizer.normalize(pkt, "packet")
            normalized_events.append(normalized)
        return normalized_events

packet_monitor_collector = PacketMonitorCollector()
