"""
Content Agent
=============

Generates website content: hero text, sections, menu items, social posts.
Uses template-specific content generation based on brand data.
"""

from typing import Dict, Any, List

# ─── Content Templates by Category ────────────────────────

CONTENT_TEMPLATES = {
    "restaurant": {
        "hero_titles": [
            "Authentic Italian Dining in the Heart of the City",
            "Where Every Meal Tells a Story",
            "A Taste of Italy, Made Fresh Daily",
            "Experience the Art of Fine Dining",
        ],
        "hero_subtitles": [
            "Handmade pasta, warm hospitality, and timeless Italian flavors.",
            "Fresh ingredients, traditional recipes, unforgettable experiences.",
            "From our kitchen to your table — taste the difference.",
            "Where culinary tradition meets modern elegance.",
        ],
        "about_titles": [
            "Our Story",
            "A Tradition of Excellence",
            "Crafted with Passion",
            "From Our Family to Yours",
        ],
        "about_texts": [
            "Founded with a passion for authentic cuisine, we bring the warmth of Italy to your neighborhood. Every dish is crafted with locally sourced ingredients and time-honored recipes passed down through generations.",
            "Our journey began with a simple dream: to share the flavors of Italy with our community. Today, we continue that tradition with every plate we serve, every guest we welcome.",
        ],
        "menu_categories": ["Antipasti", "Pasta", "Pizza", "Secondi", "Dolci", "Drinks"],
        "menu_items": [
            {"name": "Burrata e Pomodori", "description": "Creamy burrata with marinated tomatoes, basil oil, and aged balsamic.", "price": "$16", "tags": ["Vegetarian", "Chef's Pick"]},
            {"name": "Tagliatelle al Ragù", "description": "Fresh handmade tagliatelle with slow-cooked beef ragù and Parmigiano.", "price": "$22", "tags": ["Signature"]},
            {"name": "Pizza Margherita DOP", "description": "San Marzano tomatoes, fresh mozzarella di bufala, basil, extra virgin olive oil.", "price": "$18", "tags": ["Classic"]},
            {"name": "Branzino al Forno", "description": "Whole roasted sea bass with lemon, capers, and roasted vegetables.", "price": "$28", "tags": ["Gluten-Free"]},
            {"name": "Osso Buco", "description": "Braised veal shank with saffron risotto and gremolata.", "price": "$32", "tags": ["Signature", "Chef's Pick"]},
            {"name": "Tiramisu Classico", "description": "Classic tiramisu with espresso-soaked ladyfingers and mascarpone cream.", "price": "$12", "tags": ["Dessert"]},
            {"name": "Panna Cotta", "description": "Vanilla bean panna cotta with seasonal berry compote.", "price": "$10", "tags": ["Dessert", "Gluten-Free"]},
            {"name": "Spritz Aperol", "description": "Aperol, prosecco, soda water, fresh orange slice.", "price": "$14", "tags": ["Cocktail"]},
        ],
        "testimonial_title": "What Our Guests Say",
        "testimonials": [
            {"quote": "The best Italian food I've had outside of Italy. The pasta is incredibly fresh and the atmosphere is magical.", "author_name": "Sarah M.", "author_title": "Food Blogger", "stars": 5},
            {"quote": "A hidden gem! The osso buco is to die for. We come here every anniversary now.", "author_name": "Michael & Lisa R.", "author_title": "Regular Guests", "stars": 5},
            {"quote": "Impeccable service and flavors that transport you straight to Tuscany. Highly recommended!", "author_name": "James K.", "author_title": "Google Review", "stars": 5},
        ],
        "reservation_text": "Reserve your table and join us for an unforgettable dining experience. Walk-ins welcome, but reservations recommended for parties of 4+.",
    },
    "bakery": {
        "hero_titles": [
            "Le Goût du Vrai — Pain Artisanal au Levain",
            "Fraîcheur du Jour, Chaque Matin",
            "L'Art du Pain depuis Notre Four",
            "Saveurs Authentiques, Ingredients Naturels",
        ],
        "hero_subtitles": [
            "Pain au levain naturel, viennoiseries bio, et bakery artisanciale.",
            "Nous créons du pain avec passion depuis plus de 20 ans.",
            "Du grain à la table — la fraîcheur garantie.",
            "Votre bakery de quartier, l'authenticité au quotidien.",
        ],
        "about_titles": [
            "Notre Histoire",
            "L'Art du Pain Artisanal",
            "Crafted with Passion",
            "Du Levain à la Table",
        ],
        "about_texts": [
            "Fondée avec la passion du pain authentique, nous créons chaque jour des pains au levain naturel et des viennoiseries bio avec des ingrédients locaux et des recettes traditionnelles transmises de génération en génération.",
            "Notre voyage a commencé avec un rêve simple : partager le goût du vrai pain avec notre communauté. Aujourd'hui, nous continuons cette tradition avec chaque pain que nous créons, chaque client que nous accueillons.",
        ],
        "menu_categories": ["Pains", "Viennoiseries", "Pâtisseries", "Boissons", "Spécialités"],
        "menu_items": [
            {"name": "Pain au Levain Naturel", "description": "Notre pain signature — levain vivant, farine bio, cuisson au four à bois.", "price": "$8", "tags": ["Signature", "Bio"]},
            {"name": "Croissant au Beurre", "description": "Croissant feuilleté au beurre AOP, croustillant à l'extérieur, fondant à l'intérieur.", "price": "$4.50", "tags": ["Classique"]},
            {"name": "Pain au Chocolat", "description": "Pâte levée feuilletée avec chocolat noir 70% artisanal.", "price": "$5", "tags": ["Populaire"]},
            {"name": "Baguette Tradition", "description": "Baguette à la farine de tradition française, croûte dorée et mie alvéolée.", "price": "$3.50", "tags": ["Quotidien"]},
            {"name": "Tarte aux Fruits", "description": "Tarte sablée avec crème pâtissière vanille et fruits de saison.", "price": "$32", "tags": ["Pâtisserie", "Saison"]},
            {"name": "Éclair au Café", "description": "Pâte à choux garnie de crème au beurre café et glaçage fondant.", "price": "$6", "tags": ["Pâtisserie"]},
            {"name": "Saucisson Sec Artisanal", "description": "Saucisson séché maison, affiné 4 semaines, goût intense etauthentique.", "price": "$28/kg", "tags": ["Charcuterie"]},
            {"name": "Café Espresso", "description": "Café torréfié artisanal, intensity et arômes d'exception.", "price": "$4", "tags": ["Boisson"]},
        ],
        "testimonial_title": "Ce que disent nos Clients",
        "testimonials": [
            {"quote": "Le meilleur pain au levain que j'ai goûté. La croûte est parfaite et le goût est incomparable.", "author_name": "Marie L.", "author_title": "Cliente fidèle", "stars": 5},
            {"quote": "Nous venons chaque samedi matin pour les croissants. C'est devenu notre ritual du weekend!", "author_name": "Thomas & Sophie", "author_title": "Réguliers", "stars": 5},
            {"quote": "Une boulangerie qui respecte les traditions. On sent la passion dans chaque bouchée.", "author_name": "Pierre D.", "author_title": "Avis Google", "stars": 5},
        ],
        "reservation_text": "Venez nous rendre visite dès 7h du matin! Commandes spéciales et gâteaux sur mesure disponibles sur demande.",
    },
    "beauty": {
        "hero_titles": [
            "Where Beauty Meets Artistry",
            "Your Transformation Begins Here",
            "Experience the Art of Beauty",
            "Radiance, Redefined",
        ],
        "hero_subtitles": [
            "Expert care, premium products, and a relaxing environment.",
            "Luxury treatments tailored to your unique beauty.",
            "Professional services in an elegant setting.",
            "Discover your most beautiful self.",
        ],
        "about_titles": [
            "Our Philosophy",
            "The Art of Beauty",
            "Dedicated to Your Glow",
            "Where Care Meets Craft",
        ],
        "about_texts": [
            "We believe that beauty is an art form. Our team of skilled professionals combines expertise with passion to deliver results that exceed expectations. Every treatment is tailored to your unique needs.",
            "Step into a world where luxury meets expertise. Our studio is designed to be your sanctuary — a place where you can relax, rejuvenate, and emerge feeling your absolute best.",
        ],
        "menu_categories": ["Hair", "Skin", "Nails", "Massage", "Packages"],
        "menu_items": [
            {"name": "Precision Cut & Style", "description": "Expert cut tailored to your face shape and lifestyle, includes consultation and styling.", "price": "$65", "tags": ["Popular"]},
            {"name": "Color & Highlights", "description": "Full color or balayage with premium products for vibrant, lasting results.", "price": "$120", "tags": ["Signature"]},
            {"name": "Classic Facial", "description": "Deep cleansing facial with extraction, mask, and hydration for glowing skin.", "price": "$85", "tags": ["Relaxing"]},
            {"name": "Gel Manicure", "description": "Long-lasting gel polish application with cuticle care and hand massage.", "price": "$45", "tags": ["Quick"]},
            {"name": "Deep Tissue Massage", "description": "60-minute therapeutic massage to release tension and restore balance.", "price": "$95", "tags": ["Wellness"]},
            {"name": "Bridal Package", "description": "Complete beauty package for your special day: hair, nails, and makeup.", "price": "$350", "tags": ["Special"]},
        ],
        "testimonial_title": "Our Clients Love Us",
        "testimonials": [
            {"quote": "The best salon experience I've ever had. The staff is incredibly skilled and the atmosphere is so relaxing.", "author_name": "Emma T.", "author_title": "Client since 2023", "stars": 5},
            {"quote": "I've been coming here for years and they never disappoint. My color always looks amazing!", "author_name": "Jessica L.", "author_title": "Regular Client", "stars": 5},
            {"quote": "Professional, welcoming, and the results speak for themselves. I always leave feeling beautiful.", "author_name": "Amanda K.", "author_title": "Yelp Review", "stars": 5},
        ],
        "reservation_text": "Book your appointment online or give us a call. New clients receive 15% off their first visit.",
    },
    "coach": {
        "hero_titles": [
            "Unlock Your Full Potential",
            "Strategic Growth, Delivered",
            "Transform Your Business Today",
            "Expert Guidance for Bold Results",
        ],
        "hero_subtitles": [
            "Professional coaching and consulting for ambitious leaders.",
            "Data-driven strategies that accelerate growth.",
            "Personalized guidance to achieve breakthrough results.",
            "Where expertise meets your vision.",
        ],
        "about_titles": [
            "Our Approach",
            "Results-Driven Consulting",
            "Your Success, Our Mission",
            "Strategic Partnerships That Deliver",
        ],
        "about_texts": [
            "We partner with ambitious leaders and organizations to unlock growth, optimize operations, and achieve measurable results. Our approach combines strategic insight with practical execution.",
            "With decades of experience across industries, we bring a proven framework to every engagement. Our clients see results — not just recommendations.",
        ],
        "menu_categories": ["Services", "Programs", "Workshops"],
        "menu_items": [
            {"name": "Strategic Planning Session", "description": "Comprehensive strategy session to align your team and define clear growth objectives.", "price": "$500", "tags": ["1-Day"]},
            {"name": "Executive Coaching", "description": "One-on-one coaching for leaders looking to maximize their impact and performance.", "price": "$2,500/mo", "tags": ["Monthly"]},
            {"name": "Team Workshop", "description": "Interactive workshop for teams to improve communication, collaboration, and results.", "price": "$1,500", "tags": ["Half-Day"]},
            {"name": "Business Assessment", "description": "Deep-dive analysis of your operations, market position, and growth opportunities.", "price": "$800", "tags": ["Analysis"]},
            {"name": "Digital Transformation", "description": "End-to-end guidance for modernizing your business with technology.", "price": "$5,000", "tags": ["Project"]},
        ],
        "testimonial_title": "Success Stories",
        "testimonials": [
            {"quote": "Working with this team transformed our business. Revenue increased 40% in just 6 months.", "author_name": "David Chen", "author_title": "CEO, TechFlow Inc.", "stars": 5},
            {"quote": "Strategic, insightful, and results-oriented. They don't just advise — they deliver.", "author_name": "Maria Santos", "author_title": "COO, Growth Labs", "stars": 5},
            {"quote": "The best investment we've made in our leadership team. Clear ROI within 90 days.", "author_name": "Robert Kim", "author_title": "VP Operations, ScaleUp", "stars": 5},
        ],
        "reservation_text": "Schedule a free discovery call to discuss how we can help you achieve your goals.",
    },
}

# ─── Main Function ─────────────────────────────────────────

def generate_content(
    brand_data: Dict[str, Any],
    intake_data: Dict[str, Any],
    template_id: str = "restaurant_premium"
) -> Dict[str, Any]:
    """
    Generate website content based on brand data and template.
    
    Args:
        brand_data: Output from brand agent
        intake_data: Output from intake agent
        template_id: Selected template ID
    
    Returns:
        Dict with hero, sections, menu, testimonials, social posts
    """
    brand_name = brand_data.get("brand_name", "Brand")
    category = brand_data.get("category", "restaurant")
    
    # Get content template
    template = CONTENT_TEMPLATES.get(category, CONTENT_TEMPLATES["restaurant"])
    
    # Generate hero content
    hero_idx = hash(brand_name) % len(template["hero_titles"])
    hero_title = template["hero_titles"][hero_idx]
    hero_subtitle = template["hero_subtitles"][hero_idx % len(template["hero_subtitles"])]
    
    # Generate about content
    about_idx = hash(brand_name + "about") % len(template["about_titles"])
    about_title = template["about_titles"][about_idx]
    about_text = template["about_texts"][about_idx % len(template["about_texts"])]
    
    # Use template menu items (customized with brand name)
    menu_items = template["menu_items"]
    menu_categories = template["menu_categories"]
    
    # Use template testimonials
    testimonials = template["testimonials"]
    
    # Generate social posts
    social_posts = _generate_social_posts(brand_name, category, brand_data.get("visual_style", ""))
    
    return {
        "hero_title": hero_title,
        "hero_subtitle": hero_subtitle,
        "hero_description": f"{brand_data.get('positioning', 'Where quality meets excellence')}.",
        "cta_text": "Reserve a Table" if category == "restaurant" else "Book Now" if category == "beauty" else "Get Started",
        "about_title": about_title,
        "about_text": about_text,
        "about_text_2": f"{brand_name} is more than a {category} — it's a place where tradition meets community, and every visit feels like coming home.",
        "menu_title": "Notre Carte" if category == "bakery" else "Our Menu" if category == "restaurant" else "Our Services" if category == "beauty" else "Our Services",
        "menu_subtitle": "Découvrez notre sélection" if category == "bakery" else "Discover our carefully crafted selection" if category == "restaurant" else "Explore what we offer",
        "menu_categories": menu_categories,
        "menu_items": menu_items,
        "gallery_title": "Gallery",
        "gallery_subtitle": f"Discover the {brand_name} experience through our lens",
        "reservation_title": "Visitez-nous" if category == "bakery" else "Make a Reservation" if category == "restaurant" else "Book an Appointment" if category == "beauty" else "Get in Touch",
        "reservation_text": template["reservation_text"],
        "testimonial_title": template["testimonial_title"],
        "testimonials": testimonials,
        "contact_title": "Get in Touch",
        "contact_text": f"Have a question or want to make a reservation? We'd love to hear from you.",
        "contact_address": "123 Main Street, Downtown, NY 10001",
        "contact_phone": "+1 (555) 123-4567",
        "contact_email": f"hello@{brand_name.lower().replace(' ', '')}.com",
        "contact_hours": "Mon-Sun: 11:00 AM - 10:00 PM",
        "footer_description": f"{brand_name} — {brand_data.get('positioning', 'Where quality meets excellence.')}",
        "social_posts": social_posts,
        "years_experience": 10 + (hash(brand_name) % 15),
    }


def _generate_social_posts(brand_name: str, category: str, visual_style: str) -> List[Dict[str, Any]]:
    """Generate social media posts."""
    posts = {
        "restaurant": [
            {
                "platform": "Instagram",
                "caption": f"Welcome to {brand_name}! Discover authentic flavors crafted with love. Reserve your table today! 🍝✨",
                "image_prompt": f"Fresh handmade pasta on a rustic table, warm golden light, {brand_name} style",
                "hashtags": ["#ItalianRestaurant", "#FreshPasta", "#FoodLovers", "#DiningOut"]
            },
            {
                "platform": "Instagram",
                "caption": f"Behind the scenes at {brand_name}: Watch our chefs prepare your favorite dishes from scratch. 👨‍🍳🔥",
                "image_prompt": f"Chef cooking in a warm kitchen, flames, authentic restaurant atmosphere",
                "hashtags": ["#ChefLife", "#BehindTheScenes", "#FreshFood", "#Cooking"]
            },
            {
                "platform": "Facebook",
                "caption": f"New season, new menu! {brand_name} brings you the best of Italian cuisine with locally sourced ingredients. Come taste the difference! 🌿",
                "image_prompt": f"Beautiful restaurant interior, warm lighting, happy guests dining",
                "hashtags": ["#SeasonalMenu", "#FarmToTable", "#ItalianFood", "#Restaurant"]
            },
        ],
        "bakery": [
            {
                "platform": "Instagram",
                "caption": f"Le four tourne à {brand_name}! 🥐✨ Fraîcheur du jour, chaque matin.",
                "image_prompt": f"Fresh pastries coming out of oven, warm golden light, artisan bakery",
                "hashtags": ["#BoulangerieArtisanale", "#Croissants", "#PainFrais"]
            },
            {
                "platform": "TikTok",
                "caption": f"POV: Tu rentres dans {brand_name} et tu sens le pain frais 🍞🔥",
                "image_prompt": f"Quick bakery tour, fresh bread, warm atmosphere",
                "hashtags": ["#BoulangerieTikTok", "#PainAuLevain", "#Artisanat"]
            },
            {
                "platform": "Facebook",
                "caption": f"Chaque matin, {brand_name} vous accueille avec le meilleur pain artisanal de la région. Venez nous voir! 🌾",
                "image_prompt": f"Warm bakery interior, display of fresh bread and pastries",
                "hashtags": ["#Boulangerie", "#PainArtisanal", "#Local"]
            },
        ],
        "beauty": [
            {
                "platform": "Instagram",
                "caption": f"Your transformation starts at {brand_name}. Expert care, stunning results. Book your appointment now! 💫",
                "image_prompt": f"Luxury salon interior, soft lighting, elegant decor",
                "hashtags": ["#BeautySalon", "#HairTransformation", "#GlowUp", "#SelfCare"]
            },
            {
                "platform": "Instagram",
                "caption": f"Behind the chair at {brand_name}: Where artistry meets precision. See what we can do for you! ✂️✨",
                "image_prompt": f"Professional hairstylist working, salon environment, artistic styling",
                "hashtags": ["#Hairstylist", "#SalonLife", "#HairArt", "#Beauty"]
            },
        ],
        "coach": [
            {
                "platform": "LinkedIn",
                "caption": f"Ready to unlock your potential? {brand_name} helps leaders achieve breakthrough results through strategic guidance. Let's connect! 🚀",
                "image_prompt": f"Professional coaching session, modern office, collaborative environment",
                "hashtags": ["#Leadership", "#BusinessGrowth", "#Coaching", "#Success"]
            },
            {
                "platform": "Twitter",
                "caption": f"Great strategies aren't built in isolation. At {brand_name}, we partner with you to turn vision into results. #BusinessStrategy",
                "image_prompt": f"Strategic planning meeting, whiteboard, team collaboration",
                "hashtags": ["#Strategy", "#Consulting", "#Business", "#Growth"]
            },
        ],
    }
    
    return posts.get(category, posts["restaurant"])


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_brand = {
        "brand_name": "Casa Verona",
        "category": "restaurant",
        "positioning": "Authentic Italian dining with a warm, premium atmosphere.",
        "visual_style": "rustic Italian trattoria, cinematic warm light"
    }
    test_intake = {
        "business_type": "Italian restaurant",
        "tone": "warm, premium"
    }
    result = generate_content(test_brand, test_intake)
    print("Content generated:")
    print(f"  Hero: {result['hero_title']}")
    print(f"  Menu items: {len(result['menu_items'])}")
    print(f"  Social posts: {len(result['social_posts'])}")
    print(f"  Testimonials: {len(result['testimonials'])}")
