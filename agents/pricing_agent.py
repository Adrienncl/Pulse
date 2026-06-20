"""
Pricing Agent
=============

Creates commercial offers and calculates margins.

Features:
- Dynamic pricing based on client needs
- Volume discounts
- Add-on options
- Cost breakdown
- Margin optimization
"""

from typing import Dict, Any, List
import json
from datetime import datetime

# ─── Package Definitions ─────────────────────────────────

PACKAGES = {
    "Starter Package": {
        "price": 299,
        "includes": [
            "One-page website",
            "Logo design (2 variations)",
            "3 social media post templates",
            "Brand color palette",
        ],
        "description": "Perfect for new businesses getting started",
        "delivery_time": "3-5 days",
        "revisions": 1,
    },
    "Local Business Launch Kit": {
        "price": 499,
        "includes": [
            "Website one-page",
            "Visual identity",
            "Color palette",
            "Marketing copy",
            "Image prompts",
            "5 social media posts",
            "Stripe checkout setup",
            "Website deployment",
            "Financial dashboard",
        ],
        "description": "Complete launch package for local businesses",
        "delivery_time": "5-7 days",
        "revisions": 2,
    },
    "Full Brand Package": {
        "price": 999,
        "includes": [
            "Everything in Local Business Launch Kit",
            "Multi-page website",
            "Complete brand guidelines",
            "20 social media posts",
            "Email templates",
            "Business cards design",
            "Letterhead design",
            "Social media kit",
        ],
        "description": "Full brand identity and digital presence",
        "delivery_time": "7-14 days",
        "revisions": 3,
    },
    "Premium Enterprise": {
        "price": 1999,
        "includes": [
            "Everything in Full Brand Package",
            "Custom animations & motion graphics",
            "Video content templates",
            "Advanced SEO optimization",
            "Analytics dashboard",
            "6-month social media calendar",
            "Brand strategy document",
            "Competitor analysis",
            "Priority support (30 days)",
        ],
        "description": "Enterprise-grade digital transformation",
        "delivery_time": "14-21 days",
        "revisions": 5,
    },
}

# ─── Cost Estimates ──────────────────────────────────────

COSTS = {
    "domain": 12,
    "hosting": 20,
    "production": 10,
    "ai_processing": 5,
    "payment_processing": 3,
}

# ─── Discount Rules ──────────────────────────────────────

DISCOUNTS = {
    "bulk_3": {"min_projects": 3, "percent": 5, "description": "5% volume discount (3+ projects)"},
    "bulk_5": {"min_projects": 5, "percent": 10, "description": "10% volume discount (5+ projects)"},
    "returning": {"percent": 8, "description": "8% returning client discount"},
    "urgent": {"percent": 15, "description": "15% express delivery surcharge"},
}

# ─── Add-on Options ──────────────────────────────────────

ADDONS = {
    "express_delivery": {"price": 99, "description": "Express 48h delivery"},
    "extra_revisions": {"price": 49, "description": "3 additional revision rounds"},
    "social_media_boost": {"price": 79, "description": "10 additional social media posts"},
    "seo_optimization": {"price": 149, "description": "Advanced SEO setup"},
    "email_templates": {"price": 59, "description": "5 custom email templates"},
}


def calculate_pricing(intake_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate pricing based on client requirements.

    Considers:
    - Business type and industry
    - Number and complexity of needs
    - Package selection
    - Available discounts
    - Cost structure

    Args:
        intake_data: Analysis results from the intake agent

    Returns:
        Dict with package, price, costs, margins, and recommendations
    """
    # Choose package based on needs
    package_name = intake_data.get("recommended_package", "Local Business Launch Kit")

    # If recommended package doesn't exist, use closest match
    if package_name not in PACKAGES:
        needs_count = len(intake_data.get("needs", []))
        if needs_count >= 4:
            package_name = "Full Brand Package"
        elif needs_count >= 2:
            package_name = "Local Business Launch Kit"
        else:
            package_name = "Starter Package"

    package = PACKAGES[package_name]

    # Base price
    base_price = package["price"]

    # Calculate costs
    cost_multiplier = 1.0
    if package_name == "Full Brand Package":
        cost_multiplier = 1.5
    elif package_name == "Premium Enterprise":
        cost_multiplier = 2.0
    elif package_name == "Starter Package":
        cost_multiplier = 0.6

    total_costs = sum(COSTS.values()) * cost_multiplier

    # Apply complexity adjustment
    needs_count = len(intake_data.get("needs", []))
    complexity_bonus = max(0, (needs_count - 2) * 15)

    final_price = base_price + complexity_bonus

    # Calculate profit
    profit = final_price - total_costs
    margin_percent = (profit / final_price) * 100 if final_price > 0 else 0

    # Suggest add-ons
    suggested_addons = []
    needs = intake_data.get("needs", [])
    if "seo" in needs or "marketing" in needs:
        suggested_addons.append({"name": "seo_optimization", **ADDONS["seo_optimization"]})
    if "email_marketing" in needs:
        suggested_addons.append({"name": "email_templates", **ADDONS["email_templates"]})
    if needs_count >= 3:
        suggested_addons.append({"name": "social_media_boost", **ADDONS["social_media_boost"]})

    return {
        "package_name": package_name,
        "price": final_price,
        "base_price": base_price,
        "complexity_adjustment": complexity_bonus,
        "estimated_costs": {k: round(v * cost_multiplier, 2) for k, v in COSTS.items()},
        "total_estimated_cost": round(total_costs, 2),
        "estimated_profit": round(profit, 2),
        "estimated_margin_percent": round(margin_percent, 2),
        "includes": package["includes"],
        "description": package["description"],
        "delivery_time": package["delivery_time"],
        "revisions": package["revisions"],
        "suggested_addons": suggested_addons,
        "explanation": (
            f"Based on the client's {intake_data.get('business_type', 'business')} needs "
            f"({needs_count} requirements detected), we recommend the {package_name} at ${final_price}. "
            f"This package includes {len(package['includes'])} deliverables with "
            f"{package['revisions']} revision rounds and {package['delivery_time']} delivery."
        ),
    }


def get_package_options() -> Dict[str, Any]:
    """Return all available packages and add-ons for the settings page."""
    return {
        "packages": PACKAGES,
        "addons": ADDONS,
        "discounts": DISCOUNTS,
        "costs": COSTS,
    }


# Example usage
if __name__ == "__main__":
    intake = {
        "business_type": "restaurant",
        "needs": ["website", "visual_identity", "social_media", "marketing"],
    }
    result = calculate_pricing(intake)
    print(json.dumps(result, indent=2))
