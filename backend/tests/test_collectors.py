import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.server import Server
from app.models.incident import Incident
from collectors.parser.normalizer import log_normalizer
from collectors.parser.log_parser import log_parser
from detection_engine.detectors.brute_force import brute_force_detector

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    db = SessionLocal()
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

def test_log_parser_syslog():
    line = "Jul 19 22:00:00 test-host sshd[12345]: Failed password for root from 198.51.100.45 port 54321 ssh2"
    res = log_parser.parse_syslog(line)
    assert res["user"] == "root"
    assert res["ip"] == "198.51.100.45"
    assert res["port"] == 54321
    assert res["failed_attempt"] is True

def test_log_parser_auditd():
    line = 'type=SYSCALL msg=audit(1687518000.123:456): arch=c000003e syscall=59 success=yes exit=0 ppid=123 pid=12845 auid=1000 uid=1001 comm="xmrig" exe="/tmp/xmrig"'
    res = log_parser.parse_auditd(line)
    assert res["pid"] == 12845
    assert res["uid"] == 1001
    assert res["comm"] == "xmrig"
    assert res["exe"] == "/tmp/xmrig"

def test_log_normalizer():
    raw_log = "Jul 19 22:00:00 test-host sshd[12345]: Failed password for admin from 10.0.0.5 port 2222 ssh2"
    normalized = log_normalizer.normalize(raw_log, "auth")
    assert normalized["event_type"] == "auth"
    assert normalized["user"] == "admin"
    assert normalized["src_ip"] == "10.0.0.5"
    assert normalized["src_port"] == 2222

def test_collectors_api_ingestion():
    headers = {"Authorization": "Bearer agt_test_token"}
    payload = {
        "source_type": "auth",
        "logs": "Jul 19 22:00:00 test-host sshd[12345]: Failed password for root from 198.51.100.45 port 54321 ssh2"
    }
    response = client.post("/api/v1/collectors/logs", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["processed_count"] == 1
    assert len(data["incidents_created"]) == 1
    
    # Verify in DB
    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == data["incidents_created"][0]).first()
    assert incident is not None
    assert incident.matched_rule == "ssh_brute_force"
    assert incident.severity == "LOW"
    db.close()
