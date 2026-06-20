"""
Email Agent — Gère la communication client via SMTP + Nemotron
===============================================================
Envoie des emails personnalisés avec contenu généré par Nemotron 3 Ultra.
Support SMTP réel avec fallback simulation.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import json
import os
import sys
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("zes.email_agent")

# ─── SMTP Config ──────────────────────────────────────────────
SMTP_CONFIG = {
    "host": os.getenv("SMTP_HOST", ""),
    "port": int(os.getenv("SMTP_PORT", "587")),
    "user": os.getenv("SMTP_USER", ""),
    "password": os.getenv("SMTP_PASS", ""),
    "from_email": os.getenv("SMTP_FROM", "studio@zero-employee.com"),
    "from_name": os.getenv("SMTP_FROM_NAME", "Zero Employee Studio"),
}

SMTP_ENABLED = all([SMTP_CONFIG["host"], SMTP_CONFIG["user"], SMTP_CONFIG["password"]])

# ─── In-memory email history ──────────────────────────────────
_email_history: List[Dict[str, Any]] = []

# ─── Nemotron Integration ─────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
try:
    from zes_connector import call_llm
    NEMOTRON_AVAILABLE = True
except ImportError:
    NEMOTRON_AVAILABLE = False


def _send_smtp(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via SMTP."""
    if not SMTP_ENABLED:
        logger.info(f"📧 SMTP not configured — simulated send to {to_email}")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SMTP_CONFIG['from_name']} <{SMTP_CONFIG['from_email']}>"
        msg["To"] = to_email
        
        msg.attach(MIMEText(html_body, "html"))
        
        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_CONFIG["host"], SMTP_CONFIG["port"]) as server:
            server.starttls(context=ctx)
            server.login(SMTP_CONFIG["user"], SMTP_CONFIG["password"])
            server.sendmail(SMTP_CONFIG["from_email"], [to_email], msg.as_string())
        
        logger.info(f"📧 Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.warning(f"📧 SMTP failed: {e}")
        return False


def _generate_with_nemotron(template_type: str, context: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """Use Nemotron to generate personalized email content."""
    if not NEMOTRON_AVAILABLE:
        return None
    
    context_str = json.dumps(context, indent=2)
    
    prompt = f"""Generate a professional email for a creative agency client.

Email type: {template_type}
Client context: {context_str}

Return JSON ONLY:
{{
    "subject": "Email subject line (max 10 words)",
    "body_html": "<html><body>Full HTML email body with inline CSS</body></html>",
    "body_text": "Plain text version"
}}

Write in the same language as the client's business name or English if unknown."""
    
    try:
        result = call_llm(prompt, temperature=0.3, max_tokens=1000)
        if result and "subject" in result:
            return result
    except Exception as e:
        logger.warning(f"Nemotron email generation failed: {e}")
    
    return None


def process_client_email(
    client_name: str,
    client_email: str,
    email_type: str,
    template_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Process and send a client email.
    
    Args:
        client_name: Client name
        client_email: Client email address
        email_type: Type of email (welcome, invoice, modification, status)
        template_data: Additional data for template
    
    Returns:
        Dict with status, message_id, delivery_info
    """
    context = {
        "client_name": client_name,
        "client_email": client_email,
        "email_type": email_type,
        **(template_data or {})
    }
    
    # Try Nemotron for smart content generation
    nemotron_content = _generate_with_nemotron(email_type, context)
    
    if nemotron_content:
        subject = nemotron_content["subject"]
        body_html = nemotron_content["body_html"]
        body_text = nemotron_content.get("body_text", "")
    else:
        # Fallback templates
        if email_type == "welcome":
            subject = f"Welcome {client_name}! Your project is ready 🎉"
            body_html = f"<h1>Welcome {client_name}!</h1><p>Your project is ready. Check your dashboard for details.</p>"
            body_text = f"Welcome {client_name}! Your project is ready."
        elif email_type == "invoice":
            subject = f"Invoice for {client_name}"
            body_html = f"<h1>Invoice</h1><p>Your invoice is attached.</p>"
            body_text = f"Invoice for {client_name}"
        else:
            subject = f"Update: {client_name}"
            body_html = f"<p>Status update for {client_name}.</p>"
            body_text = f"Status update for {client_name}"
    
    # Send email
    sent = _send_smtp(client_email, subject, body_html)
    
    # Record in history
    record = {
        "message_id": f"email_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(client_email) % 10000:04d}",
        "client_name": client_name,
        "client_email": client_email,
        "type": email_type,
        "subject": subject,
        "sent": sent,
        "smtp_enabled": SMTP_ENABLED,
        "generated_by": "nemotron" if nemotron_content else "template",
        "created_at": datetime.now().isoformat(),
    }
    _email_history.append(record)
    
    return record


def get_email_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Get email history."""
    return list(reversed(_email_history))[:limit]


# Pre-load example history for the dashboard
if not _email_history:
    _email_history.extend([
        {
            "message_id": "demo_001",
            "client_name": "Boulangerie Martin",
            "client_email": "contact@boulangerie-martin.fr",
            "type": "welcome",
            "subject": "Welcome Boulangerie Martin! Your site is ready 🎉",
            "sent": True,
            "smtp_enabled": SMTP_ENABLED,
            "generated_by": "nemotron",
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
        },
        {
            "message_id": "demo_002",
            "client_name": "Fitness Pulse",
            "client_email": "hello@fitnesspulse.com",
            "type": "invoice",
            "subject": "Invoice #ZES-20260617 — Fitness Pulse",
            "sent": True,
            "smtp_enabled": SMTP_ENABLED,
            "generated_by": "nemotron",
            "created_at": (datetime.now() - timedelta(hours=1)).isoformat(),
        },
    ])
