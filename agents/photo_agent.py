"""
Photo Agent — Analyzes photos using Nemotron 3 Ultra for intelligent placement
=============================================================================
Uses the LLM to understand photo context, suggest placement, and generate
accessible alt text. Falls back to rule-based system when Nemotron is down.
"""
from typing import Dict, Any, List
import json
import logging
import sys
import os

logger = logging.getLogger("zes.photo_agent")

# ─── Nemotron Integration ─────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
try:
    from zes_connector import call_llm
    NEMOTRON_AVAILABLE = True
except ImportError:
    NEMOTRON_AVAILABLE = False
    logger.warning("Nemotron connector not available — using rule-based fallback")

# ─── Placement Rules (fallback) ────────────────────────────────
PLACEMENT_RULES = {
    "hero": {
        "keywords": ["storefront", "shop", "exterior", "building", "facade", "outside", "entrance", "devanture", "magasin", "front"],
        "description": "Main banner image"
    },
    "menu": {
        "keywords": ["product", "food", "dish", "menu", "baguette", "croissant", "bread", "cake", "pastry", "plat", "produit", "pain", "viennoiserie", "drink", "coffee"],
        "description": "Product showcase"
    },
    "about": {
        "keywords": ["team", "chef", "staff", "people", "person", "founder", "owner", "boulanger", "patron", "equipe", "personnel", "portrait"],
        "description": "About us / Team"
    },
    "gallery": {
        "keywords": ["interior", "inside", "decor", "ambiance", "atmosphere", "setting", "decoration", "dining", "room", "space"],
        "description": "Gallery / Ambiance"
    },
    "testimonials": {
        "keywords": ["customer", "client", "review", "testimonial", "satisfied", "avis", "happy", "feedback"],
        "description": "Customer testimonials"
    },
}

PLACEMENT_ORDER = ["hero", "about", "menu", "gallery", "testimonials"]


def analyze_with_nemotron(description: str, all_photos: List[str] = None) -> Dict[str, Any]:
    """
    Use Nemotron 3 Ultra to analyze photo description intelligently.
    """
    if not NEMOTRON_AVAILABLE:
        return None
    
    prompt = f"""Analyze this photo description for a business website and determine the BEST placement.

Photo description: "{description}"

Available sections:
- hero: Main banner / welcome image (storefront, exterior, wide shot)
- about: Team / founder portraits (people, staff, chef)
- menu: Product / food shots (dishes, items, close-ups)
- gallery: Interior / ambiance (dining room, decor)
- testimonials: Customer moments (happy customers, reviews)

Return JSON ONLY with no other text:
{{
    "placement": "hero|about|menu|gallery|testimonials",
    "confidence": 0.0-1.0,
    "section_name": "Human readable section name",
    "suggested_alt": "SEO-friendly alt text (max 120 chars)",
    "reasoning": "Why this placement fits"
}}"""
    
    try:
        result = call_llm(prompt, temperature=0.1, max_tokens=300)
        if result and "placement" in result:
            result["_model"] = "nemotron-3-ultra-free"
            return result
    except Exception as e:
        logger.warning(f"Nemotron analysis failed: {e}")
    
    return None


def analyze_rule_based(description: str) -> Dict[str, Any]:
    """Rule-based photo analysis (fallback)."""
    desc_lower = description.lower().strip()
    
    best_match = None
    best_score = 0
    
    for placement, rule in PLACEMENT_RULES.items():
        score = 0
        for keyword in rule["keywords"]:
            if keyword in desc_lower:
                score += len(keyword) * 2
        if score > best_score:
            best_score = score
            best_match = placement
    
    if not best_match:
        best_match = "gallery"
    
    confidence = min(0.95, 0.6 + (best_score * 0.03))
    
    return {
        "description": description,
        "placement": best_match,
        "section_name": PLACEMENT_RULES[best_match]["description"],
        "confidence": round(confidence, 2),
        "suggested_alt": description.capitalize()[:80],
        "reasoning": "Keyword-based rule matching",
        "_model": "rule-based (fallback)"
    }


def analyze_photo(description: str, all_photos: List[str] = None) -> Dict[str, Any]:
    """
    Analyze a photo description and determine best placement.
    
    Priority:
    1. Try Nemotron 3 Ultra (if available)
    2. Fallback to rule-based matching
    
    Args:
        description: User's description of the photo
        all_photos: Optional list of all photo descriptions for context
    
    Returns:
        Dict with placement, confidence, suggested_alt
    """
    # Try Nemotron first
    nemotron_result = analyze_with_nemotron(description, all_photos)
    if nemotron_result:
        logger.info(f"📸 Nemotron placed '{description[:30]}' → {nemotron_result['placement']}")
        return {
            "description": description,
            "placement": nemotron_result["placement"],
            "section_name": nemotron_result.get("section_name", PLACEMENT_RULES.get(nemotron_result["placement"], {}).get("description", "Gallery")),
            "confidence": min(1.0, nemotron_result.get("confidence", 0.7) + 0.1),
            "suggested_alt": nemotron_result.get("suggested_alt", description.capitalize()),
            "reasoning": nemotron_result.get("reasoning", ""),
            "_model": "nemotron-3-ultra-free"
        }
    
    # Fallback to rule-based
    return analyze_rule_based(description)


def analyze_photos(photos: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """
    Analyze multiple photos and assign placements.
    
    Args:
        photos: List of {"url": "...", "description": "..."}
    
    Returns:
        List of analysis results with placement per photo
    """
    descriptions = [p.get("description", "") for p in photos]
    results = []
    
    for i, photo in enumerate(photos):
        result = analyze_photo(
            description=photo.get("description", ""),
            all_photos=descriptions
        )
        result["url"] = photo.get("url", "")
        result["photo_index"] = i
        results.append(result)
    
    # Ensure variety: avoid all photos in the same section
    placement_counts = {}
    for r in results:
        p = r["placement"]
        placement_counts[p] = placement_counts.get(p, 0) + 1
    
    # If too many in one section, redistribute
    if placement_counts.get(max(placement_counts, key=placement_counts.get), 0) > len(results) * 0.6:
        used = set()
        for r in results:
            if r["_model"] == "rule-based (fallback)" and r["placement"] in used:
                # Move to next available placement
                for alt in PLACEMENT_ORDER:
                    if alt not in used or alt == r["placement"]:
                        r["placement"] = alt
                        r["section_name"] = PLACEMENT_RULES[alt]["description"]
                        r["reasoning"] += " | Auto-balanced for variety"
                        break
            used.add(r["placement"])
    
    return results
