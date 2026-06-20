"""
Template Selection Agent
========================

Selects the best production-ready website template based on client brief.

Available templates:
- restaurant_premium: restaurants, cafés, bars, food businesses
- beauty_wellness: salons, spas, wellness businesses
- coach_consultant: coaches, consultants, freelances
"""

from typing import Dict, Any
import re

# ─── Template Definitions ──────────────────────────────────
TEMPLATES = {
    "restaurant_premium": {
        "name": "Restaurant Premium",
        "keywords": [
            "restaurant", "café", "cafe", "bar", "bistro", "pizzeria",
            "trattoria", "dining", "food", "cuisine", "kitchen", "eatery",
            "brasserie", "tavern", "grill", "steakhouse", "sushi",
            "italian", "french", "mexican", "chinese", "japanese",
            "thai", "indian", "mediterranean", "bakery", "boulangerie",
            "pizza", "pasta", "seafood", "steak", "wine", "cocktail",
            "coffee", "tea", "brunch", "lunch", "dinner", "breakfast",
            "pain", "croissant", "baguette", "viennoiserie", "pâtisserie",
            "boulanger", "boulangerie artisanale", "artisanal_bakery"
        ],
        "description": "Premium restaurant website with hero, menu, gallery, reservations, and contact.",
        "sections": ["hero", "about", "menu", "gallery", "reservations", "testimonials", "contact"],
    },
    "beauty_wellness": {
        "name": "Beauty & Wellness",
        "keywords": [
            "salon", "spa", "beauty", "wellness", "coiffeur", "barber",
            "skincare", "nail", "makeup", "hair", "massage", "facial",
            "cosmetic", "aesthetic", "laser", "tattoo", "piercing",
            "yoga", "fitness", "gym", "studio", "wellness center"
        ],
        "description": "Elegant beauty and wellness website with services, booking, and gallery.",
        "sections": ["hero", "about", "services", "gallery", "booking", "testimonials", "contact"],
    },
    "coach_consultant": {
        "name": "Coach & Consultant",
        "keywords": [
            "coach", "consultant", "freelance", "consulting", "advisor",
            "mentor", "trainer", "speaker", "author", "expert",
            "business coach", "life coach", "executive coach",
            "marketing", "strategy", "digital", "agency", "studio"
        ],
        "description": "Professional coaching and consulting website with services, about, and contact.",
        "sections": ["hero", "about", "services", "testimonials", "contact"],
    }
}

# ─── Main Function ─────────────────────────────────────────

def select_template(intake_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Select the best template based on client intake data.
    
    Args:
        intake_data: Output from the intake agent (business_type, needs, etc.)
    
    Returns:
        Dict with selected_template_id, template_name, confidence, reason
    """
    business_type = intake_data.get("business_type", "").lower()
    needs = intake_data.get("needs", [])
    tone = intake_data.get("tone", "").lower()
    
    # Combine all text for keyword matching
    search_text = f"{business_type} {' '.join(needs)} {tone}".lower()
    
    scores = {}
    for template_id, template in TEMPLATES.items():
        score = 0
        matched_keywords = []
        
        for keyword in template["keywords"]:
            if keyword in search_text:
                score += 1
                matched_keywords.append(keyword)
        
        # Bonus for exact business type match
        if business_type in template["keywords"]:
            score += 5
        
        # Bonus for partial match (e.g., "artisanal_bakery" contains "bakery")
        for keyword in template["keywords"]:
            if keyword in business_type or business_type in keyword:
                score += 3
                if keyword not in matched_keywords:
                    matched_keywords.append(keyword)
        
        # Bonus for multiple keyword matches
        if len(matched_keywords) > 1:
            score += len(matched_keywords)
        
        scores[template_id] = {
            "score": score,
            "matched_keywords": matched_keywords
        }
    
    # Find best match
    if not scores or all(s["score"] == 0 for s in scores.values()):
        # Default to restaurant if no match
        best_id = "restaurant_premium"
        confidence = 0.5
        reason = "No strong match found. Defaulting to Restaurant Premium template."
    else:
        best_id = max(scores, key=lambda x: scores[x]["score"])
        best_score = scores[best_id]["score"]
        matched = scores[best_id]["matched_keywords"]
        
        # Calculate confidence (0.0 - 1.0)
        confidence = min(0.95, 0.6 + (best_score * 0.05))
        
        reason = f"Best match for '{business_type}' business. "
        if matched:
            reason += f"Matched keywords: {', '.join(matched[:5])}. "
        reason += f"Template provides {len(TEMPLATES[best_id]['sections'])} sections suitable for this business type."
    
    return {
        "selected_template_id": best_id,
        "template_name": TEMPLATES[best_id]["name"],
        "confidence": round(confidence, 2),
        "reason": reason,
        "available_templates": list(TEMPLATES.keys())
    }


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    # Test with restaurant
    test_intake = {
        "business_type": "Italian restaurant",
        "needs": ["website", "menu", "reservations"],
        "tone": "warm, premium"
    }
    result = select_template(test_intake)
    print("Restaurant test:", result)
    
    # Test with salon
    test_intake2 = {
        "business_type": "hair salon",
        "needs": ["website", "booking", "gallery"],
        "tone": "elegant, modern"
    }
    result2 = select_template(test_intake2)
    print("Salon test:", result2)
    
    # Test with coach
    test_intake3 = {
        "business_type": "business coach",
        "needs": ["website", "services", "testimonials"],
        "tone": "professional, authoritative"
    }
    result3 = select_template(test_intake3)
    print("Coach test:", result3)
