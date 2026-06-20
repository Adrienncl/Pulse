"""
Support Agent — Handles client modification requests with Nemotron
==================================================================
Processes client requests, auto-applies simple changes, and uses
Nemotron 3 Ultra for understanding complex modification requests.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import logging
import uuid
import sys
import os

logger = logging.getLogger("zes.support_agent")

# ─── Nemotron ─────────────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
try:
    from zes_connector import call_llm
    NEMOTRON_AVAILABLE = True
except ImportError:
    NEMOTRON_AVAILABLE = False

# ─── Modification Types ───────────────────────────────────────
MODIFICATION_TYPES = {
    "hours": {"name": "Opening Hours", "template_field": "opening_hours", "auto_apply": True},
    "menu": {"name": "Menu/Pricing", "template_field": "menu_items", "auto_apply": True},
    "contact": {"name": "Contact Info", "template_field": "contact_info", "auto_apply": True},
    "text": {"name": "Text Content", "template_field": "content", "auto_apply": False},
    "images": {"name": "Images/Photos", "template_field": "images", "auto_apply": False},
    "design": {"name": "Design/Style", "template_field": "design", "auto_apply": False},
}

# ─── In-memory store ──────────────────────────────────────────
_modification_requests: List[Dict[str, Any]] = []


def _classify_with_nemotron(request_details: str) -> Optional[Dict[str, Any]]:
    """Use Nemotron to classify and extract details from request."""
    if not NEMOTRON_AVAILABLE:
        return None
    
    types_desc = "\n".join([f"- {k}: {v['name']} (auto_apply={v['auto_apply']})" for k, v in MODIFICATION_TYPES.items()])
    
    prompt = f"""Classify this client modification request:

Request: "{request_details}"

Available modification types:
{types_desc}

Return JSON ONLY:
{{
    "type": "hours|menu|contact|text|images|design",
    "confidence": 0.0-1.0,
    "extracted_details": "What exactly needs to change",
    "auto_apply": true/false,
    "requires_approval": true/false,
    "suggested_response": "Brief response to client"
}}"""
    
    try:
        result = call_llm(prompt, temperature=0.1, max_tokens=300)
        if result and "type" in result:
            return result
    except Exception as e:
        logger.warning(f"Nemotron classification failed: {e}")
    
    return None


def create_modification_request(
    client_id: str, project_id: str, modification_type: str, request_details: str
) -> Dict[str, Any]:
    """Create a new modification request."""
    # Try Nemotron for smart classification
    nemotron_result = None
    if modification_type == "auto" or modification_type not in MODIFICATION_TYPES:
        nemotron_result = _classify_with_nemotron(request_details)
        if nemotron_result:
            modification_type = nemotron_result["type"]
    
    mod_type = MODIFICATION_TYPES.get(modification_type, MODIFICATION_TYPES["text"])
    auto_apply = mod_type["auto_apply"]
    
    request = {
        "request_id": str(uuid.uuid4())[:8],
        "client_id": client_id,
        "project_id": project_id,
        "type": modification_type,
        "type_name": mod_type["name"],
        "details": request_details,
        "status": "auto_applied" if auto_apply else "pending_approval",
        "auto_apply": auto_apply,
        "created_at": datetime.now().isoformat(),
        "applied_at": datetime.now().isoformat() if auto_apply else None,
        "classified_by": "nemotron" if nemotron_result else "rule-based",
        "confidence": nemotron_result.get("confidence", 0.9) if nemotron_result else 0.8,
        "extracted_details": nemotron_result.get("extracted_details", request_details) if nemotron_result else request_details,
    }
    
    _modification_requests.append(request)
    logger.info(f"📋 Support request {request['request_id']}: {modification_type} → {request['status']}")
    
    return request


def apply_modification(request_id: str) -> Dict[str, Any]:
    """Apply a pending modification request."""
    for req in _modification_requests:
        if req["request_id"] == request_id:
            req["status"] = "applied"
            req["applied_at"] = datetime.now().isoformat()
            return {"success": True, "request": req}
    return {"success": False, "error": "Request not found"}


def get_pending_requests() -> List[Dict[str, Any]]:
    """Get all pending modification requests."""
    return [r for r in _modification_requests if r["status"] == "pending_approval"]


def get_support_stats() -> Dict[str, Any]:
    """Get support statistics."""
    total = len(_modification_requests)
    pending = len(get_pending_requests())
    auto = sum(1 for r in _modification_requests if r["auto_apply"])
    
    return {
        "total_requests": total,
        "pending_approval": pending,
        "auto_applied": auto,
        "resolved": total - pending,
        "resolution_rate": f"{((total - pending) / total * 100):.0f}%" if total > 0 else "N/A",
        "nemotron_classified": sum(1 for r in _modification_requests if r.get("classified_by") == "nemotron"),
    }


# Seed data
if not _modification_requests:
    _modification_requests.append({
        "request_id": "demo_001",
        "client_id": "client_boulangerie",
        "project_id": "proj_001",
        "type": "hours",
        "type_name": "Opening Hours",
        "details": "Change opening hours to 7:00-19:00 Mon-Sat",
        "status": "auto_applied",
        "auto_apply": True,
        "created_at": (datetime.now() - timedelta(hours=3)).isoformat(),
        "applied_at": (datetime.now() - timedelta(hours=3)).isoformat(),
        "classified_by": "nemotron",
        "confidence": 0.95,
        "extracted_details": "Update opening hours to 7:00 AM - 7:00 PM, Monday to Saturday",
    })
    _modification_requests.append({
        "request_id": "demo_002",
        "client_id": "client_fitness",
        "project_id": "proj_002",
        "type": "images",
        "type_name": "Images/Photos",
        "details": "Add new fitness class photos to gallery",
        "status": "pending_approval",
        "auto_apply": False,
        "created_at": (datetime.now() - timedelta(hours=1)).isoformat(),
        "applied_at": None,
        "classified_by": "rule-based",
        "confidence": 0.8,
        "extracted_details": "Upload new fitness class photos to gallery section",
    })
