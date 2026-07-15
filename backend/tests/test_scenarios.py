import os
import sys

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.server import Server
from app.models.incident import Incident
from app.models.approval import Approval
from ai_engine.workflows.threat_graph import run_threat_investigation
from detection_engine.sigma.parser import sigma_parser
from detection_engine.yara.scanner import yara_scanner
from remediation.policies.guardrails import guardrails

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    db = SessionLocal()
    # Bootstrap default server for integration tests
    server = db.query(Server).filter(Server.id == "srv_db_prod01").first()
    if not server:
        server = Server(
            id="srv_db_prod01",
            hostname="db-prod-01.sentinel.local",
            ip_address="10.0.10.15",
            os="Ubuntu 22.04 LTS",
            agent_token="agt_test_token"
        )
        db.add(server)
        db.commit()
    yield db
    db.close()

def test_api_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SentinelAI"

@pytest.mark.asyncio
async def test_scenario_1_ssh_brute_force():
    """Scenario 1: SSH Brute Force Attack -> LOW severity -> Automatic IP drop."""
    raw_log = {"failed_attempts": 15, "ip": "198.51.100.45", "user": "root"}
    eval_res = sigma_parser.evaluate_log(raw_log)
    assert eval_res is not None
    assert eval_res["rule_id"] == "ssh_brute_force"

    # Register incident via API
    resp = client.post("/api/v1/incidents", json={
        "server_id": "srv_db_prod01",
        "title": eval_res["title"],
        "matched_rule": eval_res["rule_id"],
        "raw_log": raw_log
    })
    assert resp.status_code == 201
    inc_id = resp.json()["id"]

    # Run AI Threat Investigation
    await run_threat_investigation(inc_id)

    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == inc_id).first()
    assert incident.severity in ["LOW", "MEDIUM"]
    assert incident.status == "RESOLVED"
    assert incident.remediation["auto_fixed"] is True
    assert "198.51.100.45" in incident.remediation["action_taken"]
    db.close()

@pytest.mark.asyncio
async def test_scenario_2_cryptominer_execution():
    """Scenario 2: Cryptominer Execution -> MEDIUM severity -> Automatic process kill & binary quarantine."""
    raw_log = {"proc_path": "/tmp/xmrig", "cmdline": "/tmp/xmrig -o stratum+tcp://pool.xmrig.com"}
    eval_res = sigma_parser.evaluate_log(raw_log)
    assert eval_res is not None
    assert eval_res["rule_id"] == "exec_from_tmp"

    resp = client.post("/api/v1/incidents", json={
        "server_id": "srv_db_prod01",
        "title": eval_res["title"],
        "matched_rule": eval_res["rule_id"],
        "raw_log": raw_log
    })
    inc_id = resp.json()["id"]

    await run_threat_investigation(inc_id)

    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == inc_id).first()
    assert incident.severity == "MEDIUM"
    assert incident.status == "RESOLVED"
    assert incident.remediation["auto_fixed"] is True
    assert "quarantine" in incident.remediation["action_taken"].lower()
    db.close()

@pytest.mark.asyncio
async def test_scenario_3_privilege_escalation():
    """Scenario 3: Privilege Escalation -> HIGH severity -> PENDING_APPROVAL -> Human Approval."""
    raw_log = {"uid": 0, "previous_uid": 1001, "cmdline": "./dirty_pipe_exploit"}
    eval_res = sigma_parser.evaluate_log(raw_log)
    assert eval_res is not None
    assert eval_res["rule_id"] == "anomalous_priv_esc"

    resp = client.post("/api/v1/incidents", json={
        "server_id": "srv_db_prod01",
        "title": eval_res["title"],
        "matched_rule": eval_res["rule_id"],
        "raw_log": raw_log
    })
    inc_id = resp.json()["id"]

    await run_threat_investigation(inc_id)

    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == inc_id).first()
    assert incident.severity == "HIGH"
    assert incident.status == "PENDING_APPROVAL"

    approval = db.query(Approval).filter(Approval.incident_id == inc_id).first()
    assert approval is not None
    assert approval.status == "PENDING"

    # Human approves action via API endpoint
    appr_resp = client.post(f"/api/v1/approvals/{approval.id}/approve", json={
        "approver_notes": "Verified exploit. Executing account lock."
    })
    assert appr_resp.status_code == 200

    db.refresh(incident)
    assert incident.status == "RESOLVED"
    db.close()

@pytest.mark.asyncio
async def test_scenario_4_ransomware_detection():
    """Scenario 4: Ransomware Attack -> CRITICAL severity -> Entropy Analysis (>7.5) -> Safe Freeze (kill -STOP) -> Human Approval."""
    # High entropy cipher buffer using cryptographically random bytes (Shannon entropy ~7.99)
    dummy_encrypted_data = os.urandom(2048)
    entropy_scan = yara_scanner.scan_file_buffer("important.locked", dummy_encrypted_data)
    assert entropy_scan["is_encrypted_anomaly"] is True

    raw_log = {"file_writes_per_sec": 45, "file_extensions": [".locked"]}
    eval_res = sigma_parser.evaluate_log(raw_log)
    assert eval_res["rule_id"] == "ransomware_file_encrypt"

    resp = client.post("/api/v1/incidents", json={
        "server_id": "srv_db_prod01",
        "title": eval_res["title"],
        "matched_rule": eval_res["rule_id"],
        "raw_log": raw_log
    })
    inc_id = resp.json()["id"]

    await run_threat_investigation(inc_id)

    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == inc_id).first()
    assert incident.severity == "CRITICAL"
    assert incident.status == "PENDING_APPROVAL"

    approval = db.query(Approval).filter(Approval.incident_id == inc_id).first()
    assert approval is not None

    appr_resp = client.post(f"/api/v1/approvals/{approval.id}/approve", json={
        "approver_notes": "Confirmed ransomware process frozen. Restoring snapshot."
    })
    assert appr_resp.status_code == 200

    db.refresh(incident)
    assert incident.status == "RESOLVED"
    db.close()

def test_remediation_guardrails():
    """Verify whitelist regex guardrail prevents shell command injection."""
    valid_cmd = "iptables -A INPUT -s 198.51.100.45 -j DROP"
    is_valid, _ = guardrails.validate_command(valid_cmd)
    assert is_valid is True

    malicious_cmd = "iptables -A INPUT -s 10.0.0.1 -j DROP; rm -rf /"
    is_valid, reason = guardrails.validate_command(malicious_cmd)
    assert is_valid is False
    assert "failed security regex whitelist check" in reason
