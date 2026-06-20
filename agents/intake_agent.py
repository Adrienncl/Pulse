"""
Client Intake Agent
===================

Analyzes client briefs and extracts structured business requirements.

In production, this would use Nemotron 3 Ultra via OpenRouter.
For MVP, we use an enhanced rule-based approach with quality scoring.
"""

from typing import Dict, Any, List
import json
import re

# ─── Business Type Detection ─────────────────────────────

BUSINESS_TYPES = {
    "bakery": {
        "keywords": ["boulangerie", "bakery", "boulanger", "pain", "viennoiserie", "pâtisserie", "bread", "pastry", "croissant", "baguette"],
        "industry": "Food & Beverage — Bakery",
        "typical_needs": ["website", "visual_identity", "social_media", "menu_design"],
        "avg_budget": "400-1500",
    },
    "restaurant": {
        "keywords": ["restaurant", "cafe", "food", "eat", "dining", "pizzeria", "brasserie", "bar", "brunch", "cuisine", "chef", "catering"],
        "industry": "Food & Beverage — Restaurant",
        "typical_needs": ["website", "visual_identity", "social_media", "marketing"],
        "avg_budget": "500-2000",
    },
    "retail": {
        "keywords": ["shop", "store", "retail", "sell", "boutique", "e-commerce", "marketplace", "fashion", "clothing", "accessories", "jewelry", "cosmetics"],
        "industry": "Retail & E-commerce",
        "typical_needs": ["website", "visual_identity", "social_media", "e_commerce"],
        "avg_budget": "800-3000",
    },
    "agency": {
        "keywords": ["agency", "creative", "design", "studio", "marketing", "advertising", "consulting", "freelance"],
        "industry": "Creative Services",
        "typical_needs": ["website", "visual_identity", "portfolio", "social_media"],
        "avg_budget": "600-2500",
    },
    "tech": {
        "keywords": ["tech", "software", "saas", "app", "startup", "digital", "platform", "ai", "data", "cloud"],
        "industry": "Technology",
        "typical_needs": ["website", "visual_identity", "landing_page", "branding"],
        "avg_budget": "1000-5000",
    },
    "healthcare": {
        "keywords": ["health", "medical", "clinic", "doctor", "dental", "pharmacy", "fitness", "gym", "yoga", "wellness", "spa"],
        "industry": "Healthcare & Wellness",
        "typical_needs": ["website", "visual_identity", "social_media", "booking"],
        "avg_budget": "500-2000",
    },
    "real_estate": {
        "keywords": ["real estate", "property", "apartment", "house", "rent", "mortgage", "immobilier"],
        "industry": "Real Estate",
        "typical_needs": ["website", "visual_identity", "listing_platform", "marketing"],
        "avg_budget": "800-3000",
    },
    "education": {
        "keywords": ["school", "education", "course", "training", "tutor", "learn", "university", "academy", "coaching"],
        "industry": "Education",
        "typical_needs": ["website", "visual_identity", "social_media", "lms"],
        "avg_budget": "500-2000",
    },
    "nonprofit": {
        "keywords": ["nonprofit", "charity", "foundation", "association", "donation", "community", "social impact"],
        "industry": "Non-profit",
        "typical_needs": ["website", "visual_identity", "social_media", "donation_page"],
        "avg_budget": "300-1500",
    },
}

# ─── Need Detection ──────────────────────────────────────

NEED_KEYWORDS = {
    "website": ["website", "site", "web", "landing page", "page web", "site web"],
    "visual_identity": ["visual", "identity", "logo", "brand", "branding", "identité visuelle", "logo"],
    "social_media": ["social", "media", "posts", "content", "instagram", "facebook", "tiktok", "réseaux sociaux"],
    "marketing": ["marketing", "ad", "campaign", "ads", "publicité", "campagne"],
    "e_commerce": ["ecommerce", "e-commerce", "shop", "online store", "boutique en ligne"],
    "email_marketing": ["email", "newsletter", "mailing", "emailing"],
    "seo": ["seo", "search engine", "référencement", "google"],
    "branding": ["brand guidelines", "charte graphique", "guidelines", "brand book"],
    "copywriting": ["copy", "text", "writing", "content writing", "rédaction", "textes"],
    "photography": ["photo", "photography", "shooting", "photoshoot"],
}

# ─── Tone Detection ──────────────────────────────────────

TONE_KEYWORDS = {
    "warm": ["warm", "cozy", "friendly", "chaleureux", "convivial", "accueillant", "amical"],
    "premium": ["premium", "luxury", "elegant", "luxe", "élégant", "haut de gamme", "raffiné"],
    "playful": ["fun", "playful", "casual", "décontracté", "ludique", "coloré", "amusant"],
    "modern": ["modern", "moderne", "contemporary", "minimalist", "minimaliste", "clean"],
    "professional": ["professional", "professionnel", "corporate", "business", "sérieux", "crédible"],
    "creative": ["creative", "créatif", "artistic", "artistique", "original", "unique"],
}

# ─── Quality Scoring ─────────────────────────────────────

def calculate_quality_score(brief: str, needs: List[str], business_type: str) -> Dict[str, Any]:
    """Calculate a quality score for the brief (0-100)."""
    score = 0
    notes = []

    # Length score (0-25)
    word_count = len(brief.split())
    if word_count >= 30:
        score += 25
    elif word_count >= 15:
        score += 15
        notes.append("Brief could be more detailed")
    else:
        score += 5
        notes.append("Brief is very short — consider adding more details")

    # Specificity score (0-25)
    if business_type != "unknown":
        score += 15
    if len(needs) >= 3:
        score += 10
    elif len(needs) >= 1:
        score += 5
        notes.append("More specific needs would improve the proposal")

    # Completeness score (0-25)
    has_budget = any(w in brief.lower() for w in ["budget", "prix", "price", "€", "$", "euro", "usd"])
    has_timeline = any(w in brief.lower() for w in ["deadline", "timeline", "délai", "semaine", "week", "month", "mois", "urgent"])
    has_style = any(w in brief.lower() for w in ["style", "design", "look", "feel", "modern", "classic", "moderne", "classique"])

    if has_budget: score += 10
    if has_timeline: score += 8
    if has_style: score += 7
    if not has_budget: notes.append("No budget mentioned — using default pricing")
    if not has_timeline: notes.append("No timeline specified")
    if not has_style: notes.append("No style preferences — using defaults")

    # Professionalism score (0-25)
    has_contact = "@" in brief or "email" in brief.lower() or "contact" in brief.lower()
    has_name = len(brief.split()) > 5  # Has some context beyond basics
    if has_contact: score += 10
    if has_name: score += 15
    elif word_count > 0: score += 8

    return {
        "score": min(100, score),
        "rating": "excellent" if score >= 80 else "good" if score >= 60 else "needs_improvement" if score >= 40 else "poor",
        "notes": notes,
        "word_count": word_count,
    }


def analyze_brief(client_brief: str) -> Dict[str, Any]:
    """
    Analyze a client brief and extract structured requirements.

    In production, this would use Nemotron 3 Ultra via OpenRouter.
    For MVP, we use an enhanced rule-based approach with quality scoring.

    Args:
        client_brief: The raw text brief from the client

    Returns:
        Dict with business_type, needs, tone, recommended_package, etc.
    """
    brief_lower = client_brief.lower()

    # Detect business type (best match)
    business_type = "unknown"
    best_match_count = 0
    for btype, config in BUSINESS_TYPES.items():
        matches = sum(1 for kw in config["keywords"] if kw in brief_lower)
        if matches > best_match_count:
            best_match_count = matches
            business_type = btype

    industry = BUSINESS_TYPES.get(btype, {}).get("industry", "General") if business_type != "unknown" else "General"

    # Detect needs
    needs = []
    for need, keywords in NEED_KEYWORDS.items():
        if any(kw in brief_lower for kw in keywords):
            needs.append(need)

    # Default needs if none detected
    if not needs:
        needs = ["website", "visual_identity"]

    # Detect tone
    tone = "professional"
    best_tone_score = 0
    for t, keywords in TONE_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in brief_lower)
        if matches > best_tone_score:
            best_tone_score = matches
            tone = t

    # Detect style preferences
    style_preferences = []
    if any(w in brief_lower for w in ["modern", "moderne", "minimalist", "minimaliste"]):
        style_preferences.append("modern")
    if any(w in brief_lower for w in ["classic", "classique", "traditional", "traditionnel"]):
        style_preferences.append("classic")
    if any(w in brief_lower for w in ["bold", "audacieux", "colorful", "coloré"]):
        style_preferences.append("bold")
    if any(w in brief_lower for w in ["elegant", "élégant", "refined", "raffiné"]):
        style_preferences.append("elegant")
    if not style_preferences:
        style_preferences = ["modern"]

    # Recommend package
    if len(needs) >= 4 or any(n in needs for n in ["e_commerce", "branding", "seo"]):
        package = "Full Brand Package"
    elif len(needs) >= 2:
        package = "Local Business Launch Kit"
    else:
        package = "Starter Package"

    # Detect target audience
    audience = "General consumers"
    if any(w in brief_lower for w in ["young", "jeune", "student", "étudiant"]):
        audience = "Young adults (18-30)"
    elif any(w in brief_lower for w in ["professional", "professionnel", "business", "b2b", "enterprise"]):
        audience = "Business professionals"
    elif any(w in brief_lower for w in ["family", "famille", "parent", "enfant"]):
        audience = "Families"
    elif any(w in brief_lower for w in ["luxury", "luxe", "premium", "high-end"]):
        audience = "Affluent consumers"

    # Calculate quality score
    quality = calculate_quality_score(client_brief, needs, business_type)

    return {
        "business_type": business_type,
        "industry": industry,
        "target_customers": audience,
        "needs": needs,
        "tone": tone,
        "style_preferences": ", ".join(style_preferences),
        "required_deliverables": needs[:5],  # Top 5 needs
        "recommended_package": package,
        "risk_notes": quality["notes"],
        "quality_score": quality["score"],
        "quality_rating": quality["rating"],
        "brief_word_count": quality["word_count"],
    }


# Example usage
if __name__ == "__main__":
    brief = "I'm opening an Italian restaurant and need a website, visuals, and social media content. Budget around $1000. Modern and warm style."
    result = analyze_brief(brief)
    print(json.dumps(result, indent=2))
