from typing import Dict, Any

MITRE_ATTACK_MATRIX: Dict[str, Dict[str, str]] = {
    "T1110": {
        "name": "Brute Force",
        "description": "Adversary attempts credential guessing to access host shells (SSH, WinRM).",
        "tactic": "Credential Access",
        "default_remediation": "Firewall IP Drop Rule"
    },
    "T1204": {
        "name": "User Execution",
        "description": "User runs a malicious script that spawns unauthorized binaries.",
        "tactic": "Execution",
        "default_remediation": "Process Termination & File Quarantine"
    },
    "T1548": {
        "name": "Abuse Elevation Control Mechanism",
        "description": "Adversary exploits a vulnerability to elevate local access to root/system.",
        "tactic": "Privilege Escalation",
        "default_remediation": "Session Termination & Account Lock"
    },
    "T1486": {
        "name": "Data Encrypted for Impact",
        "description": "Ransomware process encrypts user/system files rapidly.",
        "tactic": "Impact",
        "default_remediation": "Process SIGSTOP & Filesystem Snapshot Recovery"
    },
    "T1562": {
        "name": "Impair Defenses",
        "description": "Adversary attempts to stop syslog, auditd, sysmon, or the SentinelAI agent.",
        "tactic": "Defense Evasion",
        "default_remediation": "Restart Target Security Service"
    }
}

def get_mitre_details(technique_id: str) -> Dict[str, str]:
    code = technique_id.split()[0] if " " in technique_id else technique_id
    return MITRE_ATTACK_MATRIX.get(code, {
        "name": "Generic Threat Pattern",
        "description": "Unclassified security anomaly event.",
        "tactic": "Execution",
        "default_remediation": "Analyst Review Required"
    })
