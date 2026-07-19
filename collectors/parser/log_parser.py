import re
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class LogParser:
    """
    Regex and key-value parser for syslog, auth.log, auditd, and Windows event messages.
    """
    # syslog format regex: e.g. "Jul 19 22:00:00 server sshd[12345]: Failed password for root from 192.168.1.1 port 22 ssh2"
    SYSLOG_REGEX = re.compile(
        r'^(?P<timestamp>[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(?P<hostname>\S+)\s+(?P<process>[\w\-]+)(?:\[(?P<pid>\d+)\])?:\s+(?P<message>.*)$'
    )
    
    # SSH fail log parser regex
    SSH_FAIL_REGEX = re.compile(
        r'Failed password for (?P<invalid>invalid user )?(?P<user>\S+) from (?P<ip>[0-9\.]+) port (?P<port>\d+)'
    )
    
    def parse_syslog(self, line: str) -> Dict[str, Any]:
        match = self.SYSLOG_REGEX.match(line)
        if not match:
            return {"raw": line}
            
        data = match.groupdict()
        # Parse timestamp to ISO
        try:
            # Assumes current year
            current_year = datetime.now().year
            ts_str = f"{current_year} {data['timestamp']}"
            dt = datetime.strptime(ts_str, "%Y %b %d %H:%M:%S")
            data["timestamp_iso"] = dt.replace(tzinfo=timezone.utc).isoformat()
        except Exception:
            data["timestamp_iso"] = datetime.now(timezone.utc).isoformat()
            
        # Check if SSH failure
        ssh_match = self.SSH_FAIL_REGEX.search(data["message"])
        if ssh_match:
            ssh_data = ssh_match.groupdict()
            data["user"] = ssh_data["user"]
            data["ip"] = ssh_data["ip"]
            data["port"] = int(ssh_data["port"])
            data["failed_attempt"] = True
            
        return data

    def parse_auditd(self, line: str) -> Dict[str, Any]:
        """
        Parses auditd messages like:
        type=SYSCALL msg=audit(1687518000.123:456): arch=c000003e syscall=59 success=yes exit=0 ... comm="xmrig" exe="/tmp/xmrig"
        """
        data = {}
        # Find key=value or key="value" pairs
        pattern = re.compile(r'(\w+)=(?:"([^"]*)"|(\S+))')
        matches = pattern.findall(line)
        for key, val_q, val_uq in matches:
            val = val_q if val_q else val_uq
            # Convert digits if numeric
            if val.isdigit():
                data[key] = int(val)
            else:
                data[key] = val
                
        # Parse audit timestamp msg=audit(1687518000.123:456)
        ts_match = re.search(r'msg=audit\((\d+)\.(\d+):', line)
        if ts_match:
            seconds = int(ts_match.group(1))
            dt = datetime.fromtimestamp(seconds, timezone.utc)
            data["timestamp_iso"] = dt.isoformat()
        else:
            data["timestamp_iso"] = datetime.now(timezone.utc).isoformat()
            
        return data

log_parser = LogParser()
