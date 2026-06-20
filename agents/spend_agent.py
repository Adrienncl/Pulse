"""
Spend & Provisioning Agent
===========================

Simulates real-world procurement for a client project.
Purchases domain, hosting, SSL, email, CDN — just like a real agency would.

No token tracking (negligible cost, no demo value).
Focus: realistic business expenses judges can relate to.
"""

from typing import Dict, Any, List
import uuid

# ─── Real-World Cost Table ──────────────────────────────────

PROVISIONS = {
    "domain": {
        "type": "domain",
        "icon": "🌐",
        "provider": "Namecheap",
        "description": "Domain name registration",
        "options": [
            {"tld": ".com", "cost": 9.98, "billing": "yearly"},
            {"tld": ".studio", "cost": 14.98, "billing": "yearly"},
            {"tld": ".restaurant", "cost": 19.98, "billing": "yearly"},
            {"tld": ".shop", "cost": 12.98, "billing": "yearly"},
            {"tld": ".fr", "cost": 8.99, "billing": "yearly"},
        ],
        "default_tld": ".com",
    },
    "hosting": {
        "type": "hosting",
        "icon": "🖥️",
        "provider": "Vercel",
        "description": "Static site hosting + CDN + auto-deploy",
        "options": [
            {"plan": "Hobby", "cost": 0, "billing": "monthly", "features": "Personal projects, 100GB bandwidth"},
            {"plan": "Pro", "cost": 20, "billing": "monthly", "features": "Custom domains, 1TB bandwidth, analytics"},
            {"plan": "Business", "cost": 50, "billing": "monthly", "features": "Team, SSO, priority support"},
        ],
        "default_plan": "Pro",
    },
    "ssl": {
        "type": "ssl",
        "icon": "🔒",
        "provider": "Let's Encrypt",
        "description": "SSL/TLS certificate for HTTPS",
        "options": [
            {"plan": "Free SSL", "cost": 0, "billing": "yearly", "features": "Auto-renewing, wildcard"},
            {"plan": "Premium SSL", "cost": 49, "billing": "yearly", "features": "EV certificate, warranty"},
        ],
        "default_plan": "Free SSL",
    },
    "email": {
        "type": "email",
        "icon": "📧",
        "provider": "Zoho Mail",
        "description": "Professional email hosting",
        "options": [
            {"plan": "Free", "cost": 0, "billing": "monthly", "features": "5GB, 1 user, custom domain"},
            {"plan": "Mail Lite", "cost": 1, "billing": "monthly", "features": "5GB/user, 1 domain, no ads"},
            {"plan": "Workplace", "cost": 4, "billing": "monthly", "features": "50GB, video conf, 300GB storage"},
        ],
        "default_plan": "Mail Lite",
    },
    "analytics": {
        "type": "analytics",
        "icon": "📊",
        "provider": "Google Analytics",
        "description": "Website analytics and tracking",
        "options": [
            {"plan": "GA4 Free", "cost": 0, "billing": "monthly", "features": "Unlimited events, basic reports"},
            {"plan": "GA360", "cost": 150, "billing": "monthly", "features": "Advanced analysis, BigQuery export"},
        ],
        "default_plan": "GA4 Free",
    },
    "cdn": {
        "type": "cdn",
        "icon": "⚡",
        "provider": "Cloudflare",
        "description": "CDN, DDoS protection, caching",
        "options": [
            {"plan": "Free", "cost": 0, "billing": "monthly", "features": "Basic CDN, DDoS, SSL"},
            {"plan": "Pro", "cost": 20, "billing": "monthly", "features": "Image optimization, WAF, faster routing"},
        ],
        "default_plan": "Free",
    },
    "stripe_fees": {
        "type": "stripe_fees",
        "icon": "💳",
        "provider": "Stripe",
        "description": "Payment processing fees",
        "percentage": 2.9,
        "fixed": 0.30,
        "note": "2.9% + $0.30 per transaction",
    },
}


# ─── Main Function ─────────────────────────────────────────

def calculate_procurement(
    revenue: float,
    business_type: str = "general",
    client_name: str = "Client"
) -> Dict[str, Any]:
    """
    Calculate all costs needed to set up and run the client's online presence.
    
    The agent "purchases" each provision automatically — no human needed.
    
    Args:
        revenue: Client payment amount
        business_type: Type of business (for domain suggestions)
        client_name: Client name (for domain generation)
    
    Returns:
        Dict with procurement_decision, resources purchased, costs, profit
    """
    resources = []
    total_monthly = 0.0
    total_upfront = 0.0
    
    # ─── 1. Domain Name ────────────────────────────────────
    domain_name = _generate_domain_name(client_name, business_type)
    tld = _select_tld(business_type)
    domain_cost = _get_option_cost("domain", tld)
    
    resources.append({
        "type": "domain",
        "icon": "🌐",
        "action": "PURCHASED",
        "item": f"{domain_name}{tld}",
        "provider": "Namecheap",
        "cost": domain_cost,
        "billing": "yearly",
        "status": "active",
    })
    total_upfront += domain_cost
    
    # ─── 2. Hosting ────────────────────────────────────────
    hosting = PROVISIONS["hosting"]
    plan = hosting["options"][1]  # Pro plan
    resources.append({
        "type": "hosting",
        "icon": "🖥️",
        "action": "PROVISIONED",
        "item": f"Vercel {plan['plan']}",
        "provider": "Vercel",
        "cost": plan["cost"],
        "billing": "monthly",
        "features": plan["features"],
        "status": "active",
    })
    total_monthly += plan["cost"]
    
    # ─── 3. SSL Certificate ────────────────────────────────
    ssl = PROVISIONS["ssl"]
    ssl_plan = ssl["options"][0]  # Free SSL
    resources.append({
        "type": "ssl",
        "icon": "🔒",
        "action": "INSTALLED",
        "item": ssl_plan["plan"],
        "provider": "Let's Encrypt",
        "cost": ssl_plan["cost"],
        "billing": "yearly",
        "features": ssl_plan["features"],
        "status": "active",
    })
    total_upfront += ssl_plan["cost"]
    
    # ─── 4. Professional Email ─────────────────────────────
    email = PROVISIONS["email"]
    email_plan = email["options"][1]  # Mail Lite
    resources.append({
        "type": "email",
        "icon": "📧",
        "action": "CONFIGURED",
        "item": f"Zoho {email_plan['plan']}",
        "provider": "Zoho Mail",
        "cost": email_plan["cost"],
        "billing": "monthly",
        "features": email_plan["features"],
        "status": "active",
    })
    total_monthly += email_plan["cost"]
    
    # ─── 5. Analytics ──────────────────────────────────────
    analytics = PROVISIONS["analytics"]
    resources.append({
        "type": "analytics",
        "icon": "📊",
        "action": "ENABLED",
        "item": "Google Analytics GA4",
        "provider": "Google",
        "cost": 0,
        "billing": "monthly",
        "features": "Unlimited events, real-time reports",
        "status": "active",
    })
    
    # ─── 6. CDN + DDoS Protection ──────────────────────────
    cdn = PROVISIONS["cdn"]
    cdn_plan = cdn["options"][0]  # Free tier
    resources.append({
        "type": "cdn",
        "icon": "⚡",
        "action": "ACTIVE",
        "item": "Cloudflare Free",
        "provider": "Cloudflare",
        "cost": cdn_plan["cost"],
        "billing": "monthly",
        "features": cdn_plan["features"],
        "status": "active",
    })
    
    # ─── 7. Stripe Processing Fees ─────────────────────────
    stripe_pct = PROVISIONS["stripe_fees"]["percentage"]
    stripe_fixed = PROVISIONS["stripe_fees"]["fixed"]
    stripe_fee = round((revenue * stripe_pct / 100) + stripe_fixed, 2)
    resources.append({
        "type": "stripe_fees",
        "icon": "💳",
        "action": "DEDUCTED",
        "item": f"Stripe processing ({stripe_pct}% + ${stripe_fixed})",
        "provider": "Stripe",
        "cost": stripe_fee,
        "billing": "per_transaction",
        "status": "recorded",
    })
    total_upfront += stripe_fee
    
    # ─── Calculate Totals ──────────────────────────────────
    total_cost = round(total_upfront + total_monthly, 2)
    profit = round(revenue - total_cost, 2)
    margin = round((profit / revenue) * 100, 2) if revenue > 0 else 0
    
    # ─── Decision ──────────────────────────────────────────
    decision = "proceed" if margin >= 70 else "review"
    decision_reason = (
        f"All provisions purchased automatically. "
        f"Monthly operating cost: ${total_monthly}/mo. "
        f"First-year total: ${total_cost} → Profit: ${profit} ({margin}% margin)."
    )
    
    return {
        "procurement_decision": decision,
        "decision_reason": decision_reason,
        "client_revenue": revenue,
        "resources": resources,
        "total_upfront_cost": round(total_upfront, 2),
        "total_monthly_cost": round(total_monthly, 2),
        "total_first_year_cost": total_cost,
        "projected_profit": profit,
        "projected_margin_percent": margin,
        "domain_name": f"{domain_name}{tld}",
        "summary": {
            "items_purchased": len(resources),
            "providers_used": list(set(r["provider"] for r in resources)),
            "domain": f"{domain_name}{tld}",
            "hosting": "Vercel Pro",
            "ssl": "Let's Encrypt (Free)",
            "email": f"{domain_name}{tld}",
            "analytics": "Google Analytics",
            "cdn": "Cloudflare",
        }
    }


# ─── Helpers ──────────────────────────────────────────────

def _generate_domain_name(client_name: str, business_type: str) -> str:
    """Generate a clean domain name from client name."""
    # Remove accents, special chars, spaces
    domain = client_name.lower()
    for char in ["'", "é", "è", "ê", "à", "â", "ô", "î", "ï", "ù", "û", "ç", " ", ".", "-", "&"]:
        domain = domain.replace(char, "")
    return domain[:30]  # Max length


def _select_tld(business_type: str) -> str:
    """Select appropriate TLD based on business type."""
    bt = business_type.lower()
    if any(w in bt for w in ["france", "français", "paris", "lyon", "marseille"]):
        return ".fr"
    if any(w in bt for w in ["restaurant", "boulangerie", "café", "cuisine"]):
        return ".restaurant"
    if any(w in bt for w in ["shop", "boutique", "store", "commerce"]):
        return ".shop"
    return ".com"


def _get_option_cost(provision_type: str, option_key: str) -> float:
    """Get cost for a specific option."""
    provision = PROVISIONS[provision_type]
    for opt in provision["options"]:
        if opt.get("tld") == option_key or opt.get("plan") == option_key:
            return opt["cost"]
    return provision["options"][0]["cost"]


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    result = calculate_procurement(514, "Boulangerie artisanale", "Boulangerie Martin")
    print("=== Procurement Summary ===")
    print(f"Decision: {result['procurement_decision']}")
    print(f"Revenue: ${result['client_revenue']}")
    print(f"Upfront: ${result['total_upfront_cost']}")
    print(f"Monthly: ${result['total_monthly_cost']}/mo")
    print(f"First Year: ${result['total_first_year_cost']}")
    print(f"Profit: ${result['projected_profit']} ({result['projected_margin_percent']}%)")
    print()
    print("Resources purchased:")
    for r in result["resources"]:
        print(f"  {r['icon']} [{r['action']}] {r['item']}: ${r['cost']} ({r['billing']})")
