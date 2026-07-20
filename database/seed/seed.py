import os
import json
import logging
from datetime import datetime, timezone
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.server import Server
from app.models.incident import Incident
from app.models.approval import Approval

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentinel.seed")

SEED_DIR = os.path.dirname(os.path.abspath(__file__))

def seed_database():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        users_file = os.path.join(SEED_DIR, "users.json")
        if os.path.exists(users_file):
            with open(users_file, "r") as f:
                users_data = json.load(f)
                for u in users_data:
                    existing = db.query(User).filter(User.id == u["id"]).first()
                    if not existing:
                        user = User(
                            id=u["id"],
                            email=u["email"],
                            password_hash=get_password_hash(u["password"]),
                            full_name=u["full_name"],
                            role=u["role"],
                            is_active=u["is_active"]
                        )
                        db.add(user)
                        logger.info(f"Seeded user: {u['email']}")

        # 2. Seed Servers
        servers_file = os.path.join(SEED_DIR, "servers.json")
        if os.path.exists(servers_file):
            with open(servers_file, "r") as f:
                servers_data = json.load(f)
                for s in servers_data:
                    existing = db.query(Server).filter(Server.id == s["id"]).first()
                    if not existing:
                        server = Server(
                            id=s["id"],
                            hostname=s["hostname"],
                            ip_address=s["ip_address"],
                            os=s["os"],
                            specs=s["specs"],
                            agent_token=s["agent_token"],
                            status=s["status"],
                            last_ping=datetime.now(timezone.utc)
                        )
                        db.add(server)
                        logger.info(f"Seeded server: {s['hostname']}")

        # 3. Seed Incidents & Approvals
        incidents_file = os.path.join(SEED_DIR, "incidents.json")
        if os.path.exists(incidents_file):
            with open(incidents_file, "r") as f:
                incidents_data = json.load(f)
                for inc in incidents_data:
                    existing = db.query(Incident).filter(Incident.id == inc["id"]).first()
                    if not existing:
                        incident = Incident(
                            id=inc["id"],
                            server_id=inc["server_id"],
                            title=inc["title"],
                            matched_rule=inc["matched_rule"],
                            mitre_technique=inc["mitre_technique"],
                            status=inc["status"],
                            severity=inc["severity"],
                            raw_log=inc["raw_log"],
                            details=inc["details"],
                            remediation=inc["remediation"],
                            timeline=[
                                {"time": datetime.now(timezone.utc).isoformat(), "event": f"Seeded event: {inc['title']}"}
                            ]
                        )
                        db.add(incident)
                        logger.info(f"Seeded incident: {inc['id']}")

                        # Create matching approval if status is PENDING_APPROVAL
                        if inc["status"] == "PENDING_APPROVAL":
                            app_id = f"appr_{inc['id']}"
                            existing_app = db.query(Approval).filter(Approval.id == app_id).first()
                            if not existing_app:
                                approval = Approval(
                                    id=app_id,
                                    incident_id=inc["id"],
                                    server_id=inc["server_id"],
                                    severity=inc["severity"],
                                    proposed_action=inc["remediation"]["action_taken"],
                                    script_to_run=inc["remediation"]["script_executed"],
                                    risk_explanation=inc["details"]["root_cause"],
                                    status="PENDING"
                                )
                                db.add(approval)
                                logger.info(f"Seeded pending approval: {app_id}")

        db.commit()
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
