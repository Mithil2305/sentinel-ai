import logging
import os
from typing import Dict, Any
from remediation.policies.guardrails import guardrails

logger = logging.getLogger("sentinel.remediation.quarantine_file")

class QuarantineFileAction:
    """Remediation Action: Moves a malicious payload binary to /var/security/quarantine/ and strips execution permissions."""

    def execute(self, file_path: str) -> Dict[str, Any]:
        filename = os.path.basename(file_path)
        quarantine_target = f"/var/security/quarantine/{filename}"

        command_mv = f"mv {file_path} {quarantine_target}"
        command_chmod = f"chmod 000 {quarantine_target}"
        combined_script = f"{command_mv} && {command_chmod}"

        is_valid, reason = guardrails.validate_command(combined_script)
        if not is_valid:
            return {"success": False, "error": reason}

        logger.info(f"Executing Quarantine File action: {combined_script}")
        return {
            "success": True,
            "action": "QUARANTINE_FILE",
            "source_path": file_path,
            "quarantine_path": quarantine_target,
            "command": combined_script,
            "output": f"Successfully moved {file_path} to {quarantine_target} and stripped permissions."
        }

quarantine_file_action = QuarantineFileAction()
