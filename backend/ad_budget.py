"""RankFix — Autonomous Ad Budget System

Stores and manages the advertising budget pool.
Revenue from Stripe payments flows into a pool.
The ad agent autonomously allocates budget to campaigns.
"""

import json
import os
import logging
import threading
from datetime import datetime, timedelta

logger = logging.getLogger("rankfix-ads")

BUDGET_FILE = "/tmp/rankfix/ad_budget.json"
REVENUE_LOG_FILE = "/tmp/rankfix/revenue_log.json"
BUDGET_LOCK = threading.Lock()

DEFAULT_CONFIG = {
    "revenue_share": 0.30,          # 30% of revenue → ad pool
    "min_budget": 50.0,             # Minimum 50€ to trigger a campaign
    "max_per_campaign": 0.30,       # Max 30% of available per campaign
    "min_per_campaign": 10.0,       # Minimum 10€ spend per campaign
    "cooldown_hours": 1,            # 1h between campaigns
    "campaign_duration_days": 7,    # Default campaign length
    "platforms": ["google-ads", "meta-ads"],
    "currency": "EUR",
    "auto_approve": True,           # Auto-approve campaigns (true) or require manual
    "traffic_check_enabled": True,  # Verify traffic after campaign
    "traffic_threshold_pct": 10,    # Require 10%+ traffic increase to pass
}

def _default_budget():
    return {
        "total_revenue": 0.0,
        "revenue_by_source": {"checkout": 0.0, "subscription": 0.0, "manual": 0.0},
        "ad_pool": 0.0,
        "ad_spent": 0.0,
        "ad_available": 0.0,
        "red_list": [],              # Platforms that failed traffic check
        "campaigns": [],
        "config": dict(DEFAULT_CONFIG),
        "stats": {
            "total_campaigns": 0,
            "active_campaigns": 0,
            "completed_campaigns": 0,
            "avg_roi": 0.0,
            "total_estimated_revenue": 0.0,
        },
        "updated_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
    }

def load_budget() -> dict:
    """Load budget from file, or create default."""
    try:
        if os.path.exists(BUDGET_FILE):
            with open(BUDGET_FILE) as f:
                data = json.load(f)
                defaults = _default_budget()
                for k, v in defaults.items():
                    if k not in data:
                        data[k] = v
                # Ensure revenue_by_source exists
                if "revenue_by_source" not in data:
                    data["revenue_by_source"] = {"checkout": 0.0, "subscription": 0.0, "manual": 0.0}
                return data
    except Exception as e:
        logger.warning(f"Failed to load budget: {e}")
    return _default_budget()

def save_budget(data: dict):
    """Save budget to file atomically."""
    os.makedirs(os.path.dirname(BUDGET_FILE), exist_ok=True)
    data["updated_at"] = datetime.now().isoformat()
    tmp = BUDGET_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, BUDGET_FILE)


# ─── Revenue Tracking ─────────────────────────────────

def add_revenue(amount: float, source: str = "checkout") -> dict:
    """Record new revenue and allocate share to ad pool."""
    with BUDGET_LOCK:
        budget = load_budget()
        budget["total_revenue"] += amount
        if source in budget["revenue_by_source"]:
            budget["revenue_by_source"][source] += amount
        else:
            budget["revenue_by_source"][source] = amount
        new_pool = amount * budget["config"]["revenue_share"]
        budget["ad_pool"] += new_pool
        budget["ad_available"] = budget["ad_pool"] - budget["ad_spent"]
        budget["updated_at"] = datetime.now().isoformat()
        save_budget(budget)
        # Log revenue event
        _log_revenue_event(amount, source, new_pool)
    logger.info(f"Revenue +{amount}€ ({source}) → ad pool +{new_pool:.2f}€")
    return budget

def _log_revenue_event(amount: float, source: str, pool_alloc: float):
    """Append to revenue log for history tracking."""
    try:
        events = []
        if os.path.exists(REVENUE_LOG_FILE):
            with open(REVENUE_LOG_FILE) as f:
                events = json.load(f)
        events.append({
            "amount": amount,
            "source": source,
            "pool_allocation": round(pool_alloc, 2),
            "timestamp": datetime.now().isoformat(),
        })
        # Keep last 100 events
        if len(events) > 100:
            events = events[-100:]
        with open(REVENUE_LOG_FILE, "w") as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to log revenue event: {e}")

def get_revenue_history(limit: int = 20) -> list:
    """Return recent revenue events."""
    try:
        if os.path.exists(REVENUE_LOG_FILE):
            with open(REVENUE_LOG_FILE) as f:
                events = json.load(f)
            return list(reversed(events))[:limit]
    except:
        pass
    return []


# ─── Campaign Management ──────────────────────────────

CAMPAIGN_STATUSES = ["pending", "approved", "running", "completed", "cancelled"]

def record_campaign(campaign: dict, current_traffic: int = 0) -> dict:
    """Record a new ad campaign with optional traffic baseline."""
    with BUDGET_LOCK:
        budget = load_budget()
        spend = campaign.get("budget", 0)
        campaign.setdefault("status", "approved" if budget["config"]["auto_approve"] else "pending")
        campaign.setdefault("campaign_type", "search")
        campaign.setdefault("duration_days", budget["config"]["campaign_duration_days"])
        campaign.setdefault("targeting", {})
        campaign.setdefault("estimated_impressions", int(spend * 200))
        campaign.setdefault("estimated_clicks", int(spend * 200 * 0.03))
        campaign.setdefault("estimated_conversions", int(spend * 200 * 0.03 * 0.10))
        campaign.setdefault("estimated_roi", round((spend * 3) - spend, 2))
        campaign.setdefault("actual_impressions", 0)
        campaign.setdefault("actual_clicks", 0)
        campaign.setdefault("actual_conversions", 0)
        campaign.setdefault("actual_spend", 0)
        campaign["traffic_baseline"] = current_traffic or len(budget["campaigns"])
        campaign["id"] = f"camp_{len(budget['campaigns']) + 1}"
        campaign["created_at"] = datetime.now().isoformat()
        campaign["started_at"] = campaign.get("started_at", datetime.now().isoformat())
        campaign["end_date"] = (datetime.now() + timedelta(days=campaign["duration_days"])).isoformat()

        if campaign["status"] == "approved":
            budget["ad_spent"] += spend
            budget["ad_available"] = budget["ad_pool"] - budget["ad_spent"]

        budget["campaigns"].append(campaign)
        budget["stats"]["total_campaigns"] = len(budget["campaigns"])
        budget["stats"]["active_campaigns"] = sum(1 for c in budget["campaigns"] if c["status"] in ("approved", "running"))
        budget["stats"]["completed_campaigns"] = sum(1 for c in budget["campaigns"] if c["status"] == "completed")
        save_budget(budget)
    logger.info(f"Campaign {campaign['id']}: {campaign['platform']} - {spend}€ [{campaign['status']}]")
    return budget

def update_campaign_status(campaign_id: str, status: str, metrics: dict = None) -> dict:
    """Update campaign status and actual metrics."""
    if status not in CAMPAIGN_STATUSES:
        raise ValueError(f"Invalid status: {status}. Must be one of {CAMPAIGN_STATUSES}")
    with BUDGET_LOCK:
        budget = load_budget()
        for c in budget["campaigns"]:
            if c["id"] == campaign_id:
                c["status"] = status
                c["updated_at"] = datetime.now().isoformat()
                if status == "completed":
                    c["completed_at"] = datetime.now().isoformat()
                if metrics:
                    for k, v in metrics.items():
                        if k in ("actual_impressions", "actual_clicks", "actual_conversions", "actual_spend", "actual_roi", "stripe_session_id", "stripe_url", "stripe_mode", "traffic_baseline", "traffic_check"):
                            c[k] = v
                            c["updated_at"] = datetime.now().isoformat()
                break
        budget["stats"]["active_campaigns"] = sum(1 for c in budget["campaigns"] if c["status"] in ("approved", "running"))
        budget["stats"]["completed_campaigns"] = sum(1 for c in budget["campaigns"] if c["status"] == "completed")
        save_budget(budget)
    return budget

def get_campaign(campaign_id: str) -> dict:
    """Get a single campaign by ID."""
    budget = load_budget()
    for c in budget["campaigns"]:
        if c["id"] == campaign_id:
            return c
    return None

def get_active_campaigns() -> list:
    """Return currently active campaigns."""
    budget = load_budget()
    return [c for c in budget["campaigns"] if c["status"] in ("approved", "running")]


# ─── Budget Queries ───────────────────────────────────

def get_budget() -> dict:
    """Return current budget state with computed stats."""
    with BUDGET_LOCK:
        budget = load_budget()
        # Compute stats
        campaigns = budget.get("campaigns", [])
        active = [c for c in campaigns if c["status"] in ("approved", "running")]
        completed = [c for c in campaigns if c["status"] == "completed"]
        total_roi = sum(c.get("estimated_roi", 0) for c in campaigns)
        budget["stats"] = {
            "total_campaigns": len(campaigns),
            "active_campaigns": len(active),
            "completed_campaigns": len(completed),
            "avg_roi": round(total_roi / len(campaigns), 2) if campaigns else 0,
            "total_estimated_revenue": round(sum(c.get("estimated_roi", 0) + c.get("budget", 0) for c in campaigns), 2),
        }
        return budget

def can_launch_campaign() -> tuple:
    """Check if budget allows a new campaign. Returns (can_launch, reason)."""
    budget = load_budget()
    available = budget["ad_available"]
    cfg = budget["config"]
    min_budget = cfg["min_budget"]
    if available < min_budget:
        return False, f"Budget insuffisant: {available:.2f}€ < {min_budget}€ minimum"
    if available < cfg["min_per_campaign"]:
        return False, f"Budget trop faible pour une campagne: {available:.2f}€ < {cfg['min_per_campaign']}€"
    if budget["campaigns"]:
        last = budget["campaigns"][-1]
        last_time = datetime.fromisoformat(last["created_at"])
        cooldown = timedelta(hours=cfg["cooldown_hours"])
        if datetime.now() - last_time < cooldown:
            remaining = cooldown - (datetime.now() - last_time)
            mins = int(remaining.total_seconds() / 60)
            return False, f"Cooldown: dernière campagne il y a {mins}min (attendre {cfg['cooldown_hours']}h)"
    return True, "Budget suffisant ✓"

def get_campaign_max_budget() -> float:
    """Calculate max spend for next campaign."""
    budget = load_budget()
    available = budget["ad_available"]
    max_share = budget["config"]["max_per_campaign"]
    return round(min(available * max_share, available), 2)

def get_campaign_min_budget() -> float:
    """Calculate min spend for next campaign."""
    budget = load_budget()
    return max(budget["config"]["min_per_campaign"], budget["config"]["min_budget"] * 0.2)


# ─── Config Management ────────────────────────────────

def update_config(updates: dict) -> dict:
    """Update budget configuration."""
    with BUDGET_LOCK:
        budget = load_budget()
        for k, v in updates.items():
            if k in budget["config"]:
                budget["config"][k] = v
        save_budget(budget)
    return budget["config"]


# ─── Red List (failed platforms) ──────────────────────────

def add_to_red_list(platform: str, reason: str = "No traffic increase after campaign") -> dict:
    """Add a platform to the red list (failed traffic check)."""
    with BUDGET_LOCK:
        budget = load_budget()
        # Don't add duplicates
        for entry in budget["red_list"]:
            if entry["platform"] == platform:
                entry["count"] += 1
                entry["last_failed"] = datetime.now().isoformat()
                entry["reason"] = reason
                save_budget(budget)
                return budget
        budget["red_list"].append({
            "platform": platform,
            "reason": reason,
            "count": 1,
            "last_failed": datetime.now().isoformat(),
            "banned_at": datetime.now().isoformat(),
        })
        save_budget(budget)
    logger.warning(f"🚫 {platform} added to red list — {reason}")
    return budget

def remove_from_red_list(platform: str) -> dict:
    """Remove a platform from the red list (manual override)."""
    with BUDGET_LOCK:
        budget = load_budget()
        budget["red_list"] = [e for e in budget["red_list"] if e["platform"] != platform]
        save_budget(budget)
    logger.info(f"✅ {platform} removed from red list")
    return budget

def get_available_platforms() -> list:
    """Return platforms that are NOT on the red list."""
    budget = load_budget()
    redlisted = {e["platform"] for e in budget["red_list"]}
    return [p for p in budget["config"]["platforms"] if p not in redlisted]

def check_campaign_traffic(campaign_id: str, current_traffic: int) -> dict:
    """Check if a campaign generated traffic. If not, red-list the platform."""
    budget = load_budget()
    campaign = None
    for c in budget["campaigns"]:
        if c["id"] == campaign_id:
            campaign = c
            break
    if not campaign:
        return {"status": "error", "message": "Campaign not found"}

    baseline = campaign.get("traffic_baseline", 0)
    threshold = budget["config"]["traffic_threshold_pct"]

    if baseline > 0:
        increase_pct = ((current_traffic - baseline) / baseline) * 100
        passed = increase_pct >= threshold
        campaign["traffic_check"] = {
            "baseline": baseline,
            "current": current_traffic,
            "increase_pct": round(increase_pct, 1),
            "threshold": threshold,
            "passed": passed,
        }
        if not passed and budget["config"]["traffic_check_enabled"]:
            add_to_red_list(
                campaign.get("platform", "unknown"),
                f"Only {increase_pct:.1f}% traffic increase (needed {threshold}%)"
            )
        return {"status": "checked", "passed": passed, "increase_pct": round(increase_pct, 1), "traffic_check": campaign["traffic_check"]}
    return {"status": "skipped", "message": "No baseline to compare"}
