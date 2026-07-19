from typing import Dict, Any, Optional

class FileTamperingDetector:
    """
    Detects unauthorized file changes, rapid encryption (ransomware indicator), and directory alterations.
    """
    def detect(self, normalized_log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        file_writes = normalized_log.get("file_writes_per_sec", 0)
        file_extensions = normalized_log.get("file_extensions", [])
        if isinstance(file_extensions, str):
            file_extensions = [file_extensions]
        
        file_path = str(normalized_log.get("file_path", "")).lower()
        file_name = str(normalized_log.get("file_name", "")).lower()
        
        is_ransomware = file_writes > 30 or ".locked" in file_extensions or "locked" in file_name or "locked" in file_path
        
        if is_ransomware:
            return {
                "rule_id": "ransomware_file_encrypt",
                "title": "Rapid File Encryption Activity",
                "technique": "T1486 - Data Encrypted for Impact",
                "severity": "CRITICAL"
            }
            
        # Detect unauthorized editing of sensitive config files
        sensitive_files = ["/etc/passwd", "/etc/shadow", "/etc/sudoers", "c:\\windows\\system32\\config"]
        is_sensitive_tampering = any(sf in file_path for sf in sensitive_files)
        if is_sensitive_tampering and normalized_log.get("action") in ["write", "modify", "delete"]:
            return {
                "rule_id": "unauthorized_file_change",
                "title": "Unauthorized Sensitive File Tampering",
                "technique": "T1204 - User Execution",
                "severity": "HIGH"
            }
            
        return None

file_tampering_detector = FileTamperingDetector()
