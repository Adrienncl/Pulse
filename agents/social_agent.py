"""
Social Media Agent
==================

Generates social media posts with captions, image prompts, and hashtags.
Uses brand data and content to create platform-specific posts.
"""

from typing import Dict, Any, List


def generate_social_posts(
    brand_data: Dict[str, Any],
    content_data: Dict[str, Any],
    template_id: str = "restaurant_premium"
) -> Dict[str, Any]:
    """
    Generate social media posts for the client.
    
    Args:
        brand_data: Output from brand agent
        content_data: Output from content agent
        template_id: Selected template ID
    
    Returns:
        Dict with posts array and metadata
    """
    brand_name = brand_data.get("brand_name", "Brand")
    category = brand_data.get("category", "restaurant")
    visual_style = brand_data.get("visual_style", "")
    
    # Use pre-generated posts from content agent
    posts = content_data.get("social_posts", [])
    
    # Enhance posts with additional metadata
    enhanced_posts = []
    for post in posts:
        enhanced = {
            **post,
            "brand_name": brand_name,
            "optimal_posting_time": _get_optimal_time(post.get("platform", "")),
            "engagement_tip": _get_engagement_tip(post.get("platform", "")),
        }
        enhanced_posts.append(enhanced)
    
    # Generate additional platform-specific posts
    additional_posts = _generate_additional_posts(brand_name, category, visual_style)
    enhanced_posts.extend(additional_posts)
    
    return {
        "posts": enhanced_posts,
        "total_posts": len(enhanced_posts),
        "platforms": list(set(p.get("platform", "") for p in enhanced_posts)),
        "brand_name": brand_name,
        "strategy": {
            "content_pillars": _get_content_pillars(category),
            "posting_frequency": _get_posting_frequency(category),
            "hashtag_strategy": _get_hashtag_strategy(category),
        }
    }


def _get_optimal_time(platform: str) -> str:
    """Get optimal posting time for platform."""
    times = {
        "Instagram": "11:00 AM - 1:00 PM or 7:00 PM - 9:00 PM",
        "Facebook": "1:00 PM - 4:00 PM",
        "Twitter": "8:00 AM - 10:00 AM or 12:00 PM - 1:00 PM",
        "LinkedIn": "7:30 AM - 8:30 AM or 12:00 PM",
        "TikTok": "7:00 PM - 9:00 PM",
    }
    return times.get(platform, "Varies by audience")


def _get_engagement_tip(platform: str) -> str:
    """Get engagement tip for platform."""
    tips = {
        "Instagram": "Use 5-10 relevant hashtags. Engage with comments within 1 hour.",
        "Facebook": "Ask questions to encourage comments. Share during peak hours.",
        "Twitter": "Use threads for longer content. Engage with trending topics.",
        "LinkedIn": "Share insights and data. Tag relevant people and companies.",
        "TikTok": "Hook viewers in first 3 seconds. Use trending sounds.",
    }
    return tips.get(platform, "Post consistently and engage with your audience.")


def _get_content_pillars(category: str) -> List[str]:
    """Get content pillars for category."""
    pillars = {
        "restaurant": ["Food photography", "Behind-the-scenes", "Customer stories", "Promotions", "Chef's specials"],
        "beauty": ["Before/after transformations", "Tutorial tips", "Product highlights", "Client testimonials", "Behind the chair"],
        "coach": ["Thought leadership", "Client success stories", "Industry insights", "Tips & advice", "Personal stories"],
    }
    return pillars.get(category, pillars["restaurant"])


def _get_posting_frequency(category: str) -> str:
    """Get recommended posting frequency."""
    frequencies = {
        "bakery": "4-6 posts per week, daily Stories for fresh products",
        "restaurant": "3-5 posts per week across platforms",
        "beauty": "4-6 posts per week, daily Stories",
        "coach": "3-4 posts per week, daily LinkedIn activity",
    }
    return frequencies.get(category, "3-5 posts per week")


def _get_hashtag_strategy(category: str) -> Dict[str, Any]:
    """Get hashtag strategy."""
    strategies = {
        "bakery": {
            "branded": ["#BoulangerieMartin", "#LeGoûtDuVrai"],
            "industry": ["#PainArtisanal", "#Boulangerie", "#Viennoiseries", "#PainAuLevain"],
            "local": ["#ParisBoulangerie", "#MeilleurPain"],
            "count": "8-12 per post"
        },
        "restaurant": {
            "branded": ["#CasaVeronaDining", "#TasteOfItaly"],
            "industry": ["#ItalianFood", "#FoodLovers", "#RestaurantLife"],
            "local": ["#NYCEats", "#DowntownDining"],
            "count": "8-12 per post"
        },
        "beauty": {
            "branded": ["#LumièreBeauty", "#GlowUp"],
            "industry": ["#HairTransformation", "#BeautySalon", "#NailArt"],
            "local": ["#NYCBeauty", "#DowntownSalon"],
            "count": "10-15 per post"
        },
        "coach": {
            "branded": ["#ApexConsulting", "#StrategicGrowth"],
            "industry": ["#Leadership", "#BusinessStrategy", "#Coaching"],
            "local": [],
            "count": "3-5 per post"
        },
    }
    return strategies.get(category, strategies["restaurant"])


def _generate_additional_posts(brand_name: str, category: str, visual_style: str) -> List[Dict[str, Any]]:
    """Generate additional platform-specific posts."""
    additional = {
        "bakery": [
            {
                "platform": "Instagram",
                "caption": f"Le four tourne à {brand_name}! 🥐✨ Fraîcheur du jour, chaque matin.",
                "image_prompt": f"Fresh pastries coming out of oven, warm golden light, artisan bakery",
                "hashtags": ["#BoulangerieArtisanale", "#Croissants", "#PainFrais"],
                "brand_name": brand_name,
                "optimal_posting_time": "7:00 AM - 9:00 AM",
                "engagement_tip": "Show the baking process. Use warm, inviting visuals.",
            },
            {
                "platform": "TikTok",
                "caption": f"POV: Tu rentres dans {brand_name} et tu sens le pain frais 🍞🔥",
                "image_prompt": f"Quick bakery tour, fresh bread, warm atmosphere",
                "hashtags": ["#BoulangerieTikTok", "#PainAuLevain", "#Artisanat"],
                "brand_name": brand_name,
                "optimal_posting_time": "6:00 AM - 8:00 AM",
                "engagement_tip": "Show the crust cracking. ASMR bread sounds.",
            },
        ],
        "restaurant": [
            {
                "platform": "TikTok",
                "caption": f"POV: You just walked into {brand_name} 🍝✨ The vibes are immaculate.",
                "image_prompt": f"Quick restaurant tour video, {visual_style}",
                "hashtags": ["#RestaurantTikTok", "#Foodie", "#ItalianFood"],
                "brand_name": brand_name,
                "optimal_posting_time": "7:00 PM - 9:00 PM",
                "engagement_tip": "Use trending sounds. Show the food close-up.",
            },
        ],
        "beauty": [
            {
                "platform": "TikTok",
                "caption": f"Watch this transformation! ✨ Hair goals achieved at {brand_name}. Book your glow up!",
                "image_prompt": f"Before/after hair transformation video",
                "hashtags": ["#HairTransformation", "#GlowUp", "#SalonTikTok"],
                "brand_name": brand_name,
                "optimal_posting_time": "7:00 PM - 9:00 PM",
                "engagement_tip": "Show the process. Use satisfying transitions.",
            },
        ],
        "coach": [
            {
                "platform": "YouTube",
                "caption": f"5 signs you need a business coach | {brand_name} | Free consultation link in bio",
                "image_prompt": f"Professional talking head, modern office background",
                "hashtags": ["#BusinessCoach", "#Entrepreneurship", "#GrowthMindset"],
                "brand_name": brand_name,
                "optimal_posting_time": "2:00 PM - 4:00 PM",
                "engagement_tip": "Create series content. End with clear CTA.",
            },
        ],
    }
    
    return additional.get(category, [])


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_brand = {
        "brand_name": "Casa Verona",
        "category": "restaurant",
        "visual_style": "rustic Italian trattoria, cinematic warm light"
    }
    test_content = {
        "social_posts": [
            {
                "platform": "Instagram",
                "caption": "Welcome to Casa Verona!",
                "image_prompt": "Fresh pasta photo",
                "hashtags": ["#ItalianFood"]
            }
        ]
    }
    result = generate_social_posts(test_brand, test_content)
    print(f"Generated {result['total_posts']} posts for {result['platforms']}")
    for post in result['posts']:
        print(f"  [{post['platform']}] {post['caption'][:50]}...")
