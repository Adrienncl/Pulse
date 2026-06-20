"""
Accounting Agent — Financial tracking with Nemotron-powered reporting
=====================================================================
Tracks transactions, generates reports, and produces financial insights
using Nemotron 3 Ultra for smart analysis.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import logging
import uuid
import sys
import os

logger = logging.getLogger("zes.accounting_agent")

# ─── Nemotron ─────────────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
try:
    from zes_connector import call_llm
    NEMOTRON_AVAILABLE = True
except ImportError:
    NEMOTRON_AVAILABLE = False

# ─── In-memory store ──────────────────────────────────────────
_transactions: List[Dict[str, Any]] = []
_projects: List[Dict[str, Any]] = []

# ─── Seed data ────────────────────────────────────────────────
if not _projects:
    _projects.extend([
        {
            "project_id": "proj_001",
            "client_name": "Boulangerie Martin",
            "package": "Local Business Launch Kit",
            "revenue": 514,
            "costs": 46.19,
            "profit": 467.81,
            "margin": 91.01,
            "status": "completed",
            "date": (datetime.now() - timedelta(days=1)).isoformat(),
        },
        {
            "project_id": "proj_002",
            "client_name": "Fitness Pulse",
            "package": "Growth Package",
            "revenue": 1499,
            "costs": 89.50,
            "profit": 1409.50,
            "margin": 94.03,
            "status": "completed",
            "date": (datetime.now() - timedelta(days=2)).isoformat(),
        },
        {
            "project_id": "proj_003",
            "client_name": "Craft Coffee Co.",
            "package": "Starter Package",
            "revenue": 499,
            "costs": 35.00,
            "profit": 464.00,
            "margin": 92.99,
            "status": "completed",
            "date": (datetime.now() - timedelta(days=3)).isoformat(),
        },
    ])


def record_transaction(
    transaction_type: str, amount: float, category: str,
    description: str, client_id: str = None, project_id: str = None
) -> Dict[str, Any]:
    """Record a financial transaction."""
    transaction = {
        "transaction_id": str(uuid.uuid4())[:8],
        "type": transaction_type,
        "amount": round(amount, 2),
        "category": category,
        "description": description,
        "client_id": client_id,
        "project_id": project_id,
        "balance_after": sum(t["amount"] for t in _transactions if t["type"] == "income") - sum(t["amount"] for t in _transactions if t["type"] == "expense") + amount,
        "created_at": datetime.now().isoformat(),
    }
    _transactions.append(transaction)
    return transaction


def generate_report(project_id: str = None, days: int = 30) -> Dict[str, Any]:
    """Generate a financial report with optional Nemotron analysis."""
    # Filter projects
    projects = _projects
    if project_id:
        projects = [p for p in projects if p["project_id"] == project_id]
    
    # Calculate stats
    total_revenue = sum(p["revenue"] for p in projects)
    total_costs = sum(p["costs"] for p in projects)
    total_profit = sum(p["profit"] for p in projects)
    avg_margin = sum(p["margin"] for p in projects) / len(projects) if projects else 0
    
    report = {
        "total_projects": len(projects),
        "total_revenue": round(total_revenue, 2),
        "total_costs": round(total_costs, 2),
        "total_profit": round(total_profit, 2),
        "avg_margin_percent": round(avg_margin, 2),
        "human_employees": 0,
        "projects": projects,
        "generated_at": datetime.now().isoformat(),
    }
    
    # Try Nemotron for smart insights
    if NEMOTRON_AVAILABLE and len(projects) > 0:
        try:
            prompt = f"""Analyze this agency financial data and provide key business insights:

{json.dumps(report, indent=2)}

Return JSON ONLY:
{{
    "summary": "One-line executive summary",
    "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
    "recommendation": "Strategic recommendation",
    "healthy": true/false,
    "score": "A+/A/B/C/D"
}}"""
            result = call_llm(prompt, temperature=0.1, max_tokens=400)
            if result and "insights" in result:
                report["insights"] = result["insights"]
                report["summary"] = result.get("summary", "")
                report["health_score"] = result.get("score", "N/A")
                report["_analysis"] = "nemotron-3-ultra-free"
        except Exception as e:
            logger.warning(f"Nemotron analysis failed: {e}")
    
    if "insights" not in report:
        report["insights"] = [
            f"Zero human employees — 100% autonomous operation",
            f"Average margin: {avg_margin:.1f}% across {len(projects)} projects",
            f"Total profit: ${total_profit:.2f}",
        ]
        report["_analysis"] = "rule-based"
    
    return report


def get_dashboard_stats() -> Dict[str, Any]:
    """Get dashboard statistics for the admin UI."""
    report = generate_report()
    
    return {
        "total_revenue": report["total_revenue"],
        "total_costs": report["total_costs"],
        "total_profit": report["total_profit"],
        "project_count": report["total_projects"],
        "active_projects": report["total_projects"],
        "avg_margin": report["avg_margin_percent"],
        "human_employees": 0,
        "insights": report.get("insights", []),
        "summary": report.get("summary", f"${report['total_profit']:.0f} profit from {report['total_projects']} autonomous projects"),
        "health_score": report.get("health_score", "A+"),
        "_analysis": report.get("_analysis", "rule-based"),
        "generated_at": report["generated_at"],
    }
