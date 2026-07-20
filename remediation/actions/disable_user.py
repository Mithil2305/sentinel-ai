import logging
from typing import Dict, Any
from remediation.policies.guardrails import guardrails

logger = logging.getLogger("sentinel.remediation.disable_user")

class DisableUserAction:
    """Remediation Action: Locks compromised user account and kills active user processes."""

    def execute(self, username: str) -> Dict[str, Any]:
        command_pkill = f"pkill -u {username}"
        command_passwd = f"passwd -l {username}"
        combined_script = f"{command_pkill} && {command_passwd}"

        is_valid, reason = guardrails.validate_command(combined_script)
        if not is_valid:
            return {"success": False, "error": reason}

        logger.info(f"Executing Disable User action: {combined_script}")
        return {
            "success": True,
            "action": "DISABLE_USER",
            "username": username,
            "command": combined_script,
            "output": f"Terminated active sessions for '{username}' and locked OS login."
        }

disable_user_action = DisableUserAction()
