"""
Brand Agent
===========

Generates brand identity from client brief and template selection.
Creates brand name, positioning, voice, color palette, typography, and visual style.
"""

from typing import Dict, Any

# ─── Brand Defaults by Business Type ───────────────────────

BRAND_DEFAULTS = {
    "restaurant": {
        "color_palettes": [
            {"primary": "#7B2D26", "secondary": "#F3E6D0", "accent": "#2F5D50"},
            {"primary": "#C45B28", "secondary": "#F5E6D3", "accent": "#1B4332"},
            {"primary": "#8B0000", "secondary": "#FFF8DC", "accent": "#4A4A4A"},
        ],
        "typography_directions": [
            "elegant serif headlines with clean sans-serif body text",
            "rustic hand-drawn headings with modern body text",
            "classic Italian typography with warm, inviting feel",
        ],
        "visual_styles": [
            "rustic Italian trattoria, cinematic warm light",
            "modern fine dining, minimalist elegance",
            "cozy neighborhood bistro, authentic atmosphere",
        ],
        "brand_voices": [
            "warm, elegant, authentic",
            "passionate, inviting, community-focused",
            "sophisticated, approachable, memorable",
        ],
    },
    "bakery": {
        "color_palettes": [
            {"primary": "#8B4513", "secondary": "#F5DEB3", "accent": "#D2691E"},
            {"primary": "#A0522D", "secondary": "#FAEBD7", "accent": "#CD853F"},
            {"primary": "#6B4423", "secondary": "#FDF5E6", "accent": "#B8860B"},
        ],
        "typography_directions": [
            "rustic serif with handcrafted feel",
            "warm script headings with clean body text",
            "artisanal typography with vintage charm",
        ],
        "visual_styles": [
            "rustic artisan bakery, warm golden light",
            "modern boulangerie, clean and inviting",
            "traditional French bakery, authentic atmosphere",
        ],
        "brand_voices": [
            "warm, authentic, artisanal",
            "passionate, traditional, community-focused",
            "inviting, genuine, craftsmanship-focused",
        ],
    },
    "beauty": {
        "color_palettes": [
            {"primary": "#D4A574", "secondary": "#FFF8F0", "accent": "#2D6A4F"},
            {"primary": "#E8B4B8", "secondary": "#FAF0F2", "accent": "#5C4033"},
            {"primary": "#B8860B", "secondary": "#FFFEF7", "accent": "#2C2C2C"},
        ],
        "typography_directions": [
            "refined serif with elegant spacing",
            "modern sans-serif with luxury feel",
            "delicate script headings with clean body",
        ],
        "visual_styles": [
            "soft, luminous, premium spa aesthetic",
            "modern beauty studio, clean lines",
            "natural wellness, organic textures",
        ],
        "brand_voices": [
            "elegant, caring, transformative",
            "confident, beauty-focused, aspirational",
            "natural, holistic, rejuvenating",
        ],
    },
    "coach": {
        "color_palettes": [
            {"primary": "#1E3A5F", "secondary": "#F0F4F8", "accent": "#E8B931"},
            {"primary": "#2C3E50", "secondary": "#ECF0F1", "accent": "#E74C3C"},
            {"primary": "#34495E", "secondary": "#F5F6FA", "accent": "#3498DB"},
        ],
        "typography_directions": [
            "authoritative sans-serif with clean hierarchy",
            "modern geometric headings with readable body",
            "professional, trust-building typography",
        ],
        "visual_styles": [
            "professional, clean, trust-building",
            "modern executive, confident presence",
            "approachable expertise, warm professionalism",
        ],
        "brand_voices": [
            "authoritative, insightful, empowering",
            "professional, trustworthy, results-driven",
            "inspiring, strategic, transformative",
        ],
    },
}

# ─── Main Function ─────────────────────────────────────────

def generate_brand(
    intake_data: Dict[str, Any],
    template_id: str = "restaurant_premium",
    custom_brand_name: str = None
) -> Dict[str, Any]:
    """
    Generate brand identity from client brief.
    
    Args:
        intake_data: Output from intake agent
        template_id: Selected template ID
        custom_brand_name: Optional custom brand name override
    
    Returns:
        Dict with brand_name, positioning, voice, colors, typography, visual_style, image_prompts
    """
    business_type = intake_data.get("business_type", "restaurant").lower()
    tone = intake_data.get("tone", "professional").lower()
    client_name = intake_data.get("client_name", "")
    
    # Determine brand category
    category = _get_category(business_type)
    defaults = BRAND_DEFAULTS.get(category, BRAND_DEFAULTS["restaurant"])
    
    # Generate brand name
    brand_name = custom_brand_name or _generate_brand_name(client_name, business_type)
    
    # Select color palette (cycle through options based on brand name hash)
    palette_idx = hash(brand_name) % len(defaults["color_palettes"])
    colors = defaults["color_palettes"][palette_idx]
    
    # Select typography
    typo_idx = hash(brand_name + "typo") % len(defaults["typography_directions"])
    typography = defaults["typography_directions"][typo_idx]
    
    # Select visual style
    style_idx = hash(brand_name + "style") % len(defaults["visual_styles"])
    visual_style = defaults["visual_styles"][style_idx]
    
    # Select brand voice
    voice_idx = hash(brand_name + "voice") % len(defaults["brand_voices"])
    voice = defaults["brand_voices"][voice_idx]
    
    # Generate positioning
    positioning = _generate_positioning(brand_name, business_type, tone)
    
    # Generate image prompts
    image_prompts = _generate_image_prompts(business_type, visual_style, brand_name)
    
    return {
        "brand_name": brand_name,
        "positioning": positioning,
        "brand_voice": voice,
        "color_palette": colors,
        "typography_direction": typography,
        "visual_style": visual_style,
        "image_prompts": image_prompts,
        "category": category
    }


def _get_category(business_type: str) -> str:
    """Map business type to brand category."""
    business_lower = business_type.lower()
    bakery_keywords = ["boulangerie", "bakery", "boulanger", "pâtisserie", "pain", "viennoiserie"]
    restaurant_keywords = ["restaurant", "café", "cafe", "bar", "bistro", "food", "dining", "pizza", "pasta"]
    beauty_keywords = ["salon", "spa", "beauty", "wellness", "hair", "nail", "skincare", "makeup"]
    coach_keywords = ["coach", "consultant", "freelance", "advisor", "mentor", "speaker"]
    
    for kw in bakery_keywords:
        if kw in business_lower:
            return "bakery"
    for kw in restaurant_keywords:
        if kw in business_lower:
            return "restaurant"
    for kw in beauty_keywords:
        if kw in business_lower:
            return "beauty"
    for kw in coach_keywords:
        if kw in business_lower:
            return "coach"
    
    return "restaurant"  # default


def _generate_brand_name(client_name: str, business_type: str) -> str:
    """Generate a brand name from client info."""
    if client_name and len(client_name) > 2:
        # Clean up client name
        name = client_name.strip()
        if name.lower().startswith("the "):
            name = name[4:]
        return name
    
    # Generate from business type
    brand_names = {
        "restaurant": ["La Tavola", "Osteria Bella", "Cucina Moderna", "The Golden Fork", "Harvest Kitchen"],
        "beauty": ["Lumière Beauty", "The Studio", "Glow & Grace", "Radiance Spa", "Velvet Beauty"],
        "coach": ["Apex Consulting", "Strategic Minds", "Elevate Partners", "The Coaching Lab", "Peak Performance"],
    }
    
    category = _get_category(business_type)
    names = brand_names.get(category, brand_names["restaurant"])
    idx = hash(business_type) % len(names)
    return names[idx]


def _generate_positioning(brand_name: str, business_type: str, tone: str) -> str:
    """Generate brand positioning statement."""
    category = _get_category(business_type)
    
    positionings = {
        "restaurant": f"{brand_name} delivers an authentic dining experience with locally sourced ingredients and time-honored recipes.",
        "beauty": f"{brand_name} transforms your look with expert care and premium products in a relaxing environment.",
        "coach": f"{brand_name} empowers professionals to achieve breakthrough results through strategic guidance.",
    }
    
    return positionings.get(category, f"{brand_name} is dedicated to delivering exceptional experiences.")


def _generate_image_prompts(business_type: str, visual_style: str, brand_name: str) -> list:
    """Generate image prompts for AI image generation."""
    category = _get_category(business_type)
    
    prompts = {
        "restaurant": [
            f"A warm cinematic photo of a {visual_style} restaurant interior with natural light and rustic wood tables",
            f"Fresh handmade pasta on a ceramic plate, warm lighting, authentic {brand_name} style",
            f"A cozy restaurant exterior at golden hour, elegant signage, inviting neighborhood feeling",
        ],
        "beauty": [
            f"A luxurious {visual_style} salon interior with soft lighting and premium furnishings",
            f"Professional beauty treatment in progress, relaxing atmosphere, expert care",
            f"Elegant product display with premium skincare items, clean minimalist aesthetic",
        ],
        "coach": [
            f"A professional {visual_style} office setting with modern furnishings",
            f"Confident professional speaking at a podium, engaging audience, thought leadership",
            f"Collaborative meeting in a modern workspace, strategic planning, teamwork",
        ],
    }
    
    return prompts.get(category, prompts["restaurant"])


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_intake = {
        "business_type": "Italian restaurant",
        "tone": "warm, premium",
        "client_name": "Casa Verona"
    }
    result = generate_brand(test_intake)
    print("Brand result:")
    for key, value in result.items():
        print(f"  {key}: {value}")
