import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("sentinel.services.email")

class NotificationService:
    def send_email(self, subject: str, body: str, recipient: Optional[str] = None) -> bool:
        to_email = recipient or settings.ADMIN_EMAIL
        
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.info(f"[Email Dry Run] To: {to_email} | Subject: {subject}\nBody preview: {body[:150]}...")
            return True

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.ADMIN_EMAIL
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            logger.info(f"Email alert successfully dispatched to {to_email}.")
            return True
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
            return False

    async def send_slack_webhook(self, message: str) -> bool:
        if not settings.SLACK_WEBHOOK_URL:
            logger.info(f"[Slack Dry Run] Message: {message[:150]}...")
            return True

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(settings.SLACK_WEBHOOK_URL, json={"text": message})
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Failed to post Slack notification: {e}")
            return False

    def send_incident_alert(self, incident_data: Dict[str, Any]):
        subject = f"[SentinelAI Alert] {incident_data.get('severity', 'LOW')} Threat Detected: {incident_data.get('title')}"
        body = f"""SentinelAI Autonomous SOC Alert

Incident ID: {incident_data.get('id')}
Severity: {incident_data.get('severity')}
Matched Rule: {incident_data.get('matched_rule')}
Status: {incident_data.get('status')}

View full forensics on the SentinelAI Dashboard.
"""
        self.send_email(subject, body)

    def send_approval_request(self, approval_data: Dict[str, Any]):
        subject = f"[SentinelAI Approval Required] {approval_data.get('severity')} Action Hold: {approval_data.get('proposed_action')}"
        body = f"""SentinelAI Human Approval Required

Approval ID: {approval_data.get('id')}
Incident ID: {approval_data.get('incident_id')}
Severity: {approval_data.get('severity')}
Proposed Action: {approval_data.get('proposed_action')}
Script: {approval_data.get('script_to_run')}
Risk Explanation: {approval_data.get('risk_explanation')}

Please log into the SentinelAI Dashboard to approve or reject this remediation action.
"""
        self.send_email(subject, body)

email_service = NotificationService()
