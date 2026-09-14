# SentinelAI End-to-End Testing Guide (Vast.ai + Vercel Architecture) 🛡️

This guide provides step-by-step instructions to test **SentinelAI** when running your **Backend API & AI Engine on Vast.ai** and your **Frontend Dashboard on Vercel**.

---

## 🏗️ Architecture & Component Roles

```
 ┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
 │          Vercel Dashboard            │       │        Vast.ai GPU Instance          │
 │  (https://sentinel-ai.vercel.app)    │       │     (http://<VAST_IP>:<PORT>)        │
 │                                      │       │                                      │
 │  • Interactive SOC Interface         │──────>│  • FastAPI REST Endpoints           │
 │  • Real-time Incidents View          │  CORS │  • YARA & Sigma Detection Engines   │
 │  • AI Remediation Approval Panel     │  APIs │  • LangGraph GPU AI Multi-Agents     │
 └──────────────────────────────────────┘       └──────────────────────────────────────┘
                    ▲                                      ▲
                    │                                      │
                    └──────────────────┬───────────────────┘
                                       │
                         ┌───────────────────────────┐
                         │   Testing Workstation /   │
                         │    Simulated Endpoint     │
                         │                           │
                         │ • EICAR Safe Test File    │
                         │ • Synthetic Telemetry Logs│
                         └───────────────────────────┘
```

---

## ⚙️ Step 1: Environment Setup & Configuration

### 1. Vast.ai Backend Setup
1. SSH into your Vast.ai GPU instance:
   ```bash
   ssh -p <PORT> root@<VAST_IP>
   ```
2. Clone the repository and start the backend container stack:
   ```bash
   cd sentinel-ai
   docker compose -f docker/docker-compose.yml up -d --build
   ```
3. Note your Vast.ai instance's **Public IP** and **Forwarded Port** mapped to container port `8000` (e.g., `http://198.51.100.50:32845`).

---

### 2. Vercel Frontend Configuration
1. Go to your **Vercel Project Dashboard** -> **Settings** -> **Environment Variables**.
2. Set the backend API base URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://<VAST_IP>:<FORWARDED_PORT>
   ```
3. Redeploy the Vercel project to apply the environment variable.

---

## 🔍 Step 2: Verify Service Connectivity

Before initiating threat tests, verify that your Vercel frontend and Vast.ai backend can communicate cleanly.

1. **Verify Vast.ai Backend API**:
   ```bash
   curl -X GET http://<VAST_IP>:<FORWARDED_PORT>/health
   ```
   *Expected Response*: `{"status": "ok", ...}`

2. **Verify Vercel Frontend**:
   Open `https://<your-app>.vercel.app` in your browser. Ensure the connection indicator shows active connectivity to the Vast.ai backend API.

---

## 🧪 Step 3: Executing Safe Threat Simulations

Run these safe test procedures from any workstation or test script, sending telemetry directly to your **Vast.ai backend**.

> [!IMPORTANT]  
> Never use real malware for security testing. Industry best practices rely on synthetic test files (like EICAR) and simulated log events to safely evaluate SIEM and SOC capabilities.

---

### Test Scenario 1: Safe EICAR Malware Signature Detection (YARA Engine)

1. **Generate the EICAR Test File String**:
   The standard EICAR string is a non-malicious ASCII sequence recognized by threat detection engines as a test signature:
   ```bash
   echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt
   ```

2. **Submit Telemetry to Vast.ai Ingestion Endpoint**:
   ```bash
   curl -X POST http://<VAST_IP>:<FORWARDED_PORT>/api/v1/collectors/logs \
     -H "Content-Type: application/json" \
     -d '{
       "host_id": "test-server-vast",
       "log_type": "yara_scan",
       "raw_log": "Threat file detected: eicar.txt containing signature X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
       "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
   ```

3. **Expected Detection Result**:
   * The **Vast.ai YARA Detection Engine** matches the malware signature.
   * SentinelAI enriches the alert with **MITRE ATT&CK T1204 (User Execution)**.
   * The **LangGraph GPU Multi-Agent** workflow runs on Vast.ai to evaluate threat impact.

---

### Test Scenario 2: Simulated SSH Brute-Force Attack (Sigma Engine)

1. **Send Burst of Synthetic SSH Login Failures**:
   ```bash
   for i in {1..5}; do
     curl -s -X POST http://<VAST_IP>:<FORWARDED_PORT>/api/v1/collectors/logs \
       -H "Content-Type: application/json" \
       -d '{
         "host_id": "test-server-vast",
         "log_type": "syslog",
         "raw_log": "Failed password for invalid user admin from 192.168.1.100 port '$((45200 + i))' ssh2",
         "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
       }'
   done
   ```

2. **Expected Detection Result**:
   * Sigma rule engine triggers an SSH Brute Force incident (**Severity: HIGH**).
   * Associated MITRE ID: **T1110 (Brute Force)**.

---

### Test Scenario 3: Defense Evasion & Suspicious Process Execution

1. **Send Execution Anomaly Payload**:
   ```bash
   curl -X POST http://<VAST_IP>:<FORWARDED_PORT>/api/v1/collectors/logs \
     -H "Content-Type: application/json" \
     -d '{
       "host_id": "test-server-vast",
       "log_type": "auditd",
       "raw_log": "type=EXECVE msg=audit(1672531199.000:123): argc=3 a0=/tmp/suspicious_script.sh a1=-disable-logging",
       "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
   ```

---

## 📊 Step 4: Monitoring Real-Time Incidents on Vercel Dashboard

1. Open your Vercel URL in a browser: `https://<your-app>.vercel.app`.
2. Navigate to **Incidents**:
   * Confirm that the incidents triggered from your curl requests appear live in the UI.
3. Click an incident to inspect the **AI Reasoning Flow**:
   * **Triage & Forensics Agent**: View root cause analysis generated by the GPU instance on Vast.ai.
   * **Severity Scoring**: Inspect CVSS risk scores and MITRE ATT&CK mappings.
   * **Remediation Guardrail Check**: Review proposed containment scripts (e.g. blocking IP `192.168.1.100` or quarantining `/tmp/suspicious_script.sh`).
