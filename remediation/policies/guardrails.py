import re
from typing import Tuple

ALLOWED_PATTERNS = [
    r"^iptables\s+-A\s+INPUT\s+-s\s+[0-9\.]+\s+-j\s+DROP$",
    r"^kill\s+-(9|STOP|19)\s+[0-9]+$",
    r"^pkill\s+-(u\s+[a-zA-Z0-9_\-]+|f\s+[a-zA-Z0-9_\-/]+)$",
    r"^mv\s+/tmp/[a-zA-Z0-9_\-/\.]+\s+/var/security/quarantine/[a-zA-Z0-9_\-/\.]+$",
    r"^chmod\s+000\s+/var/security/quarantine/[a-zA-Z0-9_\-/\.]+$",
    r"^passwd\s+-l\s+[a-zA-Z0-9_\-]+$"
]

class CommandGuardrails:
    """
    STRIDE Elevation of Privilege Guardrail:
    Regex-based strict whitelist matching. No arbitrary LLM shell output is executed.
    """
    def validate_command(self, script: str) -> Tuple[bool, str]:
        # Split multi-command strings linked by &&
        sub_commands = [cmd.strip() for cmd in script.split("&&")]
        
        for cmd in sub_commands:
            matched = False
            for pattern in ALLOWED_PATTERNS:
                if re.match(pattern, cmd):
                    matched = True
                    break
            if not matched:
                return False, f"Command '{cmd}' failed security regex whitelist check."

        return True, "Command validated successfully."

guardrails = CommandGuardrails()
