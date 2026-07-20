import logging
from typing import Dict, Any
from remediation.policies.guardrails import guardrails

logger = logging.getLogger("sentinel.remediation.kill_process")

class KillProcessAction:
    """Remediation Action: Terminates or freezes an unauthorized process PID."""

    def execute(self, pid: int, signal: str = "9") -> Dict[str, Any]:
        if not isinstance(pid, int) or pid <= 0:
            return {"success": False, "error": f"Invalid PID: {pid}"}

        sig_flag = "-STOP" if str(signal).upper() in ["STOP", "19", "SIGSTOP"] else f"-{signal}"
        command = f"kill {sig_flag} {pid}"

        is_valid, reason = guardrails.validate_command(command)
        if not is_valid:
            return {"success": False, "error": reason}

        logger.info(f"Executing Kill Process action: {command}")
        action_name = "FREEZE_PROCESS" if "STOP" in sig_flag else "KILL_PROCESS"
        return {
            "success": True,
            "action": action_name,
            "pid": pid,
            "command": command,
            "output": f"Successfully executed '{command}' on PID {pid}."
        }

kill_process_action = KillProcessAction()
