# SentinelAI Security Threat Model

This document outlines the security posture, threat model, and vulnerability mitigation strategy for **SentinelAI**. It catalogs key assets, analyzes threats against the STRIDE methodology, and aligns detections and remediations to the MITRE ATT&CK matrix.

---

## Assets Inventory

SentinelAI acts as a security enforcement agent, making its components high-value targets for attackers. The primary system assets are categorized below:

| Asset ID | Asset Name | Description | Impact of Compromise |
| :--- | :--- | :--- | :--- |
| **AST-01** | **Monitored Servers** | Target host servers, system processes, configurations, and core host directories. | Critical: Attacker gains control of enterprise systems. |
| **AST-02** | **Central Database** | PostgreSQL instance storing incident reports, server logs, API keys, and admin credentials. | High: Loss of security event history; potential data leak. |
| **AST-03** | **User Accounts** | Dashboard admin accounts, collector tokens, and system API access tokens. | High: Attacker can approve fake mitigations or disable rules. |
| **AST-04** | **AI Agent System** | LangGraph templates, prompt structures, and API keys for LLMs (Gemini/OpenAI). | High: Injection of malicious instructions; theft of LLM API budgets. |
| **AST-05** | **Ingested Logs** | Telemetry logs containing system states, usernames, processes, and network connections. | Medium: Exposure of system structures or sensitive database parameters. |
| **AST-06** | **Control APIs** | API Gateway endpoints used for server communication and dashboard actions. | Critical: Target for authentication bypass or Denial of Service. |

---

## STRIDE Threat Modeling

We evaluate the threats to SentinelAI against the six STRIDE security vectors:

### 1. Spoofing (Identity)
* **Risk Description**: An unauthorized system or attacker impersonates a registered host agent or security administrator to ingest malicious data or execute actions.
* **Attack Example**: An attacker captures a network packet, extracts a collector token, and runs a mock script that sends fake "clean" logs to the API Gateway to mask active intrusions.
* **Impact**: **High**. Loss of system monitoring integrity; threats are blinded from the central dashboard.
* **Mitigation**:
  * Implement mutual TLS (mTLS) for all host agent-to-gateway traffic.
  * Regularly rotate API tokens using HashiCorp Vault.
  * Verify collector server IP metadata before processing incoming HTTP requests.

### 2. Tampering (Data)
* **Risk Description**: Modification of telemetry data on disk, in transit, or alteration of detection rule sets (Sigma/YARA) to bypass alarms.
* **Attack Example**: An attacker modifies the local Sigma rules directory `/etc/sentinel/rules/` to delete the rule checking for unauthorized shell execution.
* **Impact**: **Critical**. Security bypass allowing quiet malware deployment or data exfiltration.
* **Mitigation**:
  * Enforce File Integrity Monitoring (FIM) on the rules directory.
  * Load Sigma/YARA rules into a read-only configuration layer inside Docker containers.
  * Sign ingested logs cryptographically at the collector level.

### 3. Repudiation
* **Risk Description**: An administrator or system process performs a destructive action (like system formatting or stopping database services) but there is no record to prove who did it.
* **Attack Example**: A rogue technician logs into the dashboard, rejects a remediation action, deletes the logs, and claims the system failed autonomously.
* **Impact**: **High**. Inability to conduct post-incident forensics; loss of compliance.
* **Mitigation**:
  * Double-write all admin actions (dashboard button clicks, API calls) to a local PostgreSQL log and an external SIEM endpoint (Loki/Elasticsearch) with write-once-read-many (WORM) constraints.
  * Log all SSH keys and user identifiers associated with manual action approvals.

### 4. Information Disclosure
* **Risk Description**: Exposure of sensitive telemetry logs or database columns containing credentials, intellectual property, or user keys.
* **Attack Example**: Raw server logs containing SQL connection strings are sent to external LLMs (e.g., Gemini API) without filter filters, exposing database root passwords.
* **Impact**: **High**. Data breach, privacy violations, and subsequent credential stuffing attacks.
* **Mitigation**:
  * Run a pre-processor sanitization pipeline to regex-mask emails, IP ranges, hashes, and passwords in log fields before forwarding to external AI APIs.
  * Encrypt data at rest in PostgreSQL using Transparent Data Encryption (TDE).
  * Require TLS 1.3 for all database connections.

### 5. Denial of Service (DoS)
* **Risk Description**: Flooding SentinelAI with millions of junk alerts to overload Redis queues, crash FastAPI, or deplete the database storage.
* **Attack Example**: An attacker uses a botnet to trigger SSH login failures on 50 hosts simultaneously, exhausting Redis buffer limits and halting detection worker queues.
* **Impact**: **Medium/High**. The SOC becomes unresponsive, allowing primary attacks to execute undetected.
* **Mitigation**:
  * Deploy Nginx rate-limiting on `/api/v1/collectors/logs`.
  * Configure Redis to drop stale alerts or scale Celery workers dynamically based on queue length.
  * Partition PostgreSQL security events by day/week and archive older incidents to cold storage.

### 6. Elevation of Privilege
* **Risk Description**: Exploiting a vulnerability in the SentinelAI agent runner to run root-level commands on target hosts.
* **Attack Example**: An attacker injects shell characters (e.g., `; rm -rf /`) into a process argument that is read by the Remediation Engine, forcing the host agent shell to execute it as root.
* **Impact**: **Critical**. Absolute system takeover of all monitored nodes.
* **Mitigation**:
  * Restrict host agent execution permissions via `sudoers` configurations to a specific whitelist of scripts (e.g., `/usr/bin/sentinel-quarantine`, `/usr/bin/sentinel-kill`).
  * Never pass raw LLM-generated string outputs directly to system shells. All remediation arguments must match strict formatting regexes.

---

## MITRE ATT&CK Mapping Matrix

The SentinelAI engine detects and mitigates adversary behaviors mapped to the MITRE ATT&CK framework:

| Technique ID | ATT&CK Technique | Threat Description | Detection Method | Remediation Script |
| :--- | :--- | :--- | :--- | :--- |
| **T1110** | **Brute Force** | Adversary attempts credential guessing to access host shells (SSH, WinRM). | **Sigma Rule**: Detects $>10$ auth failure logs within 10 seconds from a single IP. | **Host Firewall Block**: Add source IP to firewall drop rules (`iptables` / Windows Advanced Firewall). |
| **T1204** | **User Execution** | User runs a malicious script that spawns unauthorized binaries. | **YARA Rule**: File hash check matches malware signature database; Auditd flags file execution in temporary folder (`/tmp`, `/var/tmp`, `AppData\Local\Temp`). | **Process Containment**: Terminate matching process (`kill -9 [PID]`), quarantine the file payload to isolated vault, and strip permissions (`chmod 000`). |
| **T1548** | **Abuse Elevation Control** | Adversary exploits a vulnerability to elevate local access to root/system. | **Auditd Monitor**: Identifies processes changing user UID/EUID to `0` without running standard helper binaries (`sudo`/`su`). | **Session Termination**: Suspend process ID chain, terminate SSH session of parent user (`pkill -u [username]`), and lock user login (`passwd -l`). |
| **T1486** | **Data Encrypted for Impact** | Ransomware process encrypts user/system files rapidly. | **Entropy & Frequency**: Detects $>50$ file write/rename operations in 10 seconds. AI Agent samples file bytes and calculates Shannon Entropy ($>7.9$ encryption indicator). | **Offending Freeze**: Immediately send `kill -STOP [PID]` to hold the encryption thread. Generate rollback script to restore ZFS/Btrfs snapshot. |
| **T1562** | **Impair Defenses** | Adversary attempts to stop syslog, auditd, sysmon, or the SentinelAI agent. | **Service Monitor**: Sigma rule triggers on command `systemctl stop auditd` or registry modification disabling Sysmon service. | **Self-Recovery**: Restart target service automatically. Alert dashboard via backup WebSocket link, flag server health status as `WARNING`. |
| **T1078** | **Valid Accounts** | Adversary logs in using stolen credentials during anomalous hours. | **Behavioral Anomaly**: Detects user logins from unusual IPs or at anomalous times (e.g., 3:00 AM) compared to historical baseline. | **Account Suspend**: Request human administrator approval. If approved, lock the active LDAP/Active Directory account. |
| **T1048** | **Exfiltration Over Alternative Protocol** | Adversary exfiltrates sensitive database data via DNS queries or external curl. | **OSQuery Monitor**: Flags non-standard processes opening outbound sockets to unknown IPs on port 53 or 80/443 with high upload volumes. | **Network Port Block**: Close target socket connection and apply temporary outbound IP block at host routing level. |
