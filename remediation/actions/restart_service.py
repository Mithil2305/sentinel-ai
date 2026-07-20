import logging
from typing import Dict, Any

logger = logging.getLogger("sentinel.remediation.restart_service")

class RestartServiceAction:
    """Remediation Action: Restarts security telemetry services if impaired by attacker."""

    def execute(self, service_name: str) -> Dict[str, Any]:
        allowed_services = ["syslog", "auditd", "sysmon", "sentinel-agent", "nginx"]
        if service_name.lower() not in allowed_services:
            return {"success": False, "error": f"Service '{service_name}' is not in the allowed restart whitelist."}

        command = f"systemctl restart {service_name}"
        logger.info(f"Executing Restart Service action: {command}")
        return {
            "success": True,
            "action": "RESTART_SERVICE",
            "service_name": service_name,
            "command": command,
            "output": f"Successfully issued restart command for target service '{service_name}'."
        }

restart_service_action = RestartServiceAction()
