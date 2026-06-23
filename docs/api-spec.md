# SentinelAI API Specification

This document defines the REST API endpoints for **SentinelAI**. It outlines authentication, incident management, host monitoring, administrative approvals, and reporting. All APIs enforce HTTPS, accept and return JSON payloads, and follow standardized error conventions.

---

## Global API Standards & Error Handling

### Request Format
All request bodies must be sent as `application/json`. Timestamps must follow the ISO 8601 extended format (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### Response Format
All success payloads are returned within a standard JSON wrapper. Errors follow the **RFC 7807 Problem Details** standard.

#### Standard Error Response (RFC 7807)
```json
{
  "type": "https://api.sentinelai.local/errors/unauthorized",
  "title": "Unauthorized Access",
  "status": 401,
  "detail": "Invalid authentication credentials or expired JSON Web Token.",
  "instance": "/api/v1/incidents/523",
  "error_code": "AUTH_TOKEN_EXPIRED",
  "timestamp": "2026-06-23T11:55:00.000Z"
}
```

---

## Authentication APIs

### 1. POST /api/v1/auth/login
Authenticates administrative users and retrieves security tokens.

* **Description**: Validates user credentials and issues short-lived JWT Access Token and long-lived Refresh Token.
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | User email address. Must be a valid email format. |
  | `password` | String | Yes | Plaintext login password. |
* **Request Example**:
  ```json
  {
    "email": "sec_admin@sentinelai.local",
    "password": "SuperSecurePassword123!"
  }
  ```
* **Response Body**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `access_token` | String | JWT access token (valid for 15 minutes). |
  | `refresh_token` | String | Cryptographic token to acquire new access tokens (valid for 7 days). |
  | `token_type` | String | Always `"Bearer"`. |
  | `expires_in` | Integer | Access token expiration lifetime in seconds (`900`). |
* **Response Example**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "def7a7a58a74e5...",
    "token_type": "Bearer",
    "expires_in": 900
  }
  ```
* **Status Codes & Error Handling**:
  * `200 OK`: Login successful.
  * `400 Bad Request`: Missing mandatory parameters.
  * `401 Unauthorized`: Credentials do not match.
  * `403 Forbidden`: Account is suspended or locked.

---

### 2. POST /api/v1/auth/logout
Revokes authentication tokens and invalidates the user session.

* **Description**: Blacklists the provided refresh token in the Redis cache.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `refresh_token` | String | Yes | The refresh token to be revoked. |
* **Request Example**:
  ```json
  {
    "refresh_token": "def7a7a58a74e5..."
  }
  ```
* **Response Body**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `status` | String | Operation status message. |
* **Response Example**:
  ```json
  {
    "status": "revoked"
  }
  ```
* **Status Codes**:
  * `200 OK`: Logout successful, session invalidated.
  * `401 Unauthorized`: Invalid access token.

---

### 3. POST /api/v1/auth/refresh-token
Requests a new access token using a refresh token.

* **Description**: Exchanges a valid refresh token for a new short-lived JWT access token.
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `refresh_token` | String | Yes | Valid refresh token. |
* **Request Example**:
  ```json
  {
    "refresh_token": "def7a7a58a74e5..."
  }
  ```
* **Response Body**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `access_token` | String | New JWT access token. |
  | `token_type` | String | Always `"Bearer"`. |
  | `expires_in` | Integer | Access token expiration in seconds (`900`). |
* **Response Example**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
  ```
* **Status Codes**:
  * `200 OK`: Token refreshed successfully.
  * `401 Unauthorized`: Token is invalid, blacklisted, or expired.

---

## Incident APIs

### 1. GET /api/v1/incidents
Retrieve a paginated list of security incidents.

* **Description**: Fetch security incidents with query filtering (by status, severity, server).
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `page` (Integer, default `1`): Pagination offset.
  * `limit` (Integer, default `50`, max `100`): Results per page.
  * `status` (String): Filter by status (`TRIAGING`, `PENDING_APPROVAL`, `REMEDIATING`, `RESOLVED`, `FALSE_POSITIVE`).
  * `severity` (String): Filter by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  * `server_id` (String): Filter by server identifier.
* **Response Example**:
  ```json
  {
    "incidents": [
      {
        "id": "inc_9f83a21b",
        "server_id": "srv_db_prod01",
        "title": "Suspicious execution from /tmp path",
        "status": "RESOLVED",
        "severity": "MEDIUM",
        "mitre_technique": "T1204 - User Execution",
        "created_at": "2026-06-23T11:00:00Z",
        "updated_at": "2026-06-23T11:05:00Z"
      }
    ],
    "pagination": {
      "total_count": 1,
      "page": 1,
      "limit": 50,
      "total_pages": 1
    }
  }
  ```
* **Status Codes**:
  * `200 OK`: Fetch successful.
  * `401 Unauthorized`: Auth token missing or invalid.

---

### 2. GET /api/v1/incidents/{id}
Retrieve details for a specific security incident.

* **Description**: Returns all metadata, process trees, timeline events, and forensic artifacts for a specific incident.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "id": "inc_9f83a21b",
    "server_id": "srv_db_prod01",
    "title": "Suspicious execution from /tmp path",
    "status": "RESOLVED",
    "severity": "MEDIUM",
    "mitre_technique": "T1204 - User Execution",
    "details": {
      "rule_matched": "exec_from_tmp",
      "process_tree": "systemd -> nginx -> shell -> /tmp/miner",
      "cmdline": "/tmp/miner -o stratum+tcp://pool.xmrig.com",
      "offending_pid": 12845
    },
    "remediation": {
      "action_taken": "Process terminated, binary file quarantined",
      "auto_fixed": true,
      "timestamp": "2026-06-23T11:04:12Z"
    },
    "timeline": [
      { "time": "2026-06-23T11:00:00Z", "event": "File /tmp/miner executed" },
      { "time": "2026-06-23T11:00:15Z", "event": "YARA signature matched: Cryptominer" },
      { "time": "2026-06-23T11:01:00Z", "event": "AI Agent initiated investigation" },
      { "time": "2026-06-23T11:04:12Z", "event": "Process terminated and binary quarantined" }
    ],
    "created_at": "2026-06-23T11:00:00Z",
    "updated_at": "2026-06-23T11:05:00Z"
  }
  ```
* **Status Codes**:
  * `200 OK`: Fetch successful.
  * `401 Unauthorized`: Invalid access token.
  * `404 Not Found`: Incident ID does not exist.

---

### 3. POST /api/v1/incidents
Create a new security incident (Collector ingestion endpoint).

* **Description**: Called by remote log collectors or detection engines to report a rule match.
* **Request Headers**:
  `Authorization: Bearer <collector_token>`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `server_id` | String | Yes | Registered server ID. |
  | `title` | String | Yes | Name of the rule or threat detected. |
  | `matched_rule` | String | Yes | Code/name of the Sigma or YARA rule. |
  | `raw_log` | Object | Yes | Raw log metadata where match occurred. |
* **Request Example**:
  ```json
  {
    "server_id": "srv_db_prod01",
    "title": "Suspicious execution from /tmp path",
    "matched_rule": "exec_from_tmp",
    "raw_log": {
      "timestamp": "2026-06-23T11:00:00Z",
      "proc_path": "/tmp/miner",
      "cmdline": "/tmp/miner -o stratum...",
      "uid": 1001
    }
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "inc_9f83a21b",
    "status": "TRIAGING",
    "message": "Incident created. AI agent dispatched."
  }
  ```
* **Status Codes**:
  * `201 Created`: Incident registered.
  * `400 Bad Request`: Payload validation failed.
  * `401 Unauthorized`: Invalid agent credentials.

---

### 4. PATCH /api/v1/incidents/{id}
Update incident attributes.

* **Description**: Manually adjust status, override severity, or add analyst notes.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | String | No | Target status: `RESOLVED`, `FALSE_POSITIVE`, etc. |
  | `severity` | String | No | Adjusted severity: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
  | `notes` | String | No | Optional notes from the analyst. |
* **Request Example**:
  ```json
  {
    "status": "FALSE_POSITIVE",
    "notes": "Verified this was a scheduled benchmarking run by DevOps."
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "inc_9f83a21b",
    "status": "FALSE_POSITIVE",
    "severity": "MEDIUM",
    "updated_at": "2026-06-23T11:15:00Z"
  }
  ```
* **Status Codes**:
  * `200 OK`: Update successful.
  * `401 Unauthorized`: Token invalid.
  * `404 Not Found`: Incident ID does not exist.

---

### 5. DELETE /api/v1/incidents/{id}
Delete a specific incident.

* **Description**: Soft-delete/remove an incident log from active indices (retains archive).
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "id": "inc_9f83a21b",
    "deleted": true
  }
  ```
* **Status Codes**:
  * `200 OK`: Delete successful.
  * `401 Unauthorized`: Token invalid.
  * `403 Forbidden`: Requires elevated Admin permissions.
  * `404 Not Found`: Incident ID does not exist.

---

## Server APIs

### 1. GET /api/v1/servers
Retrieve a list of monitored servers.

* **Description**: Fetch all registered servers, including current connection status and health states.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "servers": [
      {
        "id": "srv_db_prod01",
        "hostname": "db-prod-01.sentinel.local",
        "ip_address": "10.0.10.15",
        "os": "Ubuntu 22.04 LTS",
        "agent_version": "v1.4.2",
        "status": "ONLINE",
        "last_ping": "2026-06-23T11:50:00Z"
      }
    ]
  }
  ```
* **Status Codes**:
  * `200 OK`: Fetch successful.
  * `401 Unauthorized`: Invalid access token.

---

### 2. GET /api/v1/servers/{id}
Retrieve details for a specific server.

* **Description**: Fetch complete telemetry metrics, specifications, and history of a registered server.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "id": "srv_db_prod01",
    "hostname": "db-prod-01.sentinel.local",
    "ip_address": "10.0.10.15",
    "os": "Ubuntu 22.04 LTS",
    "specs": {
      "cpu_cores": 16,
      "ram_gb": 64,
      "disk_gb": 500
    },
    "agent_config": {
      "collectors": ["syslog", "auditd", "yara"],
      "polling_interval_sec": 5
    },
    "status": "ONLINE",
    "last_ping": "2026-06-23T11:50:00Z"
  }
  ```
* **Status Codes**:
  * `200 OK`: Fetch successful.
  * `404 Not Found`: Server ID does not exist.

---

### 3. POST /api/v1/servers
Register a new server to the security mesh.

* **Description**: Creates a new server asset profile and returns authentication credentials for the host agent.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `hostname` | String | Yes | Domain name or hostname of the server. |
  | `ip_address` | String | Yes | IPv4 or IPv6 target IP. |
  | `os` | String | Yes | Operating system identifier. |
* **Request Example**:
  ```json
  {
    "hostname": "app-web02.sentinel.local",
    "ip_address": "10.0.10.16",
    "os": "RedHat Enterprise Linux 9"
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "srv_web_prod02",
    "hostname": "app-web02.sentinel.local",
    "agent_token": "agt_sec_8a7d3f283848b...",
    "instructions": "Install agent and insert token into /etc/sentinel/agent.conf"
  }
  ```
* **Status Codes**:
  * `201 Created`: Server successfully registered.
  * `400 Bad Request`: Hostname or IP address already exists.

---

### 4. PATCH /api/v1/servers/{id}
Update a registered server's configuration.

* **Description**: Updates server status, settings, or details.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Example**:
  ```json
  {
    "hostname": "app-web02-rename.sentinel.local"
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "srv_web_prod02",
    "hostname": "app-web02-rename.sentinel.local",
    "updated_at": "2026-06-23T11:56:00Z"
  }
  ```
* **Status Codes**:
  * `200 OK`: Server config updated.
  * `404 Not Found`: Server ID not found.

---

### 5. DELETE /api/v1/servers/{id}
Deregister a server.

* **Description**: Deletes server registration and revokes its API token.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "id": "srv_web_prod02",
    "deregistered": true
  }
  ```
* **Status Codes**:
  * `200 OK`: Server successfully removed.
  * `404 Not Found`: Server ID not found.

---

## Approval APIs

### 1. GET /api/v1/approvals
Retrieve a list of pending remediation actions.

* **Description**: Fetches all mitigation steps currently suspended and awaiting administrator validation.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "approvals": [
      {
        "id": "appr_7d8e2a12",
        "incident_id": "inc_5c82a12b",
        "server_id": "srv_web_prod01",
        "severity": "HIGH",
        "proposed_action": "Quarantine guest_user account and terminate active processes",
        "script_to_run": "pkill -u guest_user && passwd -l guest_user",
        "risk_explanation": "Will disrupt active shell connections for guest_user.",
        "created_at": "2026-06-23T11:45:00Z"
      }
    ]
  }
  ```
* **Status Codes**:
  * `200 OK`: Approvals list successfully retrieved.

---

### 2. POST /api/v1/approvals/{id}/approve
Approve a pending mitigation action.

* **Description**: Triggers immediate execution of the suspended remediation script.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Example**:
  ```json
  {
    "approver_notes": "Action approved. Verified malicious dirty pipe exploit execution."
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "appr_7d8e2a12",
    "status": "APPROVED",
    "executed_at": "2026-06-23T11:56:45Z",
    "remediation_result": "Success. Process terminated and account locked."
  }
  ```
* **Status Codes**:
  * `200 OK`: Mitigation executed successfully.
  * `400 Bad Request`: Mitigation has already been approved, rejected, or expired.
  * `404 Not Found`: Approval ID does not exist.

---

### 3. POST /api/v1/approvals/{id}/reject
Reject a pending mitigation action.

* **Description**: Rejects the proposed fix. The remediation is not run, and the incident remains open for manual resolution.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Example**:
  ```json
  {
    "approver_notes": "Rejected. This is a false positive of developer shell scripts."
  }
  ```
* **Response Example**:
  ```json
  {
    "id": "appr_7d8e2a12",
    "status": "REJECTED",
    "rejected_at": "2026-06-23T11:57:00Z"
  }
  ```
* **Status Codes**:
  * `200 OK`: Action rejected successfully.
  * `404 Not Found`: Approval ID does not exist.

---

## Reports APIs

### 1. GET /api/v1/reports
Retrieve all generated security reports.

* **Description**: Returns metadata and download URIs for all compiled security summaries.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Response Example**:
  ```json
  {
    "reports": [
      {
        "id": "rep_23d4e8",
        "incident_id": "inc_9f83a21b",
        "title": "Incident Summary Report: Cryptominer Anomaly",
        "created_at": "2026-06-23T11:05:00Z",
        "download_url": "https://api.sentinelai.local/reports/downloads/rep_23d4e8.pdf"
      }
    ]
  }
  ```
* **Status Codes**:
  * `200 OK`: Reports list retrieved.

---

### 2. POST /api/v1/reports/generate
Manually trigger a report compilation.

* **Description**: Requests the AI Agent to immediately generate a comprehensive report for an incident.
* **Request Headers**:
  `Authorization: Bearer <access_token>`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `incident_id` | String | Yes | ID of the incident to compile. |
  | `format` | String | No | Target format (`PDF`, `MARKDOWN`, or `HTML`). Default is `PDF`. |
* **Request Example**:
  ```json
  {
    "incident_id": "inc_9f83a21b",
    "format": "MARKDOWN"
  }
  ```
* **Response Example**:
  ```json
  {
    "report_id": "rep_23d4e8",
    "status": "GENERATED",
    "download_url": "https://api.sentinelai.local/reports/downloads/rep_23d4e8.md"
  }
  ```
* **Status Codes**:
  * `201 Created`: Report successfully generated.
  * `404 Not Found`: Incident ID does not exist.
