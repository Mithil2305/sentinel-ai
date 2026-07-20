import logging
import re
from typing import Dict, Any, Tuple
from remediation.policies.guardrails import guardrails

logger = logging.getLogger("sentinel.remediation.block_ip")

class BlockIPAction:
    """Remediation Action: Adds a firewall drop rule for an offending IP address."""
    
    IP_REGEX = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")

    def execute(self, ip_address: str) -> Dict[str, Any]:
        if not self.IP_REGEX.match(ip_address):
            return {"success": False, "error": f"Invalid IP address format: {ip_address}"}

        command = f"iptables -A INPUT -s {ip_address} -j DROP"
        is_valid, reason = guardrails.validate_command(command)
        if not is_valid:
            return {"success": False, "error": reason}

        logger.info(f"Executing Block IP action: {command}")
        return {
            "success": True,
            "action": "BLOCK_IP",
            "ip_address": ip_address,
            "command": command,
            "output": f"Successfully added firewall drop rule for {ip_address}."
        }

    def rollback(self, ip_address: str) -> Dict[str, Any]:
        if not self.IP_REGEX.match(ip_address):
            return {"success": False, "error": f"Invalid IP address format: {ip_address}"}

        command = f"iptables -D INPUT -s {ip_address} -j DROP"
        return {
            "success": True,
            "action": "UNBLOCK_IP",
            "ip_address": ip_address,
            "command": command,
            "output": f"Removed firewall drop rule for {ip_address}."
        }

block_ip_action = BlockIPAction()
