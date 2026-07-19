from typing import Dict, Any, Optional
from datetime import datetime, timezone
from collectors.parser.log_parser import log_parser

class LogNormalizer:
    """
    Normalizes logs from various collectors into a standard layout.
    """
    def normalize(self, data: Any, source_type: str) -> Dict[str, Any]:
        # base normalized record structure
        normalized = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": source_type,
            "source": source_type,
            "user": "unknown",
            "src_ip": None,
            "dest_ip": None,
            "src_port": None,
            "dest_port": None,
            "proc_path": None,
            "proc_name": None,
            "cmdline": None,
            "file_path": None,
            "file_name": None,
            "action": None,
            "raw": data
        }

        # If data is a raw string, try to parse it first
        parsed_data = {}
        if isinstance(data, str):
            if source_type in ["auth", "syslog"]:
                parsed_data = log_parser.parse_syslog(data)
            elif source_type == "auditd":
                parsed_data = log_parser.parse_auditd(data)
            else:
                parsed_data = {"raw": data}
        elif isinstance(data, dict):
            parsed_data = data

        # Map parsed fields to normalized layout
        if "timestamp_iso" in parsed_data:
            normalized["timestamp"] = parsed_data["timestamp_iso"]
        elif "timestamp" in parsed_data:
            normalized["timestamp"] = parsed_data["timestamp"]

        # User mapping
        if "user" in parsed_data:
            normalized["user"] = parsed_data["user"]
        elif "uid" in parsed_data:
            normalized["user"] = parsed_data["uid"]
        elif "auid" in parsed_data:
            normalized["user"] = parsed_data["auid"]

        # IP/Port mapping
        normalized["src_ip"] = parsed_data.get("src_ip") or parsed_data.get("ip") or parsed_data.get("source_ip")
        normalized["dest_ip"] = parsed_data.get("dest_ip") or parsed_data.get("destination_ip")
        normalized["src_port"] = parsed_data.get("src_port") or parsed_data.get("port") or parsed_data.get("source_port")
        normalized["dest_port"] = parsed_data.get("dest_port") or parsed_data.get("destination_port")

        # Process mapping
        normalized["proc_path"] = parsed_data.get("proc_path") or parsed_data.get("exe") or parsed_data.get("process_path")
        normalized["proc_name"] = parsed_data.get("proc_name") or parsed_data.get("comm") or parsed_data.get("process_name")
        normalized["cmdline"] = parsed_data.get("cmdline") or parsed_data.get("command")

        # File mapping
        normalized["file_path"] = parsed_data.get("file_path") or parsed_data.get("filepath")
        normalized["file_name"] = parsed_data.get("file_name") or parsed_data.get("filename")

        # Actions
        normalized["action"] = parsed_data.get("action") or parsed_data.get("syscall")

        # Merge other arbitrary key-values from parsed_data
        for k, v in parsed_data.items():
            if k not in normalized and k != "raw":
                normalized[k] = v

        return normalized

log_normalizer = LogNormalizer()
